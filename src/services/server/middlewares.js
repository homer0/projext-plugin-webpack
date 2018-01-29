const webpack = require('webpack');
const webpackRealDevMiddleware = require('webpack-dev-middleware');
const webpackRealHotMiddleware = require('webpack-hot-middleware');
const { provider } = require('jimple');
const { deferred } = require('wootils/shared');
/**
 * This service creates and manages middlewares for Webpack server implementations.
 */
class WebpackMiddlewares {
  /**
   * Class constructor.
   * @param {Events}               events               To reduce the middlewares configuration.
   * @param {Targets}              targets              To get targets information.
   * @param {WebpackConfiguration} webpackConfiguration To get a target Webpack configuration in
   *                                                    order to instantiate the middlewares.
   */
  constructor(events, targets, webpackConfiguration) {
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * A local reference for the `webpackConfiguration` service.
     * @type {WebpackConfiguration}
     */
    this.webpackConfiguration = webpackConfiguration;
    /**
     * A dictionary with the dev middlewares. It uses the targets names as the keys.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._devMiddlewares = {};
    /**
     * A dictionary with the hot middlewares. It uses the targets names as the keys.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._hotMiddlewares = {};
    /**
     * A dictionary of flags that indicate if a target middleware file system is ready to be used.
     * A middleware file system is not ready until Webpack finishes compiling the code.
     * It uses the targets names as the keys.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._fileSystemsReady = {};
    /**
     * A dictionary of deffered promises the service uses to return when asked for a file system
     * while its middleware hasn't finished compiling.
     * It uses the targets names as the keys.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._fileSystemsDeferreds = {};
    /**
     * A dictionary of directories the middlewares use as root for their file system.
     * It uses the targets names as the keys.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._directories = {};
    /**
     * A list with the names of the targets which dev middlewares have finished compiling.
     * @type {Array}
     * @ignore
     * @access protected
     */
    this._compiled = [];
  }
  /**
   * Generate the middlewares for a given target.
   * @param {string} targetName The name of the target.
   * @return {MiddlewaresInformation}
   */
  generate(targetName) {
    // Get the target information.
    const target = this.targets.getTarget(targetName);
    // Set the flag indicating the dev middleware file system is not ready.
    this._fileSystemsReady[targetName] = false;
    // Create the deferred promise for when the dev middleware file system is ready.
    this._fileSystemsDeferreds[targetName] = deferred();
    // Create the list of middlewares with just the dev middleware.
    const middlewares = [
      () => this.devMiddleware(target),
    ];
    // If the target uses hot replacement...
    if (target.hot) {
      // ...pubsh the function that returns the hot middleware.
      middlewares.push(() => this.hotMiddleware(target));
    }
    // Define the functions to get the file system promise and the middleware root directory.
    const getFileSystem = () => this.fileSystem(target);
    const getDirectory = () => this._directories[target.name];

    return {
      getDirectory,
      getFileSystem,
      middlewares,
    };
  }
  /**
   * Get access to a target dev middleware.
   * @param {Target} target The target for which the middleware is.
   * @return {Middleware}
   */
  devMiddleware(target) {
    return this._compile(target).devMiddleware;
  }
  /**
   * Get access to a target hot middleware.
   * @param {Target} target The target for which the middleware is.
   * @return {Middleware}
   */
  hotMiddleware(target) {
    return this._compile(target).hotMiddleware;
  }
  /**
   * Get access to a target dev middleware file system.
   * @param {Target} target The target owner of the middleware.
   * @return {Promise<FileSystem,Error>}
   */
  fileSystem(target) {
    return this._fileSystemsReady[target.name] ?
      Promise.resolve(this._fileSystem(target)) :
      this._fileSystemsDeferreds[target.name].promise;
  }
  /**
   * The `fileSystem` method only returns promises, but this is the one that gets the middleware
   * and returns its file system.
   * @param {Target} target The target owner of the middleware.
   * @return {FileSystem}
   */
  _fileSystem(target) {
    return this.devMiddleware(target).fileSystem;
  }
  /**
   * This method gets called every time another method fromt the service needs to access a
   * middleware or a middleware property, and what it does is: Checks if the target has a compiled
   * middleware, and if it's not ready, it creates the middleware and compiles them, otherwise, it
   * just returns the saved instances.
   * This method uses the reducer event `webpack-configuration-for-middleware`, which sends the
   * middleware options, the target information, and expects an object with middleware options on
   * return.
   * @param {Target} target The target for which the middlewares are for.
   * @return {object}
   * @property {middleware}  devMiddleware An instance of the Webpack dev middleware created for
   *                                       the target.
   * @property {?middleware} hotMiddleware An instance of the Webpack hot middleware, if needed
   *                                       by the target.
   * @property {string}      directory     The dev middleware root directory.
   * @ignore
   * @access protected
   */
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
  /**
   * Creates a _'fake Webpack plugin'_ that detects when the bundle finishes compiling and let
   * the service know that the file system can accessed now.
   * @param {Target} target The target owner of the middleware.
   * @return {object} A webpack plugin.
   * @ignore
   * @access protected
   */
  _getFileSystemStatusPlugin(target) {
    return {
      apply: (compiler) => {
        compiler.plugin('done', () => {
          // Mark the file system as ready.
          this._fileSystemsReady[target.name] = true;
          // Resolve the deferred promise.
          this._fileSystemsDeferreds[target.name].resolve(
            this._fileSystem(target)
          );
        });
      },
    };
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `WebpackMiddlewares` as the `webpackMiddlewares` service.
 * @example
 * // Register it on the container
 * container.register(webpackMiddlewares);
 * // Getting access to the service instance
 * const webpackMiddlewares = container.get('webpackMiddlewares');
 * @type {Provider}
 */
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
