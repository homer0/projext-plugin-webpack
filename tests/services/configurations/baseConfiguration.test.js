const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
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
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const webpackPluginInfo = 'webpackPluginInfo';
    const webpackRulesConfiguration = 'webpackRulesConfiguration';
    let sut = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      packageInfo,
      pathUtils,
      webpackPluginInfo,
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
    expect(sut.packageInfo).toBe(packageInfo);
    expect(sut.webpackPluginInfo).toBe(webpackPluginInfo);
    expect(sut.webpackRulesConfiguration).toBe(webpackRulesConfiguration);
  });

  it('should create the development configuration for a node target', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, toReduce) => toReduce),
    };
    const dependencyName = 'jimpex';
    const devDependencyName = 'projext';
    const packageInfo = {
      dependencies: {
        [dependencyName]: '2.1.1',
      },
      devDependencies: {
        [devDependencyName]: '3.0.5',
      },
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
    const params = {
      target,
      buildType: 'development',
    };
    const webpackRulesConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const pluginName = 'my-plugin';
    const pluginExternal = 'jimpex';
    const webpackPluginInfo = {
      name: pluginName,
      external: [pluginExternal],
    };
    const expectedConfig = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
      externals: {
        [`${pluginName}/${pluginExternal}`]: `commonjs ${pluginName}/${pluginExternal}`,
        [dependencyName]: `commonjs ${dependencyName}`,
        [devDependencyName]: `commonjs ${devDependencyName}`,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      packageInfo,
      pathUtils,
      webpackPluginInfo,
      webpackRulesConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledWith(params);
    expect(events.reduce).toHaveBeenCalledTimes(['externals', 'config'].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-externals-configuration-for-node',
        'webpack-externals-configuration',
      ],
      expectedConfig.externals,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-base-configuration-for-node',
        'webpack-base-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should create the production configuration for a node target', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, toReduce) => toReduce),
    };
    const dependencyName = 'jimpex';
    const devDependencyName = 'projext';
    const packageInfo = {
      dependencies: {
        [dependencyName]: '2.1.1',
      },
      devDependencies: {
        [devDependencyName]: '3.0.5',
      },
    };
    const pathUtils = 'pathUtils';
    const rules = 'rules';
    const target = {
      is: {
        node: true,
      },
    };
    const pluginName = 'my-plugin';
    const pluginExternal = 'jimpex';
    const webpackPluginInfo = {
      name: pluginName,
      external: [pluginExternal],
    };
    const config = {
      rules,
    };
    const webpackRulesConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const params = {
      target,
      buildType: 'production',
    };
    const expectedConfig = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
      externals: {
        [`${pluginName}/${pluginExternal}`]: `commonjs ${pluginName}/${pluginExternal}`,
        [dependencyName]: `commonjs ${dependencyName}`,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      packageInfo,
      pathUtils,
      webpackPluginInfo,
      webpackRulesConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledWith(params);
    expect(events.reduce).toHaveBeenCalledTimes(['externals', 'config'].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-externals-configuration-for-node',
        'webpack-externals-configuration',
      ],
      expectedConfig.externals,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-base-configuration-for-node',
        'webpack-base-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should mark a excluded module as an external dependency for a Node target', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, toReduce) => toReduce),
    };
    const dependencyName = 'jimpex';
    const devDependencyName = 'projext';
    const packageInfo = {
      dependencies: {
        [dependencyName]: '2.1.1',
      },
      devDependencies: {
        [devDependencyName]: '3.0.5',
      },
    };
    const pathUtils = 'pathUtils';
    const rules = 'rules';
    const validModuleToExclude = 'colors/safe';
    const invalidModuleToExclude = 'react-(\\w+)$';
    const target = {
      is: {
        node: true,
      },
      excludeModules: [
        validModuleToExclude,
        invalidModuleToExclude,
      ],
    };
    const config = {
      rules,
    };
    const params = {
      target,
      buildType: 'development',
    };
    const webpackRulesConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const pluginName = 'my-plugin';
    const pluginExternal = 'jimpex';
    const webpackPluginInfo = {
      name: pluginName,
      external: [pluginExternal],
    };
    const expectedConfig = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
      externals: {
        [validModuleToExclude]: `commonjs ${validModuleToExclude}`,
        [`${pluginName}/${pluginExternal}`]: `commonjs ${pluginName}/${pluginExternal}`,
        [dependencyName]: `commonjs ${dependencyName}`,
        [devDependencyName]: `commonjs ${devDependencyName}`,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      packageInfo,
      pathUtils,
      webpackPluginInfo,
      webpackRulesConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledWith(params);
    expect(events.reduce).toHaveBeenCalledTimes(['externals', 'config'].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-externals-configuration-for-node',
        'webpack-externals-configuration',
      ],
      expectedConfig.externals,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-base-configuration-for-node',
        'webpack-base-configuration',
      ],
      expectedConfig,
      params
    );
  });

  it('should create the configuration for a browser target', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, toReduce) => toReduce),
    };
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const rules = 'rules';
    const target = {
      is: {
        node: false,
      },
    };
    const webpackPluginInfo = 'webpackPluginInfo';
    const config = {
      rules,
    };
    const webpackRulesConfiguration = {
      getConfig: jest.fn(() => config),
    };
    const params = { target };
    const expectedConfig = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
      externals: {},
    };
    let sut = null;
    let result = null;
    // When
    sut = new WebpackBaseConfiguration(
      events,
      packageInfo,
      pathUtils,
      webpackPluginInfo,
      webpackRulesConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual(expectedConfig);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(webpackRulesConfiguration.getConfig).toHaveBeenCalledWith(params);
    expect(events.reduce).toHaveBeenCalledTimes(['externals', 'config'].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-externals-configuration-for-browser',
        'webpack-externals-configuration',
      ],
      expectedConfig.externals,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-base-configuration-for-browser',
        'webpack-base-configuration',
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
    webpackBaseConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackBaseConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackBaseConfiguration);
    expect(sut.events).toBe('events');
    expect(sut.packageInfo).toBe('packageInfo');
    expect(sut.webpackPluginInfo).toBe('webpackPluginInfo');
    expect(sut.webpackRulesConfiguration).toBe('webpackRulesConfiguration');
  });
});
