const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/configuration');

const path = require('path');
require('jasmine-expect');
const {
  WebpackConfiguration,
  webpackConfiguration,
} = require('/src/services/building/configuration');

const originalNow = Date.now;

describe('services/building:configuration', () => {
  afterEach(() => {
    Date.now = originalNow;
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildVersion = 'buildVersion';
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const targetsFileRules = 'targetsFileRules';
    const targetConfiguration = 'targetConfiguration';
    const webpackConfigurations = 'webpackConfigurations';
    let sut = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackConfiguration);
    expect(sut.buildVersion).toBe(buildVersion);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.targets).toBe(targets);
    expect(sut.targetsFileRules).toBe(targetsFileRules);
    expect(sut.targetConfiguration).toBe(targetConfiguration);
    expect(sut.webpackConfigurations).toBe(webpackConfigurations);
  });

  it('should throw an error when trying to build a target with an invalid type', () => {
    // Given
    const buildVersion = 'buildVersion';
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const targetsFileRules = 'targetsFileRules';
    const targetConfiguration = 'targetConfiguration';
    const target = {
      type: 'random-type',
    };
    const webpackConfigurations = {};
    let sut = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    // Then
    expect(() => sut.getConfig(target))
    .toThrow(/there's no configuration for the selected target type/i);
  });

  it('should throw an error when trying to build with an unknown build type', () => {
    // Given
    const buildVersion = 'buildVersion';
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const targetsFileRules = 'targetsFileRules';
    const targetConfiguration = 'targetConfiguration';
    const target = {
      type: 'node',
    };
    const buildType = 'randomType';
    const webpackConfigurations = {
      node: {},
    };
    let sut = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    // Then
    expect(() => sut.getConfig(target, buildType))
    .toThrow(/there's no configuration for the selected build type/i);
  });

  it('should generate the configuration for a Node target', () => {
    // Given
    const versionVariable = 'process.env.VERSION';
    const version = 'latest';
    const buildVersion = {
      getDefinitionVariable: jest.fn(() => versionVariable),
      getVersion: jest.fn(() => version),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
    };
    const targets = 'targets';
    const targetRules = 'target-rule';
    const targetsFileRules = {
      getRulesForTarget: jest.fn(() => targetRules),
    };
    const targetConfiguration = jest.fn(() => targetConfig);
    const buildType = 'development';
    const target = {
      type: 'node',
      name: 'target',
      paths: {
        source: 'src/target',
      },
      entry: {
        [buildType]: 'index.js',
      },
      output: {
        [buildType]: {
          js: 'target.js',
          css: 'css/target/file.2509.css',
          fonts: 'fonts/target/[name].2509.[ext]',
          images: 'images/target/[name].2509.[ext]',
        },
      },
      babel: {},
      library: false,
      is: {
        node: true,
        browser: false,
      },
    };
    const webpackConfigurations = {
      [target.type]: {
        [buildType]: {},
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(config);
    expect(buildVersion.getDefinitionVariable).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(targetsFileRules.getRulesForTarget).toHaveBeenCalledTimes(1);
    expect(targetsFileRules.getRulesForTarget).toHaveBeenCalledWith(target);
    expect(targetConfiguration).toHaveBeenCalledTimes(['global', 'byBuildType'].length);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.config.js`,
      {}
    );
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      targetConfig
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      buildType,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      definitions: {
        'process.env.NODE_ENV': `'${buildType}'`,
        [versionVariable]: `"${version}"`,
      },
      output: target.output[buildType],
      targetRules,
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should generate the configuration for a browser target', () => {
    // Given
    const hash = '2509';
    Date.now = () => hash;
    const versionVariable = 'process.env.VERSION';
    const version = 'latest';
    const buildVersion = {
      getDefinitionVariable: jest.fn(() => versionVariable),
      getVersion: jest.fn(() => version),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
    };
    const targets = 'targets';
    const targetRules = 'target-rule';
    const targetsFileRules = {
      getRulesForTarget: jest.fn(() => targetRules),
    };
    const targetConfiguration = jest.fn(() => targetConfig);
    const buildType = 'development';
    const target = {
      type: 'browser',
      name: 'target',
      paths: {
        source: 'src/target',
      },
      entry: {
        [buildType]: 'index.js',
      },
      output: {
        [buildType]: {
          js: 'js/target/file.2509.js',
          css: 'css/target/file.2509.css',
          fonts: 'fonts/target/[name].2509.[ext]',
          images: 'images/target/[name].2509.[ext]',
        },
      },
      babel: {},
      library: false,
      is: {
        node: false,
        browser: true,
      },
    };
    const webpackConfigurations = {
      [target.type]: {
        [buildType]: {},
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(config);
    expect(buildVersion.getDefinitionVariable).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledTimes(['global', 'byBuildType'].length);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.config.js`,
      {}
    );
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      targetConfig
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      buildType,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      definitions: {
        'process.env.NODE_ENV': `'${buildType}'`,
        [versionVariable]: `"${version}"`,
      },
      output: target.output[buildType],
      targetRules,
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should generate the configuration for a browser target and `define` its config', () => {
    // Given
    const versionVariable = 'process.env.VERSION';
    const version = 'latest';
    const buildVersion = {
      getDefinitionVariable: jest.fn(() => versionVariable),
      getVersion: jest.fn(() => version),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
    };
    const targetBrowserConfig = {
      someProp: 'someValue',
    };
    const targets = {
      getBrowserTargetConfiguration: jest.fn(() => targetBrowserConfig),
    };
    const targetRules = 'target-rule';
    const targetsFileRules = {
      getRulesForTarget: jest.fn(() => targetRules),
    };
    const targetConfiguration = jest.fn(() => targetConfig);
    const buildType = 'development';
    const target = {
      type: 'browser',
      name: 'target',
      paths: {
        source: 'src/target',
      },
      entry: {
        [buildType]: 'index.js',
      },
      output: {
        [buildType]: {
          js: 'target.js',
        },
      },
      babel: {},
      library: false,
      is: {
        browser: true,
      },
      configuration: {
        enabled: true,
        defineOn: 'process.env.CONFIG',
      },
    };
    const webpackConfigurations = {
      [target.type]: {
        [buildType]: {},
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(config);
    expect(buildVersion.getDefinitionVariable).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledTimes(['global', 'byBuildType'].length);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.config.js`,
      {}
    );
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      targetConfig
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      buildType,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      output: target.output[buildType],
      definitions: {
        'process.env.NODE_ENV': `'${buildType}'`,
        [versionVariable]: `"${version}"`,
        [target.configuration.defineOn]: JSON.stringify(targetBrowserConfig),
      },
      targetRules,
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
    expect(targets.getBrowserTargetConfiguration).toHaveBeenCalledTimes(1);
    expect(targets.getBrowserTargetConfiguration).toHaveBeenCalledWith(target);
  });

  it('should generate the configuration for a target, with the Babel polyfill', () => {
    // Given
    const versionVariable = 'process.env.VERSION';
    const version = 'latest';
    const buildVersion = {
      getDefinitionVariable: jest.fn(() => versionVariable),
      getVersion: jest.fn(() => version),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
    };
    const targets = 'targets';
    const targetRules = 'target-rule';
    const targetsFileRules = {
      getRulesForTarget: jest.fn(() => targetRules),
    };
    const targetConfiguration = jest.fn(() => targetConfig);
    const buildType = 'development';
    const target = {
      type: 'node',
      name: 'target',
      paths: {
        source: 'src/target',
      },
      entry: {
        [buildType]: 'index.js',
      },
      output: {
        [buildType]: {
          js: 'target.js',
          css: 'css/target/file.2509.css',
          fonts: 'fonts/target/[name].2509.[ext]',
          images: 'images/target/[name].2509.[ext]',
        },
      },
      babel: {
        polyfill: true,
      },
      library: false,
      is: {
        browser: false,
        node: true,
      },
    };
    const webpackConfigurations = {
      [target.type]: {
        [buildType]: {},
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(config);
    expect(buildVersion.getDefinitionVariable).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledTimes(['global', 'byBuildType'].length);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.config.js`,
      {}
    );
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      targetConfig
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      buildType,
      entry: {
        [target.name]: [
          'babel-polyfill',
          path.join(target.paths.source, target.entry[buildType]),
        ],
      },
      definitions: {
        'process.env.NODE_ENV': `'${buildType}'`,
        [versionVariable]: `"${version}"`,
      },
      output: target.output[buildType],
      targetRules,
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should generate the configuration for a library target', () => {
    // Given
    const versionVariable = 'process.env.VERSION';
    const version = 'latest';
    const buildVersion = {
      getDefinitionVariable: jest.fn(() => versionVariable),
      getVersion: jest.fn(() => version),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
    };
    const targets = 'targets';
    const targetRules = 'target-rule';
    const targetsFileRules = {
      getRulesForTarget: jest.fn(() => targetRules),
    };
    const targetConfiguration = jest.fn(() => targetConfig);
    const buildType = 'development';
    const target = {
      type: 'node',
      name: 'target',
      paths: {
        source: 'src/target',
      },
      entry: {
        [buildType]: 'index.js',
      },
      output: {
        [buildType]: {
          js: 'target.js',
          css: 'css/target/file.2509.css',
          fonts: 'fonts/target/[name].2509.[ext]',
          images: 'images/target/[name].2509.[ext]',
        },
      },
      babel: {},
      library: true,
      libraryOptions: {},
      is: {
        browser: false,
        node: true,
      },
    };
    const webpackConfigurations = {
      [target.type]: {
        [buildType]: {},
      },
    };
    const expectedConfig = {
      output: {
        path: 'some-output-path',
        libraryTarget: 'commonjs2',
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(buildVersion.getDefinitionVariable).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledTimes(['global', 'byBuildType'].length);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.config.js`,
      {}
    );
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      targetConfig
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      buildType,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      definitions: {
        'process.env.NODE_ENV': `'${buildType}'`,
        [versionVariable]: `"${version}"`,
      },
      output: target.output[buildType],
      targetRules,
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should generate the configuration for a library target and remove unsupported keys', () => {
    // Given
    const versionVariable = 'process.env.VERSION';
    const version = 'latest';
    const buildVersion = {
      getDefinitionVariable: jest.fn(() => versionVariable),
      getVersion: jest.fn(() => version),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
    };
    const targets = 'targets';
    const targetRules = 'target-rule';
    const targetsFileRules = {
      getRulesForTarget: jest.fn(() => targetRules),
    };
    const targetConfiguration = jest.fn(() => targetConfig);
    const buildType = 'development';
    const target = {
      type: 'node',
      name: 'target',
      paths: {
        source: 'src/target',
      },
      entry: {
        [buildType]: 'index.js',
      },
      output: {
        [buildType]: {
          js: 'target.js',
          css: 'css/target/file.2509.css',
          fonts: 'fonts/target/[name].2509.[ext]',
          images: 'images/target/[name].2509.[ext]',
        },
      },
      babel: {},
      library: true,
      libraryOptions: {
        compress: true,
      },
      is: {
        browser: false,
        node: true,
      },
    };
    const webpackConfigurations = {
      [target.type]: {
        [buildType]: {},
      },
    };
    const expectedConfig = {
      output: {
        path: 'some-output-path',
        libraryTarget: 'commonjs2',
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      buildVersion,
      pathUtils,
      targets,
      targetsFileRules,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(buildVersion.getDefinitionVariable).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledTimes(['global', 'byBuildType'].length);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.config.js`,
      {}
    );
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      targetConfig
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      buildType,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      definitions: {
        'process.env.NODE_ENV': `'${buildType}'`,
        [versionVariable]: `"${version}"`,
      },
      output: target.output[buildType],
      targetRules,
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    webpackConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackConfiguration);
    expect(sut.buildVersion).toBe('buildVersion');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.buildVersion).toBe('buildVersion');
    expect(sut.targets).toBe('targets');
    expect(sut.targetsFileRules).toBe('targetsFileRules');
    expect(sut.targetConfiguration).toBe('targetConfiguration');
    expect(sut.webpackConfigurations).toEqual({
      node: {
        development: 'webpackNodeDevelopmentConfiguration',
        production: 'webpackNodeProductionConfiguration',
      },
      browser: {
        development: 'webpackBrowserDevelopmentConfiguration',
        production: 'webpackBrowserProductionConfiguration',
      },
    });
  });
});
