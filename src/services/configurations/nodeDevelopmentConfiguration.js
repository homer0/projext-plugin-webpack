const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const {
  NoEmitOnErrorsPlugin,
} = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../abstracts/configurationFile');
const { ProjextWebpackBundleRunner } = require('../../plugins');
/**
 * Creates the specifics of a Webpack configuration for a Node target development build.
 * @extends {ConfigurationFile}
 */
class WebpackNodeDevelopmentConfiguration extends ConfigurationFile {
  /**
   * Class constructor.
   * @param {Logger}                   appLogger                To send the plugin that executes
   *                                                            the bundle in order to log
   *                                                            information messages.
   * @param {Events}                   events                   To reduce the configuration.
   * @param {PathUtils}                pathUtils                Required by `ConfigurationFile`
   *                                                            in order to build the path to
   *                                                            the overwrite file.
   * @param {WebpackBaseConfiguration} webpackBaseConfiguration The configuration this one will
   *                                                            extend.
   */
  constructor(
    appLogger,
    events,
    pathUtils,
    webpackBaseConfiguration
  ) {
    super(
      pathUtils,
      [
        'config/webpack/node.development.config.js',
        'config/webpack/node.config.js',
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
  }
  /**
   * Create the configuration with the `entry`, the `output` and the plugins specifics for a
   * Node target development build.
   * This method uses the reducer events `webpack-node-development-configuration` and
   * `webpack-node-configuration`. It sends the configuration, the received `params` and expects
   * a configuration on return.
   * @param {WebpackConfigurationParams} params A dictionary generated by the top service building
   *                                            the configuration and that includes things like the
   *                                            target information, its entry settings, output
   *                                            paths, etc.
   * @return {object}
   */
  createConfig(params) {
    const {
      entry,
      target,
      output,
      copy,
      additionalWatch,
    } = params;
    // By default it doesn't watch the source files.
    let watch = false;
    // Setup the basic plugins.
    const plugins = [
      // To avoid pushing assets with errors.
      new NoEmitOnErrorsPlugin(),
      // To optimize the SCSS and remove repeated declarations.
      new OptimizeCssAssetsPlugin(),
      // Copy the files the target specified on its settings.
      new CopyWebpackPlugin(copy),
      // If there are additionals files to watch, add the plugin for it.
      ...(
        additionalWatch.length ?
          [new ExtraWatchWebpackPlugin({ files: additionalWatch })] :
          []
      ),
    ];
    // If the target needs to run on development...
    if (target.runOnDevelopment) {
      // ...watch the source files.
      watch = true;
      // Push the plugin that executes the target bundle.
      plugins.push(new ProjextWebpackBundleRunner({
        logger: this.appLogger,
        inspect: target.inspect,
      }));
    } else if (target.watch.development) {
      // Enable the watch mode if required.
      watch = true;
    }
    // Define the rest of the configuration.
    const config = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        chunkFilename: output.jsChunks,
        publicPath: '/',
      },
      watch,
      plugins,
      target: 'node',
      node: {
        // Avoid getting an empty `__dirname`.
        __dirname: false,
      },
      mode: 'development',
    };
    // If the target has source maps enabled...
    if (target.sourceMap.development) {
      // ...configure the devtool
      config.devtool = 'source-map';
    }
    // Reduce the configuration.
    return this.events.reduce(
      [
        'webpack-node-development-configuration',
        'webpack-node-configuration',
      ],
      config,
      params
    );
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `WebpackNodeDevelopmentConfiguration` as the `webpackNodeDevelopmentConfiguration` service.
 * @example
 * // Register it on the container
 * container.register(webpackNodeDevelopmentConfiguration);
 * // Getting access to the service instance
 * const webpackNodeDevConfig = container.get('webpackNodeDevelopmentConfiguration');
 * @type {Provider}
 */
const webpackNodeDevelopmentConfiguration = provider((app) => {
  app.set(
    'webpackNodeDevelopmentConfiguration',
    () => new WebpackNodeDevelopmentConfiguration(
      app.get('appLogger'),
      app.get('events'),
      app.get('pathUtils'),
      app.get('webpackBaseConfiguration')
    )
  );
});

module.exports = {
  WebpackNodeDevelopmentConfiguration,
  webpackNodeDevelopmentConfiguration,
};
