const woopack = require('woopack');
const { middleware } = require('jimpex');

const { webpackFrontendFs, webpackSendFile } = require('./jimpex/index');

module.exports = (jimpexApp, target) => {
  const webpackMiddlewares = woopack.get('webpackMiddlewares');
  const info = webpackMiddlewares.generate(target);

  jimpexApp.register(webpackFrontendFs(
    info.getDirectory,
    info.getFileSystem
  ));
  jimpexApp.register(webpackSendFile);

  info.middlewares.forEach((webpackMiddleware) => {
    jimpexApp.use(middleware(() => webpackMiddleware()));
  });

  jimpexApp.get('events').once('after-start', () => {
    jimpexApp.get('appLogger').warning('waiting for Webpack...');
  });
};
