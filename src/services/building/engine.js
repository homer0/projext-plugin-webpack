const path = require('path');
const { provider } = require('jimple');
/**
 * This build engine is in charge of generating the CLI commands and the configuration to bundle
 * a target using Webpack.
 */
class WebpackBuildEngine {
  /**
   * Class constructor.
   * @param {EnvironmentUtils}     environmentUtils     To load environment variables sent by the
   *                                                    CLI command to the configuration builder
   *                                                    method.
   * @param {Targets}              targets              To get a target information.
   * @param {WebpackConfiguration} webpackConfiguration To generate a configuration for a target.
   * @param {WebpackPluginInfo}    webpackPluginInfo    To get the path to the configuration file.
   */
  constructor(
    environmentUtils,
    targets,
    webpackConfiguration,
    webpackPluginInfo
  ) {
    /**
     * A local reference for the `environmentUtils` service.
     * @type {EnvironmentUtils}
     */
    this.environmentUtils = environmentUtils;
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
     * A local reference for the plugin information.
     * @type {WebpackPluginInfo}
     */
    this.webpackPluginInfo = webpackPluginInfo;
    /**
     * A dictionary of environment variables the service will include on the CLI command and
     * that will be retrieved when generating the configuration.
     * The keys are the purpose and the values the actual names of the variables.
     * @type {Object}
     * @property {string} target The name of the target being builded.
     * @property {string} type   The intended build type: `development` or `production`.
     * @property {string} run    Whether or not to execute the target. This will be like a fake
     *                           boolean as the CLI doesn't support boolean variables, so its value
     *                           will be either `'true'` or `'false'`.
     * @property {string} watch  Whether or not to watch the target files. This will be like a fake
     *                           boolean as the CLI doesn't support boolean variables, so its value
     *                           will be either `'true'` or `'false'`.
     * @access protected
     * @ignore
     */
    this._envVars = {
      target: 'PXTWPK_TARGET',
      type: 'PXTWPK_TYPE',
      run: 'PXTWPK_RUN',
      watch: 'PXTWPK_WATCH',
    };
  }
  /**
   * Get the CLI build command to bundle a target.
   * @param {Target}  target             The target information.
   * @param {string}  buildType          The intended build type: `development` or `production`.
   * @param {boolean} [forceRun=false]   Force the target to run even if the `runOnDevelopment`
   *                                     setting is `false`.
   * @param {boolean} [forceWatch=false] Force webpack to use the watch mode even if the `watch`
   *                                     setting for the required build type is set to `false`.
   * @return {string}
   */
  getBuildCommand(target, buildType, forceRun = false, forceWatch = false) {
    const vars = this._getEnvVarsAsString({
      target: target.name,
      type: buildType,
      run: forceRun,
      watch: forceWatch,
    });

    const config = path.join(
      'node_modules',
      this.webpackPluginInfo.name,
      this.webpackPluginInfo.configuration
    );

    const options = [
      '--progress',
      '--profile',
      '--colors',
    ]
    .join(' ');

    const command = target.is.browser && (target.runOnDevelopment || forceRun) ?
      'webpack-dev-server' :
      'webpack';

    return `${vars} ${command} --config ${config} ${options}`;
  }
  /**
   * Get a webpack configuration for a target.
   * @param {Target}  target    The target configuration.
   * @param {string}  buildType The intended build type: `development` or `production`.
   * @param {boolean} watch     Whether or not the webpack watch mode should be enabled.
   * @return {object}
   */
  getConfiguration(target, buildType, watch) {
    return this.webpackConfiguration.getConfig(target, buildType, watch);
  }
  /**
   * Get a Webpack configuration by reading the environment variables sent by the CLI command
   * `getBuildCommand` generates.
   * @return {object}
   * @throws {Error} If the environment variables are not present.
   */
  getWebpackConfig() {
    const vars = this._getEnvVarsValues();
    if (!vars.target || !vars.type) {
      throw new Error('This file can only be run by using the `build` command');
    }

    const { type, run } = vars;
    const target = Object.assign({}, this.targets.getTarget(vars.target));
    if (run === 'true') {
      target.runOnDevelopment = true;
    }

    const watch = vars.watch === 'true' || target.watch[type];

    return this.getConfiguration(target, type, watch);
  }
  /**
   * Given a dictionary with the environment variables purpose and values, this method generates
   * a string with the variables real names and values.
   * @example
   * console.log(_getEnvVarsAsString{
   *   target: 'my-target',
   *   type: 'development',
   * });
   * // will output `PXTWPK_TARGET=my-target PXTWPK_TYPE=development`
   * @param {object} values A dictionary with the purpose(alias) of the variables as keys.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getEnvVarsAsString(values) {
    return Object.keys(values)
    .map((name) => `${this._envVars[name]}=${values[name]}`)
    .join(' ');
  }
  /**
   * Load the environment variables and returns them on a dictionary.
   * @return {object} The dictionary will have the purpose(alias) of the variables as keys.
   * @access protected
   * @ignore
   */
  _getEnvVarsValues() {
    const vars = {};
    Object.keys(this._envVars).forEach((name) => {
      vars[name] = this.environmentUtils.get(this._envVars[name]);
    });

    return vars;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `WebpackBuildEngine` as the `webpackBuildEngine` service.
 * @example
 * // Register it on the container
 * container.register(webpackBuildEngine);
 * // Getting access to the service instance
 * const webpackBuildEngine = container.get('webpackBuildEngine');
 * @type {Provider}
 */
const webpackBuildEngine = provider((app) => {
  app.set('webpackBuildEngine', () => new WebpackBuildEngine(
    app.get('environmentUtils'),
    app.get('targets'),
    app.get('webpackConfiguration'),
    app.get('webpackPluginInfo')
  ));
});

module.exports = {
  WebpackBuildEngine,
  webpackBuildEngine,
};
