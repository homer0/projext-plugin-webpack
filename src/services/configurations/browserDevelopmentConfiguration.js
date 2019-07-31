const path = require('path');
const ObjectUtils = require('wootils/shared/objectUtils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const {
  NoEmitOnErrorsPlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
} = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../abstracts/configurationFile');
const {
  ProjextWebpackOpenDevServer,
  ProjextWebpackRuntimeDefinitions,
} = require('../../plugins');
/**
 * Creates the specifics of a Webpack configuration for a browser target development build.
 * @extends {ConfigurationFile}
 */
class WebpackBrowserDevelopmentConfiguration extends ConfigurationFile {
  /**
   * Class constructor.
   * @param {Logger}                   appLogger                To send to the dev server plugin
   *                                                            in order to log its events.
   * @param {Events}                   events                   To reduce the configuration.
   * @param {PathUtils}                pathUtils                Required by `ConfigurationFile`
   *                                                            in order to build the path to the
   *                                                            overwrite file.
   * @param {TargetsHTML}              targetsHTML              The service in charge of generating
   *                                                            a default HTML file in case the
   *                                                            target doesn't have one.
   * @param {WebpackBaseConfiguration} webpackBaseConfiguration The configuration this one will
   *                                                            extend.
   * @param {WebpackPluginInfo}        webpackPluginInfo        To get the name of the plugin and
   *                                                            use it on the webpack hook that
   *                                                            logs the dev server URL when it
   *                                                            finishes bundling.
   */
  constructor(
    appLogger,
    events,
    pathUtils,
    targetsHTML,
    webpackBaseConfiguration,
    webpackPluginInfo
  ) {
    super(
      pathUtils,
      [
        'config/webpack/browser.development.config.js',
        'config/webpack/browser.config.js',
      ],
      true,
      webpackBaseConfiguration
    );
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference for the `targetsHTML` service.
     * @type {TargetsHTML}
     */
    this.targetsHTML = targetsHTML;
    /**
     * A local reference for the plugin information.
     * @type {WebpackPluginInfo}
     */
    this.webpackPluginInfo = webpackPluginInfo;
  }
  /**
   * Create the configuration with the `entry`, the `output` and the plugins specifics for a
   * browser target development build. It also checks if it should enable source map and the
   * dev server based on the target information.
   * This method uses the reducer events `webpack-browser-development-configuration` and
   * `webpack-browser-configuration`. It sends the configuration, the received `params` and
   * expects a configuration on return.
   * @param {WebpackConfigurationParams} params A dictionary generated by the top service building
   *                                            the configuration and that includes things like the
   *                                            target information, its entry settings, output
   *                                            paths, etc.
   * @return {object}
   */
  createConfig(params) {
    const {
      definitions,
      copy,
      entry,
      target,
      output,
      additionalWatch,
    } = params;
    // Define the basic stuff: entry, output and mode.
    const config = {
      entry: ObjectUtils.copy(entry),
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        chunkFilename: output.jsChunks,
        publicPath: '/',
      },
      mode: 'development',
    };
    // If the target has source maps enabled...
    if (target.sourceMap.development) {
      // ...configure the devtool
      config.devtool = 'source-map';
    }
    // Setup the plugins.
    config.plugins = [
      // To automatically inject the `script` tag on the target `html` file.
      new HtmlWebpackPlugin(Object.assign({}, target.html, {
        template: this.targetsHTML.getFilepath(target),
        inject: 'body',
      })),
      // To add the `async` attribute to the  `script` tag.
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async',
      }),
      // If the target uses hot replacement, add the plugin.
      ...(target.hot ? [new NamedModulesPlugin(), new HotModuleReplacementPlugin()] : []),
      // To avoid pushing assets with errors.
      new NoEmitOnErrorsPlugin(),
      // To add the _'browser env variables'_.
      new ProjextWebpackRuntimeDefinitions(
        Object.keys(entry).reduce(
          (current, key) => [...current, ...entry[key].filter((file) => path.isAbsolute(file))],
          []
        ),
        definitions
      ),
      // To optimize the SCSS and remove repeated declarations.
      new OptimizeCssAssetsPlugin(),
      // Copy the files the target specified on its settings.
      new CopyWebpackPlugin(copy),
      /**
       * If the target doesn't inject the styles on runtime, add the plugin to push them all on
       * a single file.
       */
      ...(
        target.css.inject ?
          [] :
          [new MiniCssExtractPlugin({
            filename: output.css,
          })]
      ),
      // If there are additionals files to watch, add the plugin for it.
      ...(
        additionalWatch.length ?
          [new ExtraWatchWebpackPlugin({ files: additionalWatch })] :
          []
      ),
    ];
    // Define a list of extra entries that may be need depending on the target HMR configuration.
    const hotEntries = [];
    // If the target needs to run on development...
    if (target.runOnDevelopment) {
      const devServerConfig = this._normalizeTargetDevServerSettings(target);
      // Add the dev server information to the configuration.
      config.devServer = {
        port: devServerConfig.port,
        inline: !!devServerConfig.reload,
        open: false,
        historyApiFallback: devServerConfig.historyApiFallback,
      };
      // If the configuration has a custom host, set it.
      if (devServerConfig.host !== 'localhost') {
        config.devServer.host = devServerConfig.host;
      }
      // If there are SSL files, set them on the server.
      if (devServerConfig.ssl) {
        config.devServer.https = {
          key: devServerConfig.ssl.key,
          cert: devServerConfig.ssl.cert,
          ca: devServerConfig.ssl.ca,
        };
      }
      // If the server is being proxied, add the public host.
      if (devServerConfig.proxied) {
        config.devServer.public = devServerConfig.proxied.host;
      }
      // If the target will run with the dev server and it requires HMR...
      if (target.hot) {
        // Disable the `inline` mode.
        config.devServer.inline = false;
        // Set the public path to `/`, as required by HMR.
        config.devServer.publicPath = '/';
        // Enable the dev server `hot` setting.
        config.devServer.hot = true;
        // Push the required entries to enable HMR on the dev server.
        hotEntries.push(...[
          `webpack-dev-server/client?${devServerConfig.url}`,
          'webpack/hot/only-dev-server',
        ]);
      }
      // Push the plugin that logs the dev server statuses and opens the browser.
      config.plugins.push(new ProjextWebpackOpenDevServer(
        (devServerConfig.proxied ? devServerConfig.proxied.url : devServerConfig.url),
        {
          logger: this.appLogger,
          openBrowser: devServerConfig.open,
        }
      ));
    } else if (target.hot) {
      /**
       * If the target requires HMR but is not running with the dev server, it means that there's
       * an Express or Jimpex target that implements the `webpack-hot-middleware`, so we push it
       * required entry to the list.
       */
      hotEntries.push('webpack-hot-middleware/client?reload=true');
    } else if (target.watch.development) {
      /**
       * If the target is not running nor it requires HMR (which means is not being served either),
       * and the watch parameter is `true`, enable the watch mode.
       */
      config.watch = true;
    }
    // If there are entries for HMR...
    if (hotEntries.length) {
      // Get target entry name.
      const [entryName] = Object.keys(entry);
      // Get the list of entries for the target.
      const entries = config.entry[entryName];
      // Check if the Babel polyfill is present, since it always needs to be first.
      const polyfillIndex = entries
      .indexOf(`${this.webpackPluginInfo.name}/${this.webpackPluginInfo.babelPolyfill}`);
      // If the `babel-polyfill` is present...
      if (polyfillIndex > -1) {
        // ...push all the _"hot entries"_ after it.
        entries.splice(polyfillIndex + 1, 0, ...hotEntries);
      } else {
        // ...push all the _"hot entries"_ on top of the existing entries.
        entries.unshift(...hotEntries);
      }
    }

    // Reduce the configuration
    return this.events.reduce(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      config,
      params
    );
  }
  /**
   * Check a target dev server settings in order to validate those that needs to be removed or
   * completed with their default values.
   * @param {Target} target The target information.
   * @return {TargetDevServerSettings}
   * @access protected
   * @ignore
   */
  _normalizeTargetDevServerSettings(target) {
    // Get a new copy of the config to work with.
    const config = ObjectUtils.copy(target.devServer);
    /**
     * Set a flag to know if at least one SSL file was sent.
     * This flag is also used when reading the `proxied` settings to determine the default
     * behaviour of `proxied.https`.
     */
    let hasASSLFile = false;
    // Loop all the SSL files...
    Object.keys(config.ssl).forEach((name) => {
      const file = config.ssl[name];
      // If there's an actual path...
      if (typeof file === 'string') {
        // ...set the flag to `true`.
        hasASSLFile = true;
        // Generate the path to the file.
        config.ssl[name] = this.pathUtils.join(file);
      }
    });
    // If no SSL file was sent, just remove the settings.
    if (!hasASSLFile) {
      delete config.ssl;
    }
    /**
     * Define whether to build a proxied URL for the plugin that opens the browser or not. The
     * reason for this is that when the server is proxied but the host is not defined, it will use
     * the dev server host, and in that case, it should include the port too, something that
     * wouldn't be necessary when the proxied host is specified.
     */
    let buildProxiedURL = true;
    // If the server is being proxied...
    if (config.proxied.enabled) {
      // ...if no `host` was specified, use the one defined for the server.
      if (config.proxied.host === null) {
        config.proxied.host = config.host;
        buildProxiedURL = false;
      }
      // If no `https` option was specified, set it to `true` if at least one SSL file was sent.
      if (config.proxied.https === null) {
        config.proxied.https = hasASSLFile;
      }
      // If a custom proxied host was specified, build the new URL.
      if (buildProxiedURL) {
        // Build the proxied URL.
        const proxiedProtocol = config.proxied.https ? 'https' : 'http';
        config.proxied.url = `${proxiedProtocol}://${config.proxied.host}`;
      }
    } else {
      // ...otherwise, just remove the setting.
      delete config.proxied;
    }

    const protocol = config.ssl ? 'https' : 'http';
    config.url = `${protocol}://${config.host}:${config.port}`;
    /**
     * If the server is proxied, but without a custom host, copy the dev server URL into the
     * proxied settings.
     */
    if (config.proxied && !buildProxiedURL) {
      config.proxied.url = config.url;
    }

    return config;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `WebpackBrowserDevelopmentConfiguration` as the `webpackBrowserDevelopmentConfiguration` service.
 * @example
 * // Register it on the container
 * container.register(webpackBrowserDevelopmentConfiguration);
 * // Getting access to the service instance
 * const webpackBrowserDevConfig = container.get('webpackBrowserDevelopmentConfiguration');
 * @type {Provider}
 */
const webpackBrowserDevelopmentConfiguration = provider((app) => {
  app.set(
    'webpackBrowserDevelopmentConfiguration',
    () => new WebpackBrowserDevelopmentConfiguration(
      app.get('appLogger'),
      app.get('events'),
      app.get('pathUtils'),
      app.get('targetsHTML'),
      app.get('webpackBaseConfiguration'),
      app.get('webpackPluginInfo')
    )
  );
});

module.exports = {
  WebpackBrowserDevelopmentConfiguration,
  webpackBrowserDevelopmentConfiguration,
};
