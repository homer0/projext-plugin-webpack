const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/index');

require('jasmine-expect');

const plugin = require('/src/index');

describe('plugin:woopackWebpack', () => {
  it('should register all the services', () => {
    // Given
    const app = {
      register: jest.fn(),
    };
    // When
    plugin(app);
    // Then
    expect(app.register).toHaveBeenCalledTimes([
      'webpackConfiguration',
      'webpackBuildEngine',
      'webpackBaseConfiguration',
      'webpackBrowserDevelopmentConfiguration',
      'webpackBrowserProductionConfiguration',
      'webpackLoadersConfiguration',
      'webpackNodeDevelopmentConfiguration',
      'webpackNodeProductionConfiguration',
    ].length);
  });
});
