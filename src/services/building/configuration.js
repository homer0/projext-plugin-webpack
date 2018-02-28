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
   * @param {TargetConfigurationCreator} targetConfiguration   To create an overwrite
   *                                                           configuration for the target.
   * @param {WebpackConfigurations}      webpackConfigurations A dictionary of configurations
   *                                                           for target type and build type.
   */
  constructor(
    buildVersion,
    pathUtils,
    targets,
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
   * Get a dictionary of definitions that will be replaced on the generated bundle. This is done
   * using the `webpack.DefinePlugin` plugin.
   * @param {Target} target The target information.
   * @param {string} env    The `NODE_ENV` to define.
   * @return {Object}
   */
  getDefinitions(target, env) {
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
   * In case the target is a library, this method will be called to generate the library options
   * for Webpack.
   * @param {Target} target The target information.
   * @return {Object}
   */
  getLibraryOptions(target) {
    const { libraryOptions } = target;
    return Object.assign({
      libraryTarget: 'commonjs2',
    }, libraryOptions);
  }
  /**
   * This method generates a complete Webpack configuration for a target.
   * @param {Target} target    The target information.
   * @param {string} buildType The intended build type: `production` or `development`.
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
      entries.unshift('babel-polyfill');
    }

    const params = {
      target,
      entry: {
        [target.name]: entries,
      },
      definitions: this.getDefinitions(target, buildType),
      output: target.output[buildType],
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
      config.output = extend(true, {}, config.output, this.getLibraryOptions(target));
    }

    return config;
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
      app.get('targetConfiguration'),
      webpackConfigurations
    );
  });
});

module.exports = {
  WebpackConfiguration,
  webpackConfiguration,
};
