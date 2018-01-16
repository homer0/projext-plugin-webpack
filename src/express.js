const woopack = require('woopack');

module.exports = (expressApp, target) => {
  const webpackMiddlewares = woopack.get('webpackMiddlewares');
  const info = webpackMiddlewares.generate(target);
  info.middlewares.forEach((middleware) => {
    expressApp.use(middleware());
  });

  return info;
};
