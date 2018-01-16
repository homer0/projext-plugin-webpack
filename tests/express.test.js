const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('woopack', () => ({ get: jest.fn() }));
jest.unmock('/src/express');

require('jasmine-expect');

const woopack = require('woopack');
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
    const target = 'target-name';
    let result = null;
    // When
    result = expressImplementation(expressApp, target);
    // Then
    expect(result).toEqual(info);
    expect(woopack.get).toHaveBeenCalledTimes(1);
    expect(woopack.get).toHaveBeenCalledWith('webpackMiddlewares');
    expect(webpackMiddlewares.generate).toHaveBeenCalledTimes(1);
    expect(webpackMiddlewares.generate).toHaveBeenCalledWith(target);
    expect(expressApp.use).toHaveBeenCalledTimes(info.middlewares.length);
    info.middlewares.forEach(() => {
      expect(expressApp.use).toHaveBeenCalledWith(middlewareCall);
    });
  });
});
