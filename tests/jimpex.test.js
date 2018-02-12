const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('projext/index', () => ({ get: jest.fn() }));
jest.mock('jimpex', () => ({ middleware: jest.fn() }));
jest.mock('/src/jimpex/index', () => ({
  webpackFrontendFs: jest.fn(() => 'webpackFrontendFs'),
  webpackSendFile: 'webpackSendFile',
}));
jest.unmock('/src/jimpex.js');

require('jasmine-expect');

const projext = require('projext/index');
const jimpex = require('jimpex');
const jimpexServices = require('/src/jimpex/index');
const jimpexImplementation = require('/src/jimpex.js');

describe('plugin:projextWebpack/Jimpex', () => {
  beforeEach(() => {
    projext.get.mockClear();
    jimpexServices.webpackFrontendFs.mockClear();
  });

  it('should implement the middlewares on the Jimpex App', () => {
    // Given
    const events = {
      once: jest.fn(),
    };
    const services = {
      events,
    };
    const jimpexApp = {
      register: jest.fn(),
      use: jest.fn(),
      get: jest.fn((service) => services[service] || service),
    };
    const middlewareCall = 'middleware!';
    const info = {
      middlewares: [
        () => middlewareCall,
        () => middlewareCall,
      ],
      getDirectory: 'getDirectory',
      getFileSystem: 'getFileSystem',
    };
    const webpackMiddlewares = {
      generate: jest.fn(() => info),
    };
    projext.get.mockImplementationOnce(() => webpackMiddlewares);
    jimpex.middleware.mockImplementation((fn) => fn());
    const targetToBuild = 'target-to-build';
    const targetToServe = 'target-to-serve';
    const expectedRegisteredServices = [
      'webpackFrontendFs',
      'webpackSendFile',
    ];
    // When
    jimpexImplementation(jimpexApp, targetToBuild, targetToServe);
    // Then
    expect(projext.get).toHaveBeenCalledTimes(1);
    expect(projext.get).toHaveBeenCalledWith('webpackMiddlewares');
    expect(webpackMiddlewares.generate).toHaveBeenCalledTimes(1);
    expect(webpackMiddlewares.generate).toHaveBeenCalledWith(targetToBuild, targetToServe);
    expect(jimpexApp.register).toHaveBeenCalledTimes(expectedRegisteredServices.length);
    expectedRegisteredServices.forEach((service) => {
      expect(jimpexApp.register).toHaveBeenCalledWith(service);
    });
    expect(jimpexApp.use).toHaveBeenCalledTimes(info.middlewares.length);
    info.middlewares.forEach(() => {
      expect(jimpexApp.use).toHaveBeenCalledWith(middlewareCall);
    });
    expect(jimpexServices.webpackFrontendFs).toHaveBeenCalledTimes(1);
    expect(jimpexServices.webpackFrontendFs).toHaveBeenCalledWith(
      info.getDirectory,
      info.getFileSystem
    );
    expect(events.once).toHaveBeenCalledTimes(1);
    expect(events.once).toHaveBeenCalledWith('after-start', expect.any(Function));
  });

  it('should add an "after start message" on the Jimpex App', () => {
    // Given
    const events = {
      once: jest.fn(),
    };
    const appLogger = {
      warning: jest.fn(),
    };
    const services = {
      events,
      appLogger,
    };
    const jimpexApp = {
      register: jest.fn(),
      use: jest.fn(),
      get: jest.fn((service) => services[service]),
    };
    const middlewareCall = 'middleware!';
    const info = {
      middlewares: [
        () => middlewareCall,
        () => middlewareCall,
      ],
      getDirectory: 'getDirectory',
      getFileSystem: 'getFileSystem',
    };
    const webpackMiddlewares = {
      generate: jest.fn(() => info),
    };
    projext.get.mockImplementationOnce(() => webpackMiddlewares);
    jimpex.middleware.mockImplementation((fn) => fn());
    const targetToBuild = 'target-to-build';
    const targetToServe = 'target-to-serve';
    let eventListener = null;
    const expectedRegisteredServices = [
      'webpackFrontendFs',
      'webpackSendFile',
    ];
    // When
    jimpexImplementation(jimpexApp, targetToBuild, targetToServe);
    [[, eventListener]] = events.once.mock.calls;
    eventListener();
    // Then
    expect(projext.get).toHaveBeenCalledTimes(1);
    expect(projext.get).toHaveBeenCalledWith('webpackMiddlewares');
    expect(webpackMiddlewares.generate).toHaveBeenCalledTimes(1);
    expect(webpackMiddlewares.generate).toHaveBeenCalledWith(targetToBuild, targetToServe);
    expect(jimpexApp.register).toHaveBeenCalledTimes(expectedRegisteredServices.length);
    expectedRegisteredServices.forEach((service) => {
      expect(jimpexApp.register).toHaveBeenCalledWith(service);
    });
    expect(jimpexApp.use).toHaveBeenCalledTimes(info.middlewares.length);
    info.middlewares.forEach(() => {
      expect(jimpexApp.use).toHaveBeenCalledWith(middlewareCall);
    });
    expect(jimpexServices.webpackFrontendFs).toHaveBeenCalledTimes(1);
    expect(jimpexServices.webpackFrontendFs).toHaveBeenCalledWith(
      info.getDirectory,
      info.getFileSystem
    );
    expect(events.once).toHaveBeenCalledTimes(1);
    expect(events.once).toHaveBeenCalledWith('after-start', expect.any(Function));
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledWith(expect.any(String));
  });
});
