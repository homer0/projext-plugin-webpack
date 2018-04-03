const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('html-webpack-plugin');
jest.mock('script-ext-html-webpack-plugin');
jest.mock('extract-text-webpack-plugin');
jest.mock('optimize-css-assets-webpack-plugin');
jest.mock('webpack');
jest.unmock('/src/services/configurations/browserDevelopmentConfiguration');

require('jasmine-expect');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const {
  WebpackBrowserDevelopmentConfiguration,
  webpackBrowserDevelopmentConfiguration,
} = require('/src/services/configurations/browserDevelopmentConfiguration');

describe('services/configurations:browserDevelopmentConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    ExtractTextPlugin.mockReset();
    HtmlWebpackPlugin.mockReset();
    ScriptExtHtmlWebpackPlugin.mockReset();
    OptimizeCssAssetsPlugin.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const events = 'events';
    const pathUtils = 'pathUtils';
    const targetsHTML = 'targetsHTML';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    let sut = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
      events,
      pathUtils,
      targetsHTML,
      webpackBaseConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackBrowserDevelopmentConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'webpack/browser.development.config.js',
      true,
      webpackBaseConfiguration
    );
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.events).toBe(events);
    expect(sut.targetsHTML).toBe(targetsHTML);
  });

  it('should create a configuration', () => {
    // Given
    const appLogger = 'appLogger';
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
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(0);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(0);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration with HMR and source map', () => {
    // Given
    const appLogger = 'appLogger';
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
        development: true,
      },
      hot: true,
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
      entry: {
        [target.name]: [
          'webpack-hot-middleware/client?reload=true',
          ...entry[target.name],
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      devtool: 'source-map',
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration for building and running the dev server', () => {
    // Given
    const compiler = {
      plugin: jest.fn(),
    };
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
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
      runOnDevelopment: true,
      devServer: {
        port: 2509,
        host: 'localhost',
        ssl: {},
        proxied: {},
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
      hot: true,
    };
    const definitions = 'definitions';
    const babelPolyfillEntry = 'babel-polyfill';
    const targetEntry = 'index.js';
    const entry = {
      [target.name]: [
        babelPolyfillEntry,
        targetEntry,
      ],
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
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: true,
        hot: true,
        publicPath: '/',
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          'webpack-dev-server/client?http://localhost:2509',
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    let devSeverPlugin = null;
    let devSeverPluginCompile = null;
    let devSeverPluginDone = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);

    devSeverPlugin = result.plugins.slice().pop();
    devSeverPlugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledTimes(['compile', 'done'].length);
    expect(compiler.plugin).toHaveBeenCalledWith('compile', expect.any(Function));
    expect(compiler.plugin).toHaveBeenCalledWith('done', expect.any(Function));
    [
      [, devSeverPluginCompile],
      [, devSeverPluginDone],
    ] = compiler.plugin.mock.calls;
    devSeverPluginCompile();
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    devSeverPluginDone();
    jest.runAllTimers();
    expect(appLogger.success).toHaveBeenCalledTimes(2);
  });

  it('should create a configuration for the dev server with historyApiFallback', () => {
    // Given
    const compiler = {
      plugin: jest.fn(),
    };
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
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
      runOnDevelopment: true,
      devServer: {
        port: 2509,
        host: 'localhost',
        ssl: {},
        proxied: {},
        historyApiFallback: true,
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
      hot: true,
    };
    const definitions = 'definitions';
    const babelPolyfillEntry = 'babel-polyfill';
    const targetEntry = 'index.js';
    const entry = {
      [target.name]: [
        babelPolyfillEntry,
        targetEntry,
      ],
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
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: true,
        hot: true,
        publicPath: '/',
        historyApiFallback: true,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          'webpack-dev-server/client?http://localhost:2509',
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    let devSeverPlugin = null;
    let devSeverPluginCompile = null;
    let devSeverPluginDone = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);

    devSeverPlugin = result.plugins.slice().pop();
    devSeverPlugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledTimes(['compile', 'done'].length);
    expect(compiler.plugin).toHaveBeenCalledWith('compile', expect.any(Function));
    expect(compiler.plugin).toHaveBeenCalledWith('done', expect.any(Function));
    [
      [, devSeverPluginCompile],
      [, devSeverPluginDone],
    ] = compiler.plugin.mock.calls;
    devSeverPluginCompile();
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    devSeverPluginDone();
    jest.runAllTimers();
    expect(appLogger.success).toHaveBeenCalledTimes(2);
  });

  it('should create a configuration for building and running the dev server (SSL)', () => {
    // Given
    const compiler = {
      plugin: jest.fn(),
    };
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      runOnDevelopment: true,
      devServer: {
        port: 2509,
        host: 'localhost',
        ssl: {
          key: null,
          cert: 'some/file.crt',
        },
        proxied: {},
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
    };
    const definitions = 'definitions';
    const babelPolyfillEntry = 'babel-polyfill';
    const targetEntry = 'index.js';
    const entry = {
      [target.name]: [
        babelPolyfillEntry,
        targetEntry,
      ],
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
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: true,
        https: target.devServer.ssl,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    let devSeverPlugin = null;
    let devSeverPluginCompile = null;
    let devSeverPluginDone = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.devServer.ssl.cert);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);

    devSeverPlugin = result.plugins.slice().pop();
    devSeverPlugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledTimes(['compile', 'done'].length);
    expect(compiler.plugin).toHaveBeenCalledWith('compile', expect.any(Function));
    expect(compiler.plugin).toHaveBeenCalledWith('done', expect.any(Function));
    [
      [, devSeverPluginCompile],
      [, devSeverPluginDone],
    ] = compiler.plugin.mock.calls;
    devSeverPluginCompile();
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    devSeverPluginDone();
    jest.runAllTimers();
    expect(appLogger.success).toHaveBeenCalledTimes(2);
  });

  it('should create a configuration for running the dev server with a custom host', () => {
    // Given
    const compiler = {
      plugin: jest.fn(),
    };
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      runOnDevelopment: true,
      devServer: {
        port: 2509,
        host: 'my-host',
        ssl: {
          key: null,
          cert: 'some/file.crt',
        },
        proxied: {},
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
      hot: true,
    };
    const definitions = 'definitions';
    const babelPolyfillEntry = 'babel-polyfill';
    const targetEntry = 'index.js';
    const entry = {
      [target.name]: [
        babelPolyfillEntry,
        targetEntry,
      ],
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
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: true,
        hot: true,
        publicPath: '/',
        host: target.devServer.host,
        https: target.devServer.ssl,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?https://${target.devServer.host}:${target.devServer.port}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    let devSeverPlugin = null;
    let devSeverPluginCompile = null;
    let devSeverPluginDone = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.devServer.ssl.cert);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);

    devSeverPlugin = result.plugins.slice().pop();
    devSeverPlugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledTimes(['compile', 'done'].length);
    expect(compiler.plugin).toHaveBeenCalledWith('compile', expect.any(Function));
    expect(compiler.plugin).toHaveBeenCalledWith('done', expect.any(Function));
    [
      [, devSeverPluginCompile],
      [, devSeverPluginDone],
    ] = compiler.plugin.mock.calls;
    devSeverPluginCompile();
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    devSeverPluginDone();
    jest.runAllTimers();
    expect(appLogger.success).toHaveBeenCalledTimes(2);
  });

  it('should create a configuration for running the dev server while proxied', () => {
    // Given
    const compiler = {
      plugin: jest.fn(),
    };
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      runOnDevelopment: true,
      devServer: {
        port: 2509,
        host: 'localhost',
        ssl: {},
        proxied: {
          enabled: true,
          host: null,
          https: null,
        },
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
      hot: true,
    };
    const definitions = 'definitions';
    const babelPolyfillEntry = 'babel-polyfill';
    const targetEntry = 'index.js';
    const entry = {
      [target.name]: [
        babelPolyfillEntry,
        targetEntry,
      ],
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
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: true,
        hot: true,
        publicPath: '/',
        public: target.devServer.host,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?http://${target.devServer.host}:${target.devServer.port}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    let devSeverPlugin = null;
    let devSeverPluginCompile = null;
    let devSeverPluginDone = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);

    devSeverPlugin = result.plugins.slice().pop();
    devSeverPlugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledTimes(['compile', 'done'].length);
    expect(compiler.plugin).toHaveBeenCalledWith('compile', expect.any(Function));
    expect(compiler.plugin).toHaveBeenCalledWith('done', expect.any(Function));
    [
      [, devSeverPluginCompile],
      [, devSeverPluginDone],
    ] = compiler.plugin.mock.calls;
    devSeverPluginCompile();
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    devSeverPluginDone();
    jest.runAllTimers();
    expect(appLogger.success).toHaveBeenCalledTimes(2);
  });

  it('should create a configuration for running the dev server proxied with a custom host', () => {
    // Given
    const compiler = {
      plugin: jest.fn(),
    };
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      runOnDevelopment: true,
      devServer: {
        port: 2509,
        host: 'localhost',
        ssl: {},
        proxied: {
          enabled: true,
          host: 'my-proxied-host',
          https: false,
        },
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
      hot: true,
    };
    const definitions = 'definitions';
    const babelPolyfillEntry = 'babel-polyfill';
    const targetEntry = 'index.js';
    const entry = {
      [target.name]: [
        babelPolyfillEntry,
        targetEntry,
      ],
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
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: true,
        hot: true,
        publicPath: '/',
        public: target.devServer.proxied.host,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?http://${target.devServer.host}:${target.devServer.port}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      plugins: expect.any(Array),
    };
    let sut = null;
    let result = null;
    let devSeverPlugin = null;
    let devSeverPluginCompile = null;
    let devSeverPluginDone = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-browser-development-configuration',
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);

    devSeverPlugin = result.plugins.slice().pop();
    devSeverPlugin.apply(compiler);
    expect(compiler.plugin).toHaveBeenCalledTimes(['compile', 'done'].length);
    expect(compiler.plugin).toHaveBeenCalledWith('compile', expect.any(Function));
    expect(compiler.plugin).toHaveBeenCalledWith('done', expect.any(Function));
    [
      [, devSeverPluginCompile],
      [, devSeverPluginDone],
    ] = compiler.plugin.mock.calls;
    devSeverPluginCompile();
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    devSeverPluginDone();
    jest.runAllTimers();
    expect(appLogger.success).toHaveBeenCalledTimes(2);
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
    webpackBrowserDevelopmentConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackBrowserDevelopmentConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackBrowserDevelopmentConfiguration);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.events).toBe('events');
    expect(sut.targetsHTML).toBe('targetsHTML');
  });
});
