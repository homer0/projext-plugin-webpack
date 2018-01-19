const {
  webpackConfiguration,
  webpackBuildEngine,
} = require('./services/building');

const {
  webpackBaseConfiguration,
  webpackBrowserDevelopmentConfiguration,
  webpackBrowserProductionConfiguration,
  webpackLoadersConfiguration,
  webpackNodeDevelopmentConfiguration,
  webpackNodeProductionConfiguration,
} = require('./services/configurations');

const {
  webpackMiddlewares,
} = require('./services/server');
/**
 * This is the method called by Woopack when loading the plugin and it takes care of registering
 * the Webpack build engine service and all the other services the engine depends on.
 * @param {Woopack} app The Woopack main container.
 * @ignore
 */
const loadPlugin = (app) => {
  app.register(webpackConfiguration);
  app.register(webpackBuildEngine);

  app.register(webpackBaseConfiguration);
  app.register(webpackBrowserDevelopmentConfiguration);
  app.register(webpackBrowserProductionConfiguration);
  app.register(webpackLoadersConfiguration);
  app.register(webpackNodeDevelopmentConfiguration);
  app.register(webpackNodeProductionConfiguration);

  app.register(webpackMiddlewares);
};

module.exports = loadPlugin;
