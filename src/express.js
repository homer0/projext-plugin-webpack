const woopack = require('woopack/index');
/**
 * Implements the Webpack middlewares for a target on an Express app.
 * @param {Express} expressApp    The app where the middlewares are going to be `use`d.
 * @param {string}  targetToBuild The name of the target that will be builded on the middleware(s).
 * @param {string}  targetToServe The name of the target that will implement the middleware(s). When
 *                                the other target is builded, it will assume that is on the
 *                                distribution directory, and if the target serving it is being
 *                                executed from the source directory it won't be able to use the
 *                                dev middleware file system without hardcoding some relatives paths
 *                                from the build to the source; to avoid that, the method gets
 *                                the build path of this target, so when using `getDirectory()`, it
 *                                will think they are both on the distribution directory and the
 *                                paths can be created relative to that.
 * @return {MiddlewaresInformation}
 */
const useExpress = (expressApp, targetToBuild, targetToServe) => {
  // Get the middlewares service.
  const webpackMiddlewares = woopack.get('webpackMiddlewares');
  // Generate the middlewares for the target.
  const info = webpackMiddlewares.generate(targetToBuild, targetToServe);
  // Loop all the received middlewares...
  info.middlewares.forEach((middleware) => {
    // ...and register them on the app.
    expressApp.use(middleware());
  });

  return info;
};

module.exports = useExpress;
