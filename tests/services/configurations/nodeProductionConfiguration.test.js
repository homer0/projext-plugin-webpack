const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('optimize-css-assets-webpack-plugin');
jest.mock('copy-webpack-plugin');
jest.mock('extra-watch-webpack-plugin');
jest.mock('webpack-bundle-analyzer');
jest.unmock('/src/services/configurations/nodeProductionConfiguration');

require('jasmine-expect');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const {
  WebpackNodeProductionConfiguration,
  webpackNodeProductionConfiguration,
} = require('/src/services/configurations/nodeProductionConfiguration');

describe('services/configurations:nodeProductionConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    OptimizeCssAssetsPlugin.mockReset();
    CopyWebpackPlugin.mockReset();
    ExtraWatchWebpackPlugin.mockReset();
    BundleAnalyzerPlugin.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const pathUtils = 'pathUtils';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    let sut = null;
    // When
    sut = new WebpackNodeProductionConfiguration(
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackNodeProductionConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'config/webpack/node.production.config.js',
        'config/webpack/node.config.js',
      ],
      true,
      webpackBaseConfiguration
    );
    expect(sut.events).toBe(events);
  });

  it('should create a configuration', () => {
    // Given
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
      excludeModules: [],
      watch: {
        production: false,
      },
      sourceMap: {
        production: false,
      },
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = ['file-to-watch'];
    const params = {
      target,
      entry,
      output,
      copy,
      additionalWatch,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        chunkFilename: output.jsChunks,
        publicPath: '/',
      },
      mode: 'production',
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
      watch: target.watch.production,
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeProductionConfiguration(
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledWith({
      files: additionalWatch,
    });
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-node-production-configuration',
        'webpack-node-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should create a configuration and enable source maps', () => {
    // Given
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
      excludeModules: [],
      watch: {
        production: false,
      },
      sourceMap: {
        production: true,
      },
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      entry,
      output,
      copy,
      additionalWatch,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        chunkFilename: output.jsChunks,
        publicPath: '/',
      },
      mode: 'production',
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
      watch: target.watch.production,
      devtool: 'source-map',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeProductionConfiguration(
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-node-production-configuration',
        'webpack-node-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should create a configuration with the bundle analyzer', () => {
    // Given
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
      excludeModules: [],
      watch: {
        production: false,
      },
      sourceMap: {
        production: true,
      },
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const analyze = true;
    const params = {
      target,
      entry,
      output,
      copy,
      additionalWatch,
      analyze,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        chunkFilename: output.jsChunks,
        publicPath: '/',
      },
      mode: 'production',
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
      watch: target.watch.production,
      devtool: 'source-map',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeProductionConfiguration(
      events,
      pathUtils,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(BundleAnalyzerPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-node-production-configuration',
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
    webpackNodeProductionConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackNodeProductionConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackNodeProductionConfiguration);
    expect(sut.events).toBe('events');
  });
});
