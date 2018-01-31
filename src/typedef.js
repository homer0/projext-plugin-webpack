/**
 * @external {Jimple}
 * https://yarnpkg.com/en/package/jimple
 */

/**
 * @external {Jimpex}
 * https://yarnpkg.com/en/package/jimpex
 */

/**
 * @external {Express}
 * https://expressjs.com
 */

/**
 * @external {FileSystem}
 * https://nodejs.org/api/fs.html
 */

/**
 * @external {PathUtils}
 * https://homer0.github.io/wootils/class/wootils/node/pathUtils.js~PathUtils.html
 */

/**
 * @external {Logger}
 * https://homer0.github.io/wootils/class/wootils/node/logger.js~Logger.html
 */

/**
 * @external {EnvironmentUtils}
 * https://homer0.github.io/wootils/class/wootils/node/environmentUtils.js~EnvironmentUtils.html
 */

/**
 * @external {ErrorHandler}
 * https://homer0.github.io/wootils/class/wootils/node/errorHandler.js~ErrorHandler.html
 */

/**
 * @external {RootRequire}
 * https://homer0.github.io/wootils/function/index.html#static-function-rootRequire
 */

/**
 * @external {Woopack}
 * https://homer0.github.io/woopack/class/src/app/index.js~Woopack.html
 */

/**
 * @external {BuildVersion}
 * https://homer0.github.io/woopack/class/src/services/building/buildVersion.js~BuildVersion.html
 */

/**
 * @external {Events}
 * https://homer0.github.io/woopack/class/src/services/common/events.js~Events.html
 */

/**
 * @external {Targets}
 * https://homer0.github.io/woopack/class/src/services/building/targets.js~Targets.html
 */

/**
 * @external {Target}
 * https://homer0.github.io/woopack/typedef/index.html#static-typedef-Target
 */

/**
 * @external {TargetConfigurationCreator}
 * https://homer0.github.io/woopack/typedef/index.html#static-typedef-TargetConfigurationCreator
 */

/**
 * @external {ProjectConfigurationSettings}
 * https://homer0.github.io/woopack/typedef/index.html#static-typedef-ProjectConfigurationSettings
 */

/**
 * @external {BabelConfiguration}
 * https://homer0.github.io/woopack/class/src/services/configurations/babelConfiguration.js~BabelConfiguration.html
 */

/**
 * @external {Middleware}
 * http://expressjs.com/en/guide/using-middleware.html
 */

/**
 * @typedef {function} DevMiddlewareGetDirectory
 * @return {string}
 * The build directory of the target implementing the dev middleware.
 */

/**
 * @typedef {function} DevMiddlewareGetFileSystem
 * @return {Promise<FileSystem,Error>}
 * The reason this is resolved on a promise is to avoid trying to accessing files before they are
 * generated.
 */

/**
 * @typedef {Object} MiddlewaresInformation
 * @property {Array} middlewares
 * A list of functions that when executed return a Node middleware.
 * @property {DevMiddlewareGetDirectory} getDirectory
 * To access the target implementing the middleware build directory.
 * @property {DevMiddlewareGetFileSystem} getFileSystem
 * To access the webpack dev middleware _"virtual filesystem"_.
 */

/**
 * @typedef {Object} WebpackConfigurationsByEnvironment
 * @property {ConfigurationFile} production
 * The configuration service for a the target type production build.
 * @property {ConfigurationFile} development
 * The configuration service for a the target type development build.
 */

/**
 * @typedef {Object} WebpackConfigurations
 * @property {WebpackConfigurationsByEnvironment} node
 * The build types configurations for a Node target.
 * @property {WebpackConfigurationsByEnvironment} browser
 * The build types configurations for a browser target.
 */

/**
 * @typedef {Object} WebpackConfigurationParams
 * @property {Target} target
 * The target information.
 * @property {Object} entry
 * A dictionary with the `entry` setting for a webpack configuration, generated with the target
 * information.
 * @property {Object} definitions
 * A dictionary of defined variables that will be replaced on the bundled code.
 * @property {string} hashStr
 * A random number that can be used as a hash to include on the generated files names. It's a
 * string that ends on a `.`, so it can be added directly on a filename.
 * @property {string} buildType
 * The intended built type: `development` or `production`.
 */

/**
 * @typedef {function} ProviderRegisterMethod
 * @param {Jimple} app
 * A reference to the dependency injection container.
 */

/**
 * @typedef {Object} Provider
 * @property {ProviderRegisterMethod} register
 * The method that gets called when registering the provider.
 */
