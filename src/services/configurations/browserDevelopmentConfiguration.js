const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {
  NoEmitOnErrorsPlugin,
  DefinePlugin,
  HotModuleReplacementPlugin,
} = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../interfaces/configurationFile');

class WebpackBrowserDevelopmentConfiguration extends ConfigurationFile {
  constructor(
    appLogger,
    events,
    pathUtils,
    projectConfiguration,
    webpackBaseConfiguration
  ) {
    super(
      pathUtils,
      'webpack/browser.development.config.js',
      true,
      webpackBaseConfiguration
    );
    this.appLogger = appLogger;
    this.events = events;
    this.projectConfiguration = projectConfiguration;
  }

  createConfig(params) {
    const {
      definitions,
      entry,
      target,
    } = params;
    const { paths: { output } } = this.projectConfiguration;

    const config = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: `${output.js}/[name].js`,
        publicPath: '/',
      },
    };

    if (target.hot) {
      const [entryName] = Object.keys(entry);
      config.entry[entryName].unshift('webpack-hot-middleware/client?reload=true');
    }

    if (target.sourceMap.development) {
      config.devtool = 'source-map';
    }

    config.plugins = [
      new ExtractTextPlugin(`${output.css}/${target.name}.css`),
      new HtmlWebpackPlugin(Object.assign({}, target.html, {
        template: path.join(target.paths.source, target.html.template),
        inject: 'body',
      })),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async',
      }),
      ...(target.hot ? [new HotModuleReplacementPlugin()] : []),
      new NoEmitOnErrorsPlugin(),
      new DefinePlugin(definitions),
      new OptimizeCssAssetsPlugin(),
    ];

    if (target.runOnDevelopment) {
      const { devServer } = target;
      config.devServer = {
        port: devServer.port || 2509,
        inline: devServer.reload,
        open: true,
      };

      config.plugins.push(this._getDevServerLogger(config.devServer));
    }

    return this.events.reduce(
      'webpack-browser-development-configuration',
      config,
      params
    );
  }

  _getDevServerLogger(devServer) {
    const { port } = devServer;
    return {
      apply: (compiler) => {
        compiler.plugin('compile', () => {
          this.appLogger.success(`Starting on port ${port}`);
          this.appLogger.warning('waiting for Webpack...');
        });

        compiler.plugin('done', () => {
          // Awful hack, but the webpack output gets on the same line
          setTimeout(() => {
            this.appLogger.success(`You app is running on the port ${port}`);
          }, 0);
        });
      },
    };
  }
}

const webpackBrowserDevelopmentConfiguration = provider((app) => {
  app.set(
    'webpackBrowserDevelopmentConfiguration',
    () => new WebpackBrowserDevelopmentConfiguration(
      app.get('appLogger'),
      app.get('events'),
      app.get('pathUtils'),
      app.get('projectConfiguration').getConfig(),
      app.get('webpackBaseConfiguration')
    )
  );
});

module.exports = {
  WebpackBrowserDevelopmentConfiguration,
  webpackBrowserDevelopmentConfiguration,
};
