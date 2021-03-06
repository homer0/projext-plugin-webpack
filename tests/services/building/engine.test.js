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
    const webpackPluginInfo = 'webpackPluginInfo';
    let sut = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackBuildEngine);
    expect(sut.environmentUtils).toBe(environmentUtils);
    expect(sut.targets).toBe(targets);
    expect(sut.webpackConfiguration).toBe(webpackConfiguration);
    expect(sut.webpackPluginInfo).toBe(webpackPluginInfo);
  });

  it('should return the command to build a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    const buildType = 'development';
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
    };
    let sut = null;
    let result = null;
    const expectedConfigPath = 'node_modules' +
      `/${webpackPluginInfo.name}/${webpackPluginInfo.configuration}`;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getBuildCommand(target, buildType);
    // Then
    expect(result).toMatch(/PXTWPK_TARGET=(?:[\w0-9-_]*?).*?webpack/);
    expect(result).toMatch(/PXTWPK_TYPE=(?:\w+).*?webpack/);
    expect(result).toMatch(/PXTWPK_RUN=false.*?webpack/);
    expect(result).toMatch(/PXTWPK_WATCH=false.*?webpack/);
    expect(result).toMatch(/PXTWPK_INSPECT=false.*?webpack/);
    expect(result).toMatch(/PXTWPK_ANALYZE=false.*?webpack/);
    expect(result).toMatch(new RegExp(`webpack --config ${expectedConfigPath}`));
    expect(result).toMatch(/webpack --config.*?--progress/);
    expect(result).toMatch(/webpack --config.*?--profile/);
    expect(result).toMatch(/webpack --config.*?--colors/);
  });

  it('should return the command to build and run a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
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
    const expectedConfigPath = 'node_modules' +
      `/${webpackPluginInfo.name}/${webpackPluginInfo.configuration}`;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getBuildCommand(target, buildType);
    // Then
    expect(result).toMatch(/PXTWPK_TARGET=(?:[\w0-9-_]*?).*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_TYPE=(?:\w+).*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_RUN=false.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_WATCH=false.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_INSPECT=false.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_ANALYZE=false.*?webpack-dev-server/);
    expect(result).toMatch(new RegExp(`webpack-dev-server --config ${expectedConfigPath}`));
    expect(result).toMatch(/webpack-dev-server --config.*?--progress/);
    expect(result).toMatch(/webpack-dev-server --config.*?--profile/);
    expect(result).toMatch(/webpack-dev-server --config.*?--colors/);
  });

  it('should return the command to build and `force` run a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
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
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getBuildCommand(target, buildType, true);
    // Then
    expect(result).toMatch(/PXTWPK_TARGET=(?:[\w0-9-_]*?).*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_TYPE=(?:\w+).*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_RUN=true.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_WATCH=false.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_INSPECT=false.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_ANALYZE=false.*?webpack-dev-server/);
    expect(result).toMatch(/webpack-dev-server --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack-dev-server --config.*?--progress/);
    expect(result).toMatch(/webpack-dev-server --config.*?--profile/);
    expect(result).toMatch(/webpack-dev-server --config.*?--colors/);
  });

  it('should return the command to build and `force` watch a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    const buildType = 'development';
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
      watch: {
        [buildType]: false,
      },
      runOnDevelopment: false,
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getBuildCommand(target, buildType, false, true);
    // Then
    expect(result).toMatch(/PXTWPK_TARGET=(?:[\w0-9-_]*?).*?webpack/);
    expect(result).toMatch(/PXTWPK_TYPE=(?:\w+).*?webpack/);
    expect(result).toMatch(/PXTWPK_RUN=false.*?webpack/);
    expect(result).toMatch(/PXTWPK_WATCH=true.*?webpack/);
    expect(result).toMatch(/PXTWPK_INSPECT=false.*?webpack/);
    expect(result).toMatch(/PXTWPK_ANALYZE=false.*?webpack/);
    expect(result).toMatch(/webpack --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack --config.*?--progress/);
    expect(result).toMatch(/webpack --config.*?--profile/);
    expect(result).toMatch(/webpack --config.*?--colors/);
  });

  it('should return the command to build and `force` inspect a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    const buildType = 'development';
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
      runOnDevelopment: false,
      inspect: {
        enabled: false,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getBuildCommand(target, buildType, true, false, true);
    // Then
    expect(result).toMatch(/PXTWPK_TARGET=(?:[\w0-9-_]*?).*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_TYPE=(?:\w+).*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_RUN=true.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_WATCH=false.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_INSPECT=true.*?webpack-dev-server/);
    expect(result).toMatch(/PXTWPK_ANALYZE=false.*?webpack-dev-server/);
    expect(result).toMatch(/webpack-dev-server --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack-dev-server --config.*?--progress/);
    expect(result).toMatch(/webpack-dev-server --config.*?--profile/);
    expect(result).toMatch(/webpack-dev-server --config.*?--colors/);
  });

  it('should return the command to build and analyze a target', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
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
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getBuildCommand(target, buildType, true, false, true, true);
    // Then
    expect(result).toMatch(/PXTWPK_TARGET=(?:[\w0-9-_]*?).*?webpack/);
    expect(result).toMatch(/PXTWPK_TYPE=(?:\w+).*?webpack/);
    expect(result).toMatch(/PXTWPK_RUN=true.*?webpack/);
    expect(result).toMatch(/PXTWPK_WATCH=false.*?webpack/);
    expect(result).toMatch(/PXTWPK_INSPECT=true.*?webpack/);
    expect(result).toMatch(/PXTWPK_ANALYZE=true.*?webpack/);
    expect(result).toMatch(/webpack --config ([\w_\-/]*?)webpack\.config\.js/);
    expect(result).toMatch(/webpack --config.*?--progress/);
    expect(result).toMatch(/webpack --config.*?--profile/);
    expect(result).toMatch(/webpack --config.*?--colors/);
  });

  it('should return a target webpack configuration from the configurations service', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const targets = 'targets';
    const target = 'some-target';
    const buildType = 'production';
    const config = 'config';
    const webpackConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getConfiguration(target, buildType);
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(target, buildType);
  });

  it('should return a target webpack configuration', () => {
    // Given
    const targetName = 'some-target';
    const buildType = 'development';
    const run = false;
    const watch = false;
    const inspect = false;
    const analyze = false;
    const target = {
      name: targetName,
      watch: {
        [buildType]: watch,
      },
    };
    const envVars = {
      PXTWPK_TARGET: targetName,
      PXTWPK_TYPE: buildType,
      PXTWPK_RUN: run.toString(),
      PXTWPK_WATCH: watch.toString(),
      PXTWPK_INSPECT: inspect.toString(),
      PXTWPK_ANALYZE: analyze.toString(),
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
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
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

  it('should return a webpack configuration for running a target', () => {
    // Given
    const targetName = 'some-target';
    const buildType = 'development';
    const run = true;
    const watch = true;
    const inspect = false;
    const analyze = false;
    const target = {
      name: targetName,
      watch: {
        [buildType]: watch,
      },
      inspect: {
        enabled: false,
      },
    };
    const envVars = {
      PXTWPK_TARGET: targetName,
      PXTWPK_TYPE: buildType,
      PXTWPK_RUN: run.toString(),
      PXTWPK_WATCH: watch.toString(),
      PXTWPK_INSPECT: inspect.toString(),
      PXTWPK_ANALYZE: analyze.toString(),
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
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getWebpackConfig();
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(
      Object.assign(
        {},
        target,
        {
          runOnDevelopment: true,
        }
      ),
      buildType
    );
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(environmentUtils.get).toHaveBeenCalledTimes(envVarsNames.length);
    envVarsNames.forEach((envVar) => {
      expect(environmentUtils.get).toHaveBeenCalledWith(envVar);
    });
  });

  it('should return a webpack configuration for running and inspecting a target', () => {
    // Given
    const targetName = 'some-target';
    const buildType = 'development';
    const run = true;
    const watch = true;
    const inspect = true;
    const analyze = false;
    const target = {
      name: targetName,
      watch: {
        [buildType]: watch,
      },
      inspect: {},
    };
    const envVars = {
      PXTWPK_TARGET: targetName,
      PXTWPK_TYPE: buildType,
      PXTWPK_RUN: run.toString(),
      PXTWPK_WATCH: watch.toString(),
      PXTWPK_INSPECT: inspect.toString(),
      PXTWPK_ANALYZE: analyze.toString(),
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
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getWebpackConfig();
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(
      Object.assign(
        {},
        target,
        {
          runOnDevelopment: true,
          inspect: {
            enabled: true,
          },
        }
      ),
      buildType
    );
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(environmentUtils.get).toHaveBeenCalledTimes(envVarsNames.length);
    envVarsNames.forEach((envVar) => {
      expect(environmentUtils.get).toHaveBeenCalledWith(envVar);
    });
  });

  it('should return a webpack configuration for bundling and analyzing a target', () => {
    // Given
    const targetName = 'some-target';
    const buildType = 'development';
    const run = true;
    const watch = true;
    const inspect = true;
    const analyze = true;
    const target = {
      name: targetName,
      watch: {
        [buildType]: watch,
      },
      inspect: {},
    };
    const envVars = {
      PXTWPK_TARGET: targetName,
      PXTWPK_TYPE: buildType,
      PXTWPK_RUN: run.toString(),
      PXTWPK_WATCH: watch.toString(),
      PXTWPK_INSPECT: inspect.toString(),
      PXTWPK_ANALYZE: analyze.toString(),
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
    const webpackPluginInfo = {
      name: 'my-projext-plugin-webpack',
      configuration: 'my-webpack.config.jsx',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
    );
    result = sut.getWebpackConfig();
    // Then
    expect(result).toBe(config);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackConfiguration.getConfig).toHaveBeenCalledWith(
      Object.assign(
        {},
        target,
        {
          analyze: true,
        }
      ),
      buildType
    );
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(environmentUtils.get).toHaveBeenCalledTimes(envVarsNames.length);
    envVarsNames.forEach((envVar) => {
      expect(environmentUtils.get).toHaveBeenCalledWith(envVar);
    });
  });

  it('should throw an error when getting a configuration without the env variables', () => {
    // Given
    const envVarsNames = [
      'PXTWPK_TARGET',
      'PXTWPK_TYPE',
      'PXTWPK_RUN',
      'PXTWPK_WATCH',
      'PXTWPK_INSPECT',
      'PXTWPK_ANALYZE',
    ];
    const environmentUtils = {
      get: jest.fn(),
    };
    const targets = 'targets';
    const webpackConfiguration = 'webpackConfiguration';
    const webpackPluginInfo = 'webpackPluginInfo';
    let sut = null;
    // When
    sut = new WebpackBuildEngine(
      environmentUtils,
      targets,
      webpackConfiguration,
      webpackPluginInfo
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
    expect(sut.webpackPluginInfo).toBe('webpackPluginInfo');
  });
});
