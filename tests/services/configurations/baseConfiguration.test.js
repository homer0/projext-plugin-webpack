const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/configurationFile', () => ConfigurationFileMock);
jest.unmock('/src/services/configurations/baseConfiguration');

require('jasmine-expect');
const {
  WebpackBaseConfiguration,
  webpackBaseConfiguration,
} = require('/src/services/configurations/baseConfiguration');

describe('services/configurations:baseConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const pathUtils = 'pathUtils';
    const webpackRulesConfiguration = 'webpackRulesConfiguration';
    let sut = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      pathUtils,
      webpackRulesConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackBaseConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'webpack/base.config.js'
    );
    expect(sut.events).toBe(events);
    expect(sut.webpackRulesConfiguration).toBe(webpackRulesConfiguration);
  });

  it('should create the configuration for a node target', () => {
    // Given
    const message = 'done';
    const events = {
      reduce: jest.fn(() => message),
    };
    const pathUtils = 'pathUtils';
    const rules = 'rules';
    const target = {
      is: {
        node: true,
      },
    };
    const config = {
      rules,
    };
    const params = { target };
    const webpackRulesConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const expectedConfig = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      pathUtils,
      webpackRulesConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toBe(message);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledWith(params);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-base-configuration-for-node',
      expectedConfig,
      params
    );
  });

  it('should create the configuration for a browser target', () => {
    // Given
    const message = 'done';
    const events = {
      reduce: jest.fn(() => message),
    };
    const pathUtils = 'pathUtils';
    const rules = 'rules';
    const target = {
      is: {
        node: false,
      },
    };
    const config = {
      rules,
    };
    const params = { target };
    const webpackRulesConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const expectedConfig = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      pathUtils,
      webpackRulesConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toBe(message);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledWith(params);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-base-configuration-for-browser',
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
    webpackBaseConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackBaseConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackBaseConfiguration);
    expect(sut.events).toBe('events');
    expect(sut.webpackRulesConfiguration).toBe('webpackRulesConfiguration');
  });
});
