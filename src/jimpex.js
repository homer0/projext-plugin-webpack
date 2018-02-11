const projext = require('projext/index');
const { middleware } = require('jimpex');

const { webpackFrontendFs, webpackSendFile } = require('./jimpex/index');
/**
 * Implements the Webpack middlewares for a target on a Jimpex app.
 * @param {Jimpex} jimpexApp     The app where the middlewares are going to be registered.
 * @param {string} targetToBuild The name of the target that will be builded on the middleware(s).
 * @param {string} targetToServe The name of the target that will implement the middleware(s). When
 *                               the other target is builded, it will assume that is on the
 *                               distribution directory, and if the target serving it is being
 *                               executed from the source directory it won't be able to use the
 *                               dev middleware file system without hardcoding some relatives paths
 *                               from the build to the source; to avoid that, the method gets
 *                               the build path of this target, so when using `getDirectory()`, it
 *                               will think they are both on the distribution directory and the
 *                               paths can be created relative to that.
 * @return {MiddlewaresInformation}
 */
const useJimpex = (jimpexApp, targetToBuild, targetToServe) => {
  // Get the middlewares service.
  const webpackMiddlewares = projext.get('webpackMiddlewares');
  // Generate the middlewares for the target.
  const info = webpackMiddlewares.generate(targetToBuild, targetToServe);
  /**
   * Register the overwrite services...
   * - The `webpackFrontendFs` overwrites the regular `frontendFs` in order to read files from
   * the dev middleware file system.
   * - The `webpackSendFile` overwrites the regular `sendFile`, so instead of doing
   * `reqsponse.sendFile`, it will first read the file using the updated `frontendFs` and then
   * send its data as response.
   */
  jimpexApp.register(webpackFrontendFs(
    info.getDirectory,
    info.getFileSystem
  ));
  jimpexApp.register(webpackSendFile);
  // Loop all the received middlewares...
  info.middlewares.forEach((webpackMiddleware) => {
    // ...and register them.
    jimpexApp.use(middleware(() => webpackMiddleware()));
  });
  // Add an event listener that shows a _'waiting'_ message when the server starts.
  jimpexApp.get('events').once('after-start', () => {
    jimpexApp.get('appLogger').warning('waiting for Webpack...');
  });

  return info;
};

module.exports = useJimpex;
