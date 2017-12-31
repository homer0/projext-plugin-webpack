const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/configuration');

const path = require('path');
require('jasmine-expect');
const {
  WebpackConfiguration,
  webpackConfiguration,
} = require('/src/services/building/configuration');

describe('services/building:configuration', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const projectConfiguration = 'projectConfiguration';
    const pathUtils = 'pathUtils';
    const versionUtils = 'versionUtils';
    const targetConfiguration = 'targetConfiguration';
    const webpackConfigurations = 'webpackConfigurations';
    let sut = null;
    // When
    sut = new WebpackConfiguration(
      projectConfiguration,
      pathUtils,
      versionUtils,
      targetConfiguration,
      webpackConfigurations
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackConfiguration);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.versionUtils).toBe(versionUtils);
    expect(sut.targetConfiguration).toBe(targetConfiguration);
    expect(sut.webpackConfigurations).toBe(webpackConfigurations);
  });

  it('should throw an error when trying to build a target with an invalid type', () => {
    // Given
    const projectConfiguration = 'projectConfiguration';
    const pathUtils = 'pathUtils';
    const versionUtils = 'versionUtils';
    const targetConfiguration = 'targetConfiguration';
    const target = {
      type: 'random-type',
    };
    const webpackConfigurations = {};
    let sut = null;
    // When
    sut = new WebpackConfiguration(
      projectConfiguration,
      pathUtils,
      versionUtils,
      targetConfiguration,
      webpackConfigurations
    );
    // Then
    expect(() => sut.getConfig(target))
    .toThrow(/there's no configuration for the selected target type/i);
  });

  it('should throw an error when trying to build with an unknown build type', () => {
    // Given
    const projectConfiguration = 'projectConfiguration';
    const pathUtils = 'pathUtils';
    const versionUtils = 'versionUtils';
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
      projectConfiguration,
      pathUtils,
      versionUtils,
      targetConfiguration,
      webpackConfigurations
    );
    // Then
    expect(() => sut.getConfig(target, buildType))
    .toThrow(/there's no configuration for the selected build type/i);
  });

  it('should generate the configuration for a target', () => {
    // Given
    const revisionFilename = 'revision';
    const projectConfiguration = {
      version: {
        revisionFilename,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const version = 'latest';
    const versionUtils = {
      getVersion: jest.fn(() => version),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
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
      babel: {},
      library: false,
    };
    const webpackConfigurations = {
      node: {
        [buildType]: {},
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      projectConfiguration,
      pathUtils,
      versionUtils,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(config);
    expect(versionUtils.getVersion).toHaveBeenCalledTimes(1);
    expect(versionUtils.getVersion).toHaveBeenCalledWith(revisionFilename);
    expect(targetConfiguration).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      {}
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      definitions: {
        'process.env.NODE_ENV': buildType,
      },
      version,
      hash: expect.any(Number),
      hashStr: expect.any(String),
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should generate the configuration for a target, with the Babel polyfill', () => {
    // Given
    const revisionFilename = 'revision';
    const projectConfiguration = {
      version: {
        revisionFilename,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const version = 'latest';
    const versionUtils = {
      getVersion: jest.fn(() => version),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
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
      babel: {
        polyfill: true,
      },
      library: false,
    };
    const webpackConfigurations = {
      node: {
        [buildType]: {},
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackConfiguration(
      projectConfiguration,
      pathUtils,
      versionUtils,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(config);
    expect(versionUtils.getVersion).toHaveBeenCalledTimes(1);
    expect(versionUtils.getVersion).toHaveBeenCalledWith(revisionFilename);
    expect(targetConfiguration).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      {}
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      entry: {
        [target.name]: [
          'babel-polyfill',
          path.join(target.paths.source, target.entry[buildType]),
        ],
      },
      definitions: {
        'process.env.NODE_ENV': buildType,
      },
      version,
      hash: expect.any(Number),
      hashStr: expect.any(String),
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should generate the configuration for a library target', () => {
    // Given
    const revisionFilename = 'revision';
    const projectConfiguration = {
      version: {
        revisionFilename,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const version = 'latest';
    const versionUtils = {
      getVersion: jest.fn(() => version),
    };
    const config = {
      output: {
        path: 'some-output-path',
      },
    };
    const targetConfig = {
      getConfig: jest.fn(() => config),
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
      babel: {},
      library: true,
      libraryOptions: {},
    };
    const webpackConfigurations = {
      node: {
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
      projectConfiguration,
      pathUtils,
      versionUtils,
      targetConfiguration,
      webpackConfigurations
    );
    result = sut.getConfig(target, buildType);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(versionUtils.getVersion).toHaveBeenCalledTimes(1);
    expect(versionUtils.getVersion).toHaveBeenCalledWith(revisionFilename);
    expect(targetConfiguration).toHaveBeenCalledTimes(1);
    expect(targetConfiguration).toHaveBeenCalledWith(
      `webpack/${target.name}.${buildType}.config.js`,
      {}
    );
    expect(targetConfig.getConfig).toHaveBeenCalledTimes(1);
    expect(targetConfig.getConfig).toHaveBeenCalledWith({
      target,
      entry: {
        [target.name]: [path.join(target.paths.source, target.entry[buildType])],
      },
      definitions: {
        'process.env.NODE_ENV': buildType,
      },
      version,
      hash: expect.any(Number),
      hashStr: expect.any(String),
    });
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(config.output.path);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
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
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.versionUtils).toBe('versionUtils');
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
