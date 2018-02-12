const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/engine');

require('jasmine-expect');
const {
  WebpackBuildEngine,
  webpackBuildEngine,
} = require('/src/services/building/engine');

describe('services/building:engine', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    let sut = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackBuildEngine);
    expect(sut.environmentUtils).toBe(environmentUtils);
    expect(sut.targets).toBe(targets);
    expect(sut.webpackConfiguration).toBe(webpackConfiguration);
  });

  it('should return the command to build a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const buildType = 'development';
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    result = sut.getBuildCommand(target, buildType);
    // Then
    expect(result).toMatch(/PROJEXT_WEBPACK_TARGET=(?:[\w0-9-_]*?).*?webpack/);
    expect(result).toMatch(/PROJEXT_WEBPACK_BUILD_TYPE=(?:\w+).*?webpack/);
    expect(result).toMatch(/PROJEXT_WEBPACK_RUN=(?:true|false).*?webpack/);
    expect(result).toMatch(/webpack --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack --config.*?--progress/);
    expect(result).toMatch(/webpack --config.*?--profile/);
    expect(result).toMatch(/webpack --config.*?--colors/);
  });

  it('should return the command to build and run a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const buildType = 'development';
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
      runOnDevelopment: true,
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    result = sut.getBuildCommand(target, buildType);
    // Then
    expect(result).toMatch(/PROJEXT_WEBPACK_TARGET=(?:[\w0-9-_]*?).*?webpack-dev-server/);
    expect(result).toMatch(/PROJEXT_WEBPACK_BUILD_TYPE=(?:\w+).*?webpack-dev-server/);
    expect(result).toMatch(/PROJEXT_WEBPACK_RUN=(?:true|false).*?webpack-dev-server/);
    expect(result).toMatch(/webpack-dev-server --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack-dev-server --config.*?--progress/);
    expect(result).toMatch(/webpack-dev-server --config.*?--profile/);
    expect(result).toMatch(/webpack-dev-server --config.*?--colors/);
  });

  it('should return the command to build and `force` run a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const buildType = 'development';
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
      runOnDevelopment: false,
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    result = sut.getBuildCommand(target, buildType, true);
    // Then
    expect(result).toMatch(/PROJEXT_WEBPACK_TARGET=(?:[\w0-9-_]*?).*?webpack-dev-server/);
    expect(result).toMatch(/PROJEXT_WEBPACK_BUILD_TYPE=(?:\w+).*?webpack-dev-server/);
    expect(result).toMatch(/PROJEXT_WEBPACK_RUN=(?:true|false).*?webpack-dev-server/);
    expect(result).toMatch(/webpack-dev-server --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack-dev-server --config.*?--progress/);
    expect(result).toMatch(/webpack-dev-server --config.*?--profile/);
    expect(result).toMatch(/webpack-dev-server --config.*?--colors/);
  });

  it('should return a target Webpack configuration from the configurations service', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const target = 'some-target';
    const buildType = 'production';
    const config = 'config';
    const webpackConfiguration = {
      getConfig: jest.fn(() => config),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    result = sut.getConfiguration(target, buildType);
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(target, buildType);
  });

  it('should return a target Webpack configuration', () => {
    // Given
    const targetName = 'some-target';
    const buildType = 'development';
    const run = false;
    const target = {
      name: targetName,
    };
    const envVars = {
      PROJEXT_WEBPACK_TARGET: targetName,
      PROJEXT_WEBPACK_BUILD_TYPE: buildType,
      PROJEXT_WEBPACK_RUN: run.toString(),
    };
    const envVarsNames = Object.keys(envVars);
    const environmentUtils = {
      get: jest.fn((varName) => envVars[varName]),
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const config = 'config';
    const webpackConfiguration = {
      getConfig: jest.fn(() => config),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    result = sut.getWebpackConfig();
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(target, buildType);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(environmentUtils.get).toHaveBeenCalledTimes(envVarsNames.length);
    envVarsNames.forEach((envVar) => {
      expect(environmentUtils.get).toHaveBeenCalledWith(envVar);
    });
  });

  it('should return a Webpack configuration for running a target', () => {
    // Given
    const targetName = 'some-target';
    const buildType = 'development';
    const run = true;
    const target = {
      name: targetName,
    };
    const envVars = {
      PROJEXT_WEBPACK_TARGET: targetName,
      PROJEXT_WEBPACK_BUILD_TYPE: buildType,
      PROJEXT_WEBPACK_RUN: run.toString(),
    };
    const envVarsNames = Object.keys(envVars);
    const environmentUtils = {
      get: jest.fn((varName) => envVars[varName]),
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const config = 'config';
    const webpackConfiguration = {
      getConfig: jest.fn(() => config),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    result = sut.getWebpackConfig();
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(Object.assign(
      {},
      target,
      {
        runOnDevelopment: true,
      }
    ), buildType);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(environmentUtils.get).toHaveBeenCalledTimes(envVarsNames.length);
    envVarsNames.forEach((envVar) => {
      expect(environmentUtils.get).toHaveBeenCalledWith(envVar);
    });
  });

  it('should thro an error when getting a configuration without the env variables', () => {
    // Given
    const envVarsNames = [
      'PROJEXT_WEBPACK_TARGET',
      'PROJEXT_WEBPACK_BUILD_TYPE',
      'PROJEXT_WEBPACK_RUN',
    ];
    const environmentUtils = {
      get: jest.fn(),
    };
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    let sut = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration
    );
    // Then
    expect(() => sut.getWebpackConfig()).toThrow(/can only be run by using the `build` command/);
    expect(environmentUtils.get).toHaveBeenCalledTimes(envVarsNames.length);
    envVarsNames.forEach((envVar) => {
      expect(environmentUtils.get).toHaveBeenCalledWith(envVar);
    });
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
    webpackBuildEngine(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackBuildEngine');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackBuildEngine);
    expect(sut.environmentUtils).toBe('environmentUtils');
    expect(sut.targets).toBe('targets');
    expect(sut.webpackConfiguration).toBe('webpackConfiguration');
  });
});
