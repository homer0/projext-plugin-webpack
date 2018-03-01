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
 * @external {Projext}
 * https://homer0.github.io/projext/class/src/app/index.js~Projext.html
 */

/**
 * @external {BuildVersion}
 * https://homer0.github.io/projext/class/src/services/building/buildVersion.js~BuildVersion.html
 */

/**
 * @external {Events}
 * https://homer0.github.io/projext/class/src/services/common/events.js~Events.html
 */

/**
 * @external {Targets}
 * https://homer0.github.io/projext/class/src/services/building/targets.js~Targets.html
 */

/**
 * @external {Target}
 * https://homer0.github.io/projext/typedef/index.html#static-typedef-Target
 */

/**
 * @external {BrowserTarget}
 * https://homer0.github.io/projext/typedef/index.html#static-typedef-BrowserTarget
 */

/**
 * @external {TargetConfigurationCreator}
 * https://homer0.github.io/projext/typedef/index.html#static-typedef-TargetConfigurationCreator
 */

/**
 * @external {ProjectConfigurationSettings}
 * https://homer0.github.io/projext/typedef/index.html#static-typedef-ProjectConfigurationSettings
 */

/**
 * @external {BabelConfiguration}
 * https://homer0.github.io/projext/class/src/services/configurations/babelConfiguration.js~BabelConfiguration.html
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
 * @typedef {Object} WebpackConfigurationTargetOutput
 * @property {string} js
 * The filename format and path for the bundle, on the distribution directory.
 * @property {?string} css
 * The filename format and path for the generated stylesheet, on the distribution directory.
 * This path is only available for {@link BrowserTarget}s
 * @property {?string} images
 * The filename format and path for the images that are going to be copied to the distribution
 * directory.
 * This path is only available for {@link BrowserTarget}s
 * @property {?string} fonts
 * The filename format and path for the font files that are going to be copied to the distribution
 * directory.
 * This path is only available for {@link BrowserTarget}s
 */

/**
 * @typedef {Object} WebpackConfigurationParams
 * @property {Target} target
 * The target information.
 * @property {Object} entry
 * A dictionary with the `entry` setting for a webpack configuration, generated with the target
 * information.
 * @property {WebpackConfigurationTargetOutput} output
 * A dictionary with the filenames formats and paths of the different files the bundle can
 * generate.
 * @property {Object} definitions
 * A dictionary of defined variables that will be replaced on the bundled code.
 * @property {string} buildType
 * The intended built type: `development` or `production`.
 */

/**
 * @typedef {Object} TargetDevServerSSLSettings
 * @property {string} key
 * The path to the SSL key (`.key`).
 * @property {string} cert
 * The path to the SSL certificate (`.crt`).
 * @property {string} ca
 * The path to the SSL public file (`.pem`).
 */

/**
 * @typedef {Object} TargetDevServerProxiedSettings
 * @property {boolean} enabled
 * Whether or not the dev server is being proxied.
 * @property {string} host
 * The host used to proxy the dev server.
 * @property {boolean} https
 * Whether or not the proxied host uses `https`.
 */

/**
 * @typedef {Object} TargetDevServerSettings
 * @property {number} port
 * The server port.
 * @property {string} host
 * The dev server hostname.
 * @property {string} url
 * The complete URL for the dev server.
 * @property {boolean} reload
 * Whether or not to reload the server when the code changes.
 * @property {?TargetDevServerSSLSettings} ssl
 * The paths to the files to enable SSL on the dev server.
 * @property {?TargetDevServerProxiedSettings} [proxied]
 * When the dev server is being proxied (using `nginx` for example), there are certain
 * functionalities, like hot module replacement and live reload, that need to be aware of this.
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
