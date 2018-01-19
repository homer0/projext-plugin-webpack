const woopack = require('woopack');
/**
 * Implements the Webpack middlewares for a target on an Express app.
 * @param {Express} expressApp The app where the middlewares are going to be `use`d.
 * @param {Target}  target     The target for which the middlewares are for.
 * @return {object}
 * @property {array}                        middlewares  A list of functions that return a
 *                                                       middleware to `use`.
 * @property {function():string}            getDirectory A function that returns the middleware
 *                                                       file system root directory.
 * @property {function:()Promise<fs,Error>} getFileSystem A function that returns a promise that
 *                                                       resolves on the dev middleware file
 *                                                       system.
 */
const useExpress = (expressApp, target) => {
  // Get the middlewares service.
  const webpackMiddlewares = woopack.get('webpackMiddlewares');
  // Generate the middlewares for the target.
  const info = webpackMiddlewares.generate(target);
  // Loop all the received middlewares...
  info.middlewares.forEach((middleware) => {
    // ...and register them on the app.
    expressApp.use(middleware());
  });

  return info;
};

module.exports = useExpress;
