const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('html-webpack-plugin');
jest.mock('script-ext-html-webpack-plugin');
jest.mock('compression-webpack-plugin');
jest.mock('extract-text-webpack-plugin');
jest.mock('uglifyjs-webpack-plugin');
jest.mock('optimize-css-assets-webpack-plugin');
jest.mock('webpack');
jest.unmock('/src/services/configurations/browserProductionConfiguration');

require('jasmine-expect');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const {
  WebpackBrowserProductionConfiguration,
  webpackBrowserProductionConfiguration,
} = require('/src/services/configurations/browserProductionConfiguration');

describe('services/configurations:browserProductionConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    ExtractTextPlugin.mockReset();
    HtmlWebpackPlugin.mockReset();
    ScriptExtHtmlWebpackPlugin.mockReset();
    OptimizeCssAssetsPlugin.mockReset();
    UglifyJSPlugin.mockReset();
    CompressionPlugin.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const pathUtils = 'pathUtils';
    const targetsHTML = 'targetsHTML';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    let sut = null;
    // When
    sut = new WebpackBrowserProductionConfiguration(
      events,
      pathUtils,
      targetsHTML,
      webpackBaseConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackBrowserProductionConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'webpack/browser.production.config.js',
      true,
      webpackBaseConfiguration
    );
    expect(sut.events).toBe(events);
    expect(sut.targetsHTML).toBe(targetsHTML);
  });

  it('should create a configuration', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = jest.fn((targetInfo) => targetInfo.html.template);
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
      html: {
        template: 'index.html',
      },
      sourceMap: {},
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      css: 'statics/css/build.css',
    };
    const params = {
      target,
      definitions,
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
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBrowserProductionConfiguration(
      events,
      pathUtils,
      targetsHTML,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(ExtractTextPlugin).toHaveBeenCalledTimes(1);
    expect(ExtractTextPlugin).toHaveBeenCalledWith(output.css);
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(HtmlWebpackPlugin).toHaveBeenCalledWith(Object.assign(
      target.html,
      {
        template: target.html.template,
        inject: 'body',
      }
    ));
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledWith({
      defaultAttribute: 'async',
    });
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(UglifyJSPlugin).toHaveBeenCalledTimes(1);
    expect(UglifyJSPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-production-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML).toHaveBeenCalledTimes(1);
    expect(targetsHTML).toHaveBeenCalledWith(target);
  });

  it('should create a configuration with source map', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = jest.fn((targetInfo) => targetInfo.html.template);
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
      html: {
        template: 'index.html',
      },
      sourceMap: {
        production: true,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      css: 'statics/css/build.css',
    };
    const params = {
      target,
      definitions,
      entry,
      output,
    };
    const expectedConfig = {
      devtool: 'source-map',
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBrowserProductionConfiguration(
      events,
      pathUtils,
      targetsHTML,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(ExtractTextPlugin).toHaveBeenCalledTimes(1);
    expect(ExtractTextPlugin).toHaveBeenCalledWith(output.css);
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(HtmlWebpackPlugin).toHaveBeenCalledWith(Object.assign(
      target.html,
      {
        template: target.html.template,
        inject: 'body',
      }
    ));
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledWith({
      defaultAttribute: 'async',
    });
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(UglifyJSPlugin).toHaveBeenCalledTimes(1);
    expect(UglifyJSPlugin).toHaveBeenCalledWith({
      sourceMap: true,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-production-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML).toHaveBeenCalledTimes(1);
    expect(targetsHTML).toHaveBeenCalledWith(target);
  });

  it('shouldn\'t add the HTML and Compression plugins for a library target', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = 'targetsHTML';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      library: true,
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
      html: {
        template: 'index.html',
      },
      sourceMap: {},
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      css: 'statics/css/build.css',
    };
    const params = {
      target,
      definitions,
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
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBrowserProductionConfiguration(
      events,
      pathUtils,
      targetsHTML,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(ExtractTextPlugin).toHaveBeenCalledTimes(1);
    expect(ExtractTextPlugin).toHaveBeenCalledWith(output.css);
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(UglifyJSPlugin).toHaveBeenCalledTimes(1);
    expect(UglifyJSPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CompressionPlugin).toHaveBeenCalledTimes(0);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-production-configuration',
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
    webpackBrowserProductionConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackBrowserProductionConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackBrowserProductionConfiguration);
    expect(sut.events).toBe('events');
  });
});
