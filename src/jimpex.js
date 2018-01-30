const woopack = require('woopack/index');
const { middleware } = require('jimpex');

const { webpackFrontendFs, webpackSendFile } = require('./jimpex/index');
/**
 * Implements the Webpack middlewares for a target on a Jimpex app.
 * @param {Jimpex}  jimpexApp  The app where the middlewares are going to be registered..
 * @param {string}  targetName The name of the target for which the middlewares are for.
 * @return {MiddlewaresInformation}
 */
const useJimpex = (jimpexApp, targetName) => {
  // Get the middlewares service.
  const webpackMiddlewares = woopack.get('webpackMiddlewares');
  // Generate the middlewares for the target.
  const info = webpackMiddlewares.generate(targetName);
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
