const woopack = require('woopack');
/**
 * Implements the Webpack middlewares for a target on an Express app.
 * @param {Express} expressApp The app where the middlewares are going to be `use`d.
 * @param {string}  targetName The name of the target for which the middlewares are for.
 * @return {MiddlewaresInformation}
 */
const useExpress = (expressApp, targetName) => {
  // Get the middlewares service.
  const webpackMiddlewares = woopack.get('webpackMiddlewares');
  // Generate the middlewares for the target.
  const info = webpackMiddlewares.generate(targetName);
  // Loop all the received middlewares...
  info.middlewares.forEach((middleware) => {
    // ...and register them on the app.
    expressApp.use(middleware());
  });

  return info;
};

module.exports = useExpress;
