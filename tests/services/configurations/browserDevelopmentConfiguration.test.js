const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('/src/interfaces/configurationFile', () => ConfigurationFileMock);
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
    const projectConfiguration = 'projectConfiguration';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    let sut = null;
    // When
    sut = new WebpackBrowserDevelopmentConfiguration(
      appLogger,
      events,
      pathUtils,
      projectConfiguration,
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
    expect(sut.projectConfiguration).toBe(projectConfiguration);
  });

  it('should create a configuration', () => {
    // Given
    const appLogger = 'appLogger';
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      paths: {
        output: {
          js: 'statics/js',
          css: 'statics/css',
        },
      },
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
    const params = {
      target,
      definitions,
      entry,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: `${projectConfiguration.paths.output.js}/[name].js`,
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
      projectConfiguration,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(ExtractTextPlugin).toHaveBeenCalledTimes(1);
    expect(ExtractTextPlugin).toHaveBeenCalledWith(
      `${projectConfiguration.paths.output.css}/${target.name}.css`
    );
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(HtmlWebpackPlugin).toHaveBeenCalledWith(Object.assign(
      target.html,
      {
        template: `${target.paths.source}/${target.html.template}`,
        inject: 'body',
      }
    ));
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledWith({
      defaultAttribute: 'async',
    });
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(0);
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
  });

  it('should create a configuration with HMR and source map', () => {
    // Given
    const appLogger = 'appLogger';
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      paths: {
        output: {
          js: 'statics/js',
          css: 'statics/css',
        },
      },
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
    const params = {
      target,
      definitions,
      entry,
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
        filename: `${projectConfiguration.paths.output.js}/[name].js`,
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
      projectConfiguration,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(ExtractTextPlugin).toHaveBeenCalledTimes(1);
    expect(ExtractTextPlugin).toHaveBeenCalledWith(
      `${projectConfiguration.paths.output.css}/${target.name}.css`
    );
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(HtmlWebpackPlugin).toHaveBeenCalledWith(Object.assign(
      target.html,
      {
        template: `${target.paths.source}/${target.html.template}`,
        inject: 'body',
      }
    ));
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledWith({
      defaultAttribute: 'async',
    });
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(1);
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
    const projectConfiguration = {
      paths: {
        output: {
          js: 'statics/js',
          css: 'statics/css',
        },
      },
    };
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      runOnDevelopment: true,
      devServer: {},
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
    const params = {
      target,
      definitions,
      entry,
    };
    const expectedConfig = {
      devServer: {
        port: 2509,
        inline: false,
        open: true,
      },
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: `${projectConfiguration.paths.output.js}/[name].js`,
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
      projectConfiguration,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(ExtractTextPlugin).toHaveBeenCalledTimes(1);
    expect(ExtractTextPlugin).toHaveBeenCalledWith(
      `${projectConfiguration.paths.output.css}/${target.name}.css`
    );
    expect(HtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(HtmlWebpackPlugin).toHaveBeenCalledWith(Object.assign(
      target.html,
      {
        template: `${target.paths.source}/${target.html.template}`,
        inject: 'body',
      }
    ));
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledTimes(1);
    expect(ScriptExtHtmlWebpackPlugin).toHaveBeenCalledWith({
      defaultAttribute: 'async',
    });
    expect(webpackMock.HotModuleReplacementPluginMock).toHaveBeenCalledTimes(0);
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
    webpackBrowserDevelopmentConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackBrowserDevelopmentConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackBrowserDevelopmentConfiguration);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.events).toBe('events');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
  });
});
