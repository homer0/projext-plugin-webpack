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
jest.mock('optimize-css-assets-webpack-plugin');
jest.mock('webpack');
jest.mock('opener');
jest.unmock('/src/services/configurations/browserDevelopmentConfiguration');

require('jasmine-expect');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { ProjextWebpackOpenDevServer } = require('/src/plugins');

const {
  WebpackBrowserDevelopmentConfiguration,
  webpackBrowserDevelopmentConfiguration,
} = require('/src/services/configurations/browserDevelopmentConfiguration');

describe('services/configurations:browserDevelopmentConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    MiniCssExtractPluginMock.reset();
    HtmlWebpackPlugin.mockReset();
    ScriptExtHtmlWebpackPlugin.mockReset();
    OptimizeCssAssetsPlugin.mockReset();
    ProjextWebpackOpenDevServer.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const events = 'events';
    const pathUtils = 'pathUtils';
    const targetsHTML = 'targetsHTML';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const webpackPluginInfo = 'webpackPluginInfo';
    let sut = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
      events,
      pathUtils,
      targetsHTML,
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(sut.webpackPluginInfo).toBe(webpackPluginInfo);
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
    const webpackPluginInfo = 'webpackPluginInfo';
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
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(0);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(0);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
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
    const appLogger = 'appLogger';
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const targetsHTML = {
      getFilepath: jest.fn((targetInfo) => targetInfo.html.template),
    };
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const webpackPluginInfo = 'webpackPluginInfo';
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
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(0);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(0);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
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
    const webpackPluginInfo = 'webpackPluginInfo';
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
      css: {},
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
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
  });

  it('should create a configuration for building and running the dev server', () => {
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
    const webpackPluginInfo = {
      name: 'my-plugin',
    };
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
      css: {},
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
    const expectedURL = `http://${target.devServer.host}:${target.devServer.port}`;
    const expectedConfig = {
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: false,
        hot: true,
        publicPath: '/',
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?${expectedURL}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledWith(expectedURL, {
      logger: appLogger,
    });
  });

  it('should create a configuration for the dev server with historyApiFallback', () => {
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
    const webpackPluginInfo = {
      name: 'my-plugin',
    };
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
      css: {},
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
    const expectedURL = `http://${target.devServer.host}:${target.devServer.port}`;
    const expectedConfig = {
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: false,
        hot: true,
        publicPath: '/',
        historyApiFallback: true,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?${expectedURL}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledWith(expectedURL, {
      logger: appLogger,
    });
  });

  it('should create a configuration for building and running the dev server (SSL)', () => {
    // Given
    const appLogger = 'appLogger';
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
    const webpackPluginInfo = {
      name: 'my-plugin',
    };
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
      css: {},
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
    const expectedURL = `https://${target.devServer.host}:${target.devServer.port}`;
    const expectedConfig = {
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: false,
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
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.devServer.ssl.cert);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledWith(expectedURL, {
      logger: appLogger,
    });
  });

  it('should create a configuration for running the dev server with a custom host', () => {
    // Given
    const appLogger = 'appLogger';
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
    const webpackPluginInfo = {
      name: 'my-plugin',
    };
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
      css: {},
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
    const expectedURL = `https://${target.devServer.host}:${target.devServer.port}`;
    const expectedConfig = {
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: false,
        hot: true,
        publicPath: '/',
        host: target.devServer.host,
        https: target.devServer.ssl,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?${expectedURL}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledWith(expectedURL, {
      logger: appLogger,
    });
  });

  it('should create a configuration for running the dev server while proxied', () => {
    // Given
    const appLogger = 'appLogger';
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
    const webpackPluginInfo = {
      name: 'my-plugin',
    };
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
      css: {},
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
    const expectedURL = `http://${target.devServer.host}:${target.devServer.port}`;
    const expectedConfig = {
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: false,
        hot: true,
        publicPath: '/',
        public: target.devServer.host,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?${expectedURL}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledWith(expectedURL, {
      logger: appLogger,
    });
  });

  it('should create a configuration for running the dev server proxied with a custom host', () => {
    // Given
    const appLogger = 'appLogger';
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
    const webpackPluginInfo = {
      name: 'my-plugin',
    };
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
      css: {},
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
    const expectedURL = `http://${target.devServer.host}:${target.devServer.port}`;
    const expectedConfig = {
      devServer: {
        port: target.devServer.port,
        inline: false,
        open: false,
        hot: true,
        publicPath: '/',
        public: target.devServer.proxied.host,
      },
      entry: {
        [target.name]: [
          babelPolyfillEntry,
          `webpack-dev-server/client?${expectedURL}`,
          'webpack/hot/only-dev-server',
          targetEntry,
        ],
      },
      output: {
        path: `./${target.folders.build}`,
        filename: output.js,
        publicPath: '/',
      },
      mode: 'development',
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
      webpackBaseConfiguration,
      webpackPluginInfo
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
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NamedModulesPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith(definitions);
    expect(OptimizeCssAssetsPlugin).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-browser-development-configuration',
        'webpack-browser-configuration',
      ],
      expectedConfig,
      params
    );
    expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
    expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackOpenDevServer).toHaveBeenCalledWith(expectedURL, {
      logger: appLogger,
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
    expect(sut.webpackPluginInfo).toBe('webpackPluginInfo');
  });
});
