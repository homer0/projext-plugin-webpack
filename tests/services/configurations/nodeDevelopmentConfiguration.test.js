const JimpleMock = require('/tests/mocks/jimple.mock');
const webpackMock = require('/tests/mocks/webpack.mock');
const webpackNodeUtilsMock = require('/tests/mocks/webpackNodeUtils.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('webpack', () => webpackMock);
jest.mock('webpack-node-utils', () => webpackNodeUtilsMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.unmock('/src/services/configurations/nodeDevelopmentConfiguration');

require('jasmine-expect');

const {
  WebpackNodeDevelopmentConfiguration,
  webpackNodeDevelopmentConfiguration,
} = require('/src/services/configurations/nodeDevelopmentConfiguration');

describe('services/configurations:nodeDevelopmentConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    webpackMock.reset();
    webpackNodeUtilsMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    let sut = null;
    // When
    sut = new WebpackNodeDevelopmentConfiguration(
      events,
      pathUtils,
      projectConfiguration,
      webpackBaseConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackNodeDevelopmentConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'webpack/node.development.config.js',
      true,
      webpackBaseConfiguration
    );
    expect(sut.events).toBe(events);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
  });

  it('should create a configuration', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const params = {
      target,
      entry,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: '[name].js',
        publicPath: '/',
      },
      watch: false,
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
      externals: 'externals-mock-result',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeDevelopmentConfiguration(
      events,
      pathUtils,
      projectConfiguration,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackNodeUtilsMock.WebpackNodeUtilsRunnerMockMock)
    .toHaveBeenCalledTimes(0);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-node-development-configuration',
      expectedConfig,
      params
    );
  });

  it('should create a configuration to run the target', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const webpackBaseConfiguration = 'webpackBaseConfiguration';
    const target = {
      name: 'targetName',
      folders: {
        build: 'build-folder',
      },
      paths: {
        source: 'source-path',
      },
      runOnDevelopment: true,
    };
    const entry = {
      [target.name]: ['index.js'],
    };
    const params = {
      target,
      entry,
    };
    const expectedConfig = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: '[name].js',
        publicPath: '/',
      },
      watch: true,
      plugins: expect.any(Array),
      target: 'node',
      node: {
        __dirname: false,
      },
      externals: 'externals-mock-result',
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackNodeDevelopmentConfiguration(
      events,
      pathUtils,
      projectConfiguration,
      webpackBaseConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackMock.NoEmitOnErrorsPluginMock).toHaveBeenCalledTimes(1);
    expect(webpackNodeUtilsMock.WebpackNodeUtilsRunnerMockMock)
    .toHaveBeenCalledTimes(1);
    expect(webpackNodeUtilsMock.externals).toHaveBeenCalledTimes(1);
    expect(webpackNodeUtilsMock.externals).toHaveBeenCalledWith({}, true);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-node-development-configuration',
      expectedConfig,
      params
    );
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
    webpackNodeDevelopmentConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackNodeDevelopmentConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackNodeDevelopmentConfiguration);
    expect(sut.events).toBe('events');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
  });
});
