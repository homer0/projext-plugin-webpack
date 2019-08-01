const {
  webpackConfiguration,
  webpackBuildEngine,
} = require('./services/building');

const {
  webpackBaseConfiguration,
  webpackBrowserDevelopmentConfiguration,
  webpackBrowserProductionConfiguration,
  webpackRulesConfiguration,
  webpackNodeDevelopmentConfiguration,
  webpackNodeProductionConfiguration,
} = require('./services/configurations');

const {
  webpackMiddlewares,
} = require('./services/server');

const { name } = require('../package.json');
/**
 * This is the method called by projext when loading the plugin. It takes care of registering
 * the Webpack build engine service and all the other services the engine depends on.
 * @param {Projext} app The projext main container.
 * @ignore
 */
const loadPlugin = (app) => {
  /**
   * This define the basic information of the plugin for other services to use:
   * - The name of the plugin.
   * - Where the `webpack.config.js` file is located.
   * - The subpaths the plugin expose. Since they won't match a dependency on the `package.json`,
   *   a Node target may want to include them while bundling.
   */
  app.set('webpackPluginInfo', () => ({
    name,
    configuration: 'src/webpack.config.js',
    external: [
      'express',
      'jimpex',
    ],
    babelPolyfill: 'polyfill.js',
  }));
  // Register the main services of the build engine.
  app.register(webpackConfiguration);
  app.register(webpackBuildEngine);

  // Register the services for building the targets configurations.
  app.register(webpackBaseConfiguration);
  app.register(webpackBrowserDevelopmentConfiguration);
  app.register(webpackBrowserProductionConfiguration);
  app.register(webpackRulesConfiguration);
  app.register(webpackNodeDevelopmentConfiguration);
  app.register(webpackNodeProductionConfiguration);

  // Register the service for server integration.
  app.register(webpackMiddlewares);
};

module.exports = loadPlugin;
