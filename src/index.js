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
/**
 * This is the method called by projext when loading the plugin and it takes care of registering
 * the Webpack build engine service and all the other services the engine depends on.
 * @param {Projext} app The projext main container.
 * @ignore
 */
const loadPlugin = (app) => {
  app.register(webpackConfiguration);
  app.register(webpackBuildEngine);

  app.register(webpackBaseConfiguration);
  app.register(webpackBrowserDevelopmentConfiguration);
  app.register(webpackBrowserProductionConfiguration);
  app.register(webpackRulesConfiguration);
  app.register(webpackNodeDevelopmentConfiguration);
  app.register(webpackNodeProductionConfiguration);

  app.register(webpackMiddlewares);
};

module.exports = loadPlugin;
