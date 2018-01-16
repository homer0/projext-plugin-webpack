const webpack = require('webpack');
const webpackRealDevMiddleware = require('webpack-dev-middleware');
const webpackRealHotMiddleware = require('webpack-hot-middleware');
const { provider } = require('jimple');
const { deferred } = require('wootils/shared');

class WebpackMiddlewares {
  constructor(events, targets, webpackConfiguration) {
    this.events = events;
    this.targets = targets;
    this.webpackConfiguration = webpackConfiguration;

    this._devMiddlewares = {};
    this._hotMiddlewares = {};
    this._fileSystemsReady = {};
    this._fileSystemsDeferreds = {};
    this._directories = {};
    this._compiled = [];
  }

  generate(targetName) {
    const target = this.targets.getTarget(targetName);
    this._fileSystemsReady[targetName] = false;
    this._fileSystemsDeferreds[targetName] = deferred();

    const middlewares = [
      () => this.devMiddleware(target),
    ];
    if (target.hot) {
      middlewares.push(() => this.hotMiddleware(target));
    }

    const getFileSystem = () => this.fileSystem(target);
    const getDirectory = () => this._directories[target.name];

    return {
      getDirectory,
      getFileSystem,
      middlewares,
    };
  }

  devMiddleware(target) {
    return this._compile(target).devMiddleware;
  }

  hotMiddleware(target) {
    return this._compile(target).hotMiddleware;
  }

  fileSystem(target) {
    return this._fileSystemsReady[target.name] ?
      Promise.resolve(this._fileSystem(target)) :
      this._fileSystemsDeferreds[target.name].promise;
  }

  _fileSystem(target) {
    return this.devMiddleware(target).fileSystem;
  }

  _compile(target) {
    if (!this._compiled.includes(target.name)) {
      this._compiled.push(target.name);
      const configuration = this.webpackConfiguration.getConfig(target, 'development');
      configuration.plugins.push(this._getFileSystemStatusPlugin(target));
      this._directories[target.name] = configuration.output.path;

      const compiler = webpack(configuration);
      const middlewareOptions = {
        publicPath: configuration.output.publicPath,
        stats: {
          colors: true,
          hash: false,
          timings: true,
          chunks: false,
          chunkModules: false,
          modules: false,
        },
      };
      this._devMiddlewares[target.name] = webpackRealDevMiddleware(
        compiler,
        this.events.reduce(
          'webpack-configuration-for-middleware',
          middlewareOptions,
          target
        )
      );

      if (target.hot) {
        this._hotMiddlewares[target.name] = webpackRealHotMiddleware(compiler);
      }
    }

    return {
      devMiddleware: this._devMiddlewares[target.name],
      hotMiddleware: this._hotMiddlewares[target.name],
      directory: this._directories[target.name],
    };
  }

  _getFileSystemStatusPlugin(target) {
    return {
      apply: (compiler) => {
        compiler.plugin('done', () => {
          this._fileSystemsReady[target.name] = true;
          this._fileSystemsDeferreds[target.name].resolve(
            this._fileSystem(target)
          );
        });
      },
    };
  }
}

const webpackMiddlewares = provider((app) => {
  app.set('webpackMiddlewares', () => new WebpackMiddlewares(
    app.get('events'),
    app.get('targets'),
    app.get('webpackConfiguration')
  ));
});

module.exports = {
  WebpackMiddlewares,
  webpackMiddlewares,
};
