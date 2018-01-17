const path = require('path');
const extend = require('extend');
const { provider } = require('jimple');

class WebpackConfiguration {
  constructor(
    projectConfiguration,
    pathUtils,
    versionUtils,
    targets,
    targetConfiguration,
    webpackConfigurations
  ) {
    this.projectConfiguration = projectConfiguration;
    this.pathUtils = pathUtils;
    this.versionUtils = versionUtils;
    this.targets = targets;
    this.targetConfiguration = targetConfiguration;
    this.webpackConfigurations = webpackConfigurations;
  }

  getDefinitions(target, env) {
    const definitions = {
      'process.env.NODE_ENV': `'${env}'`,
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

  getHash() {
    const hash = Date.now();
    return {
      hash,
      hashStr: `.${hash}`,
    };
  }

  getVersion() {
    const {
      version: {
        revision: {
          filename,
        },
      },
    } = this.projectConfiguration;
    return this.versionUtils.getVersion(filename);
  }

  getLibraryOptions(target) {
    const { libraryOptions } = target;
    return Object.assign({
      libraryTarget: 'commonjs2',
    }, libraryOptions);
  }

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

    const { hash, hashStr } = this.getHash();
    const params = {
      target,
      entry: {
        [target.name]: entries,
      },
      definitions: this.getDefinitions(target, buildType),
      version: this.getVersion(),
      hash,
      hashStr,
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
      app.get('projectConfiguration').getConfig(),
      app.get('pathUtils'),
      app.get('versionUtils'),
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
