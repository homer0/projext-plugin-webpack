const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('optimize-css-assets-webpack-plugin');
jest.unmock('/src/services/configurations/nodeDevelopmentConfiguration');

require('jasmine-expect');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { ProjextWebpackBundleRunner } = require('/src/plugins');

const {
  WebpackNodeDevelopmentConfiguration,
  webpackNodeDevelopmentConfiguration,
} = require('/src/services/configurations/nodeDevelopmentConfiguration');

describe('services/configurations:nodeDevelopmentConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    OptimizeCssAssetsPlugin.mockReset();
    ProjextWebpackBundleRunner.mockClear();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const events = 'events';
    const pathUtils = 'pathUtils';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    let sut = null;
    // When
    sut = new WebpackNodeDevelopmentConfiguration(
      appLogger,
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackNodeDevelopmentConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'config/webpack/node.development.config.js',
        'config/webpack/node.config.js',
      ],
      true,
      webpackBaseConfiguration
    );
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.events).toBe(events);
  });

  it('should create a configuration', () => {
    // Given
    const appLogger = 'appLogger';
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
      excludeModules: [],
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
    };
    const params = {
      target,
      entry,
      output,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      watch: false,
      mode: 'development',
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeDevelopmentConfiguration(
      appLogger,
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackBundleRunner).toHaveBeenCalledTimes(0);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-node-development-configuration',
        'webpack-node-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should create a configuration to run the target', () => {
    // Given
    const appLogger = 'appLogger';
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
      excludeModules: [],
      runOnDevelopment: true,
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
    };
    const params = {
      target,
      entry,
      output,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      watch: true,
      mode: 'development',
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeDevelopmentConfiguration(
      appLogger,
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackBundleRunner).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackBundleRunner).toHaveBeenCalledWith({
      logger: appLogger,
    });
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-node-development-configuration',
        'webpack-node-configuration',
      ],
      expectedConfig,
      params
    );
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
    webpackNodeDevelopmentConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackNodeDevelopmentConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackNodeDevelopmentConfiguration);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.events).toBe('events');
  });
});
