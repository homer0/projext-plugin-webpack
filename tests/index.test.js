const JimpleMock = require('/tests/mocks/jimple.mock');

const pluginName = 'projext-plugin-webpack';

jest.mock('jimple', () => JimpleMock);
jest.mock('../package.json', () => ({ name: pluginName }));
jest.unmock('/src/index');

require('jasmine-expect');

const plugin = require('/src/index');

describe('plugin:projextWebpack', () => {
  it('should register all the services', () => {
    // Given
    const app = {
      register: jest.fn(),
      set: jest.fn(),
    };
    let externalsFunction = null;
    let result = null;
    // When
    plugin(app);
    [[, externalsFunction]] = app.set.mock.calls;
    result = externalsFunction();
    // Then
    expect(result).toEqual([
      `${pluginName}/express`,
      `${pluginName}/jimpex`,
    ]);
    expect(app.set).toHaveBeenCalledTimes(1);
    expect(app.set).toHaveBeenCalledWith('webpackDefaultExternals', expect.any(Function));
    expect(app.register).toHaveBeenCalledTimes([
      'webpackConfiguration',
      'webpackBuildEngine',
      'webpackBaseConfiguration',
      'webpackBrowserDevelopmentConfiguration',
      'webpackBrowserProductionConfiguration',
      'webpackLoadersConfiguration',
      'webpackNodeDevelopmentConfiguration',
      'webpackNodeProductionConfiguration',
      'webpackMiddlewares',
    ].length);
  });
});
