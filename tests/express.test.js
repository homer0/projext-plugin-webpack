const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('woopack/index', () => ({ get: jest.fn() }));
jest.unmock('/src/express');

require('jasmine-expect');

const woopack = require('woopack/index');
const expressImplementation = require('/src/express');

describe('plugin:woopackWebpack/Express', () => {
  it('should implement the middlewares on the Express App', () => {
    // Given
    const expressApp = {
      use: jest.fn(),
    };
    const middlewareCall = 'middleware!';
    const info = {
      middlewares: [
        () => middlewareCall,
        () => middlewareCall,
      ],
    };
    const webpackMiddlewares = {
      generate: jest.fn(() => info),
    };
    woopack.get.mockImplementationOnce(() => webpackMiddlewares);
    const targetToBuild = 'target-to-build';
    const targetToServe = 'target-to-serve';
    let result = null;
    // When
    result = expressImplementation(expressApp, targetToBuild, targetToServe);
    // Then
    expect(result).toEqual(info);
    expect(woopack.get).toHaveBeenCalledTimes(1);
    expect(woopack.get).toHaveBeenCalledWith('webpackMiddlewares');
    expect(webpackMiddlewares.generate).toHaveBeenCalledTimes(1);
    expect(webpackMiddlewares.generate).toHaveBeenCalledWith(targetToBuild, targetToServe);
    expect(expressApp.use).toHaveBeenCalledTimes(info.middlewares.length);
    info.middlewares.forEach(() => {
      expect(expressApp.use).toHaveBeenCalledWith(middlewareCall);
    });
  });
});
