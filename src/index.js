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
 * This is the method called by projext when loading the plugin and it takes care of registering
 * the Webpack build engine service and all the other services the engine depends on.
 * @param {Projext} app The projext main container.
 * @ignore
 */
const loadPlugin = (app) => {
  /**
   * These will be used when defining the external dependencies of a Node target. Since their names
   * don't match a dependency of the `package.json`, if not defined, webpack would try to bundle
   * the plugin and all its dependencies.
   */
  app.set('webpackDefaultExternals', () => [
    `${name}/express`,
    `${name}/jimpex`,
  ]);
  // Register the main services of the build engine.
  app.register(webpackConfiguration);
  app.register(webpackBuildEngine);

  // Register the services for building the targets confirmations.
  app.register(webpackBaseConfiguration);
  app.register(webpackBrowserDevelopmentConfiguration);
  app.register(webpackBrowserProductionConfiguration);
  app.register(webpackRulesConfiguration);
  app.register(webpackNodeDevelopmentConfiguration);
  app.register(webpackNodeProductionConfiguration);

  app.register(webpackMiddlewares);
};

module.exports = loadPlugin;
