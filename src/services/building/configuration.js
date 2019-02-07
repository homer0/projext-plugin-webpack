const path = require('path');
const extend = require('extend');
const { provider } = require('jimple');
/**
 * This service reads the targets information and generates what would be the contents of a
 * `webpack.config.js` for them.
 */
class WebpackConfiguration {
  /**
   * Class constructor.
   * @param {BuildVersion}               buildVersion          To load the project version.
   * @param {PathUtils}                  pathUtils             To generate the Webpack paths.
   * @param {Targets}                    targets               To get the target information.
   * @param {TargetsFileRules}           targetsFileRules      To get the file rules of the target.
   * @param {TargetConfigurationCreator} targetConfiguration   To create an overwrite
   *                                                           configuration for the target.
   * @param {WebpackConfigurations}      webpackConfigurations A dictionary of configurations
   *                                                           for target type and build type.
   */
  constructor(
    buildVersion,
    pathUtils,
    targets,
    targetsFileRules,
    targetConfiguration,
    webpackConfigurations
  ) {
    /**
     * A local reference for the `buildVersion` service.
     * @type {BuildVersion}
     */
    this.buildVersion = buildVersion;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * A local reference for the `targetsFileRules` service.
     * @type {TargetsFileRules}
     */
    this.targetsFileRules = targetsFileRules;
    /**
     * A local reference for the `targetConfiguration` function service.
     * @type {TargetConfigurationCreator}
     */
    this.targetConfiguration = targetConfiguration;
    /**
     * A dictionary with the configurations for target type and build type.
     * @type {WebpackConfigurations}
     */
    this.webpackConfigurations = webpackConfigurations;
  }
  /**
   * This method generates a complete webpack configuration for a target.
   * @param {Target}  target    The target information.
   * @param {string}  buildType The intended build type: `production` or `development`.
   * @return {Object}
   * @throws {Error} If there's no base configuration for the target type.
   * @throws {Error} If there's no base configuration for the target type and build type.
   */
  getConfig(target, buildType) {
    const targetType = target.type;
    if (!this.webpackConfigurations[targetType]) {
      throw new Error(`There's no configuration for the selected target type: ${targetType}`);
    } else if (!this.webpackConfigurations[targetType][buildType]) {
      throw new Error(`There's no configuration for the selected build type: ${buildType}`);
    }

    const entryFile = path.join(target.paths.source, target.entry[buildType]);
    const entries = [entryFile];
    if (target.babel.polyfill) {
      entries.unshift('@babel/polyfill');
    }

    const copy = [];
    if (target.is.browser || target.bundle) {
      copy.push(...this.targets.getFilesToCopy(target, buildType));
    }

    const output = Object.assign({}, target.output[buildType]);
    if (typeof output.jsChunks !== 'string') {
      output.jsChunks = this._generateChunkName(output.js);
    }

    const params = {
      target,
      targetRules: this.targetsFileRules.getRulesForTarget(target),
      entry: {
        [target.name]: entries,
      },
      definitions: this._getDefinitions(target, buildType),
      output,
      copy,
      buildType,
    };

    let config = this.targetConfiguration(
      `webpack/${target.name}.config.js`,
      this.webpackConfigurations[targetType][buildType]
    );
    config = this.targetConfiguration(
      `webpack/${target.name}.${buildType}.config.js`,
      config
    ).getConfig(params);
    config.output.path = this.pathUtils.join(config.output.path);

    if (target.library) {
      config.output = extend(true, {}, config.output, this._getLibraryOptions(target));
    }

    return config;
  }
  /**
   * Get a dictionary of definitions that will be replaced on the generated bundle. This is done
   * using the `webpack.DefinePlugin` plugin.
   * @param {Target} target The target information.
   * @param {string} env    The `NODE_ENV` to define.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _getDefinitions(target, env) {
    const definitions = {
      'process.env.NODE_ENV': `'${env}'`,
      [this.buildVersion.getDefinitionVariable()]: JSON.stringify(this.buildVersion.getVersion()),
    };

    if (
      target.is.browser &&
      target.configuration &&
      target.configuration.enabled
    ) {
      definitions[target.configuration.defineOn] = JSON.stringify(
        this.targets.getBrowserTargetConfiguration(target)
      );
    }

    return definitions;
  }
  /**
   * In case the target is a library, this method will be called in order to get the extra output
   * settings webpack needs.
   * @param {Target} target The target information.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _getLibraryOptions(target) {
    const { libraryOptions } = target;
    // Create the object for webpack.
    const newOptions = Object.assign({
      libraryTarget: 'commonjs2',
    }, libraryOptions);

    // Remove any option unsupported by the webpack schema
    [
      'compress',
    ].forEach((invalidOption) => {
      delete newOptions[invalidOption];
    });

    return newOptions;
  }
  /**
   * This is a small helper function that parses the default path of the JS file webpack will
   * emmit and adds a `[name]` placeholder for webpack to replace with the chunk name.
   * @param {string} jsPath The original path for the JS file.
   * @return {string}
   * @access protected
   * @ignore
   */
  _generateChunkName(jsPath) {
    const parsed = path.parse(jsPath);
    return path.join(parsed.dir, `${parsed.name}.[name]${parsed.ext}`);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `WebpackConfiguration` as the `webpackConfiguration` service.
 * @example
 * // Register it on the container
 * container.register(webpackConfiguration);
 * // Getting access to the service instance
 * const webpackConfiguration = container.get('webpackConfiguration');
 * @type {Provider}
 */
const webpackConfiguration = provider((app) => {
  app.set('webpackConfiguration', () => {
    const webpackConfigurations = {
      node: {
        development: app.get('webpackNodeDevelopmentConfiguration'),
        production: app.get('webpackNodeProductionConfiguration'),
      },
      browser: {
        development: app.get('webpackBrowserDevelopmentConfiguration'),
        production: app.get('webpackBrowserProductionConfiguration'),
      },
    };

    return new WebpackConfiguration(
      app.get('buildVersion'),
      app.get('pathUtils'),
      app.get('targets'),
      app.get('targetsFileRules'),
      app.get('targetConfiguration'),
      webpackConfigurations
    );
  });
});

module.exports = {
  WebpackConfiguration,
  webpackConfiguration,
};
