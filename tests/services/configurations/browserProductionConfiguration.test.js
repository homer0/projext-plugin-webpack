const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const MiniCssExtractPluginMock = require('/tests/mocks/miniCssExtractPlugin.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('mini-css-extract-plugin', () => MiniCssExtractPluginMock);
jest.mock('html-webpack-plugin');
jest.mock('script-ext-html-webpack-plugin');
jest.mock('compression-webpack-plugin');
jest.mock('terser-webpack-plugin');
jest.mock('optimize-css-assets-webpack-plugin');
jest.mock('copy-webpack-plugin');
jest.mock('extra-watch-webpack-plugin');
jest.mock('webpack');
jest.unmock('/src/services/configurations/browserProductionConfiguration');

require('jasmine-expect');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const { ProjextWebpackRuntimeDefinitions } = require('/src/plugins');

const {
  WebpackBrowserProductionConfiguration,
  webpackBrowserProductionConfiguration,
} = require('/src/services/configurations/browserProductionConfiguration');

describe('services/configurations:browserProductionConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    MiniCssExtractPluginMock.reset();
    HtmlWebpackPlugin.mockReset();
    ScriptExtHtmlWebpackPlugin.mockReset();
    OptimizeCssAssetsPlugin.mockReset();
    TerserPlugin.mockReset();
    CompressionPlugin.mockReset();
    CopyWebpackPlugin.mockReset();
    ExtraWatchWebpackPlugin.mockReset();
    ProjextWebpackRuntimeDefinitions.mockReset();
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
      [
        'config/webpack/browser.production.config.js',
        'config/webpack/browser.config.js',
      ],
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
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
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
      css: {},
      uglifyOnProduction: true,
      watch: {
        production: false,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = ['file-to-watch'];
    const params = {
      target,
      definitions,
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
      optimization: {
        minimizer: expect.any(Array),
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledWith({
      filename: output.css,
    });
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
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(1);
    expect(TerserPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledWith({
      files: additionalWatch,
    });
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration with the uglifier disabled', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
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
      css: {},
      uglifyOnProduction: false,
      watch: {
        production: false,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      definitions,
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
      optimization: {
        minimize: false,
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledWith({
      filename: output.css,
    });
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
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(0);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration with watch mode', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
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
      css: {},
      uglifyOnProduction: true,
      watch: {
        production: true,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      definitions,
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
      optimization: {
        minimizer: expect.any(Array),
      },
      plugins: expect.any(Array),
      watch: target.watch.production,
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledWith({
      filename: output.css,
    });
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
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(1);
    expect(TerserPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration for a target that injects CSS', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
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
      css: {
        inject: true,
      },
      uglifyOnProduction: true,
      watch: {
        production: false,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      definitions,
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
      optimization: {
        minimizer: expect.any(Array),
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(0);
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
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(1);
    expect(TerserPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration with source map', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
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
      css: {},
      uglifyOnProduction: true,
      watch: {
        production: false,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      definitions,
      entry,
      output,
      copy,
      additionalWatch,
    };
    const expectedConfig = {
      devtool: 'source-map',
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        chunkFilename: output.jsChunks,
        publicPath: '/',
      },
      mode: 'production',
      optimization: {
        minimizer: expect.any(Array),
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledWith({
      filename: output.css,
    });
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
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(1);
    expect(TerserPlugin).toHaveBeenCalledWith({
      sourceMap: true,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
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
      libraryOptions: {},
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
      css: {},
      uglifyOnProduction: true,
      watch: {
        production: false,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      definitions,
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
      optimization: {
        minimizer: expect.any(Array),
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledWith({
      filename: output.css,
    });
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(1);
    expect(TerserPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(CompressionPlugin).toHaveBeenCalledTimes(0);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should add the Compression plugins for a library target when enabled by setting', () => {
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
      libraryOptions: {
        compress: true,
      },
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
      css: {},
      uglifyOnProduction: true,
      watch: {
        production: false,
      },
    };
    const definitions = 'definitions';
    const entry = {
      [target.name]: ['index.js'],
    };
    const output = {
      js: 'statics/js/build.js',
      jsChunks: 'statics/js/build.[name].js',
      css: 'statics/css/build.css',
    };
    const copy = ['file-to-copy'];
    const additionalWatch = [];
    const params = {
      target,
      definitions,
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
      optimization: {
        minimizer: expect.any(Array),
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
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(MiniCssExtractPluginMock.mocks.constructor).toHaveBeenCalledWith({
      filename: output.css,
    });
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackRuntimeDefinitions).toHaveBeenCalledWith(definitions);
    expect(TerserPlugin).toHaveBeenCalledTimes(1);
    expect(TerserPlugin).toHaveBeenCalledWith({
      sourceMap: false,
    });
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(CopyWebpackPlugin).toHaveBeenCalledWith(copy);
    expect(ExtraWatchWebpackPlugin).toHaveBeenCalledTimes(0);
    expect(CompressionPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-production-configuration',
        'webpack-browser-configuration',
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
