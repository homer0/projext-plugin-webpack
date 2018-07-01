jest.mock('opener');
jest.unmock('/src/plugins/openDevServer');

const opener = require('opener');
const ProjextWebpackUtils = require('/src/plugins/utils');
const ProjextWebpackOpenDevServer = require('/src/plugins/openDevServer');

describe('plugins:openDevServer', () => {
  beforeEach(() => {
    ProjextWebpackUtils.createLogger.mockClear();
  });

  it('should be instantiated', () => {
    // Given
    const url = 'http://chari.to';
    let sut = null;
    let result = null;
    let urlResult = null;
    // When
    sut = new ProjextWebpackOpenDevServer(url);
    result = sut.getOptions();
    urlResult = sut.getURL();
    // Then
    expect(sut).toBeInstanceOf(ProjextWebpackOpenDevServer);
    expect(result).toEqual({
      openBrowser: true,
      name: 'projext-webpack-plugin-open-dev-server',
      logger: null,
    });
    expect(urlResult).toBe(url);
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledWith(
      'projext-webpack-plugin-open-dev-server',
      null
    );
  });

  it('should be instantiated with a custom logger', () => {
    // Given
    const logger = 'my-logger';
    const url = 'http://chari.to';
    let sut = null;
    let result = null;
    // When
    sut = new ProjextWebpackOpenDevServer(url, { logger });
    result = sut.getOptions();
    // Then
    expect(sut).toBeInstanceOf(ProjextWebpackOpenDevServer);
    expect(result).toEqual({
      openBrowser: true,
      name: 'projext-webpack-plugin-open-dev-server',
      logger,
    });
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledWith(
      'projext-webpack-plugin-open-dev-server',
      logger
    );
  });

  it('should throw an error when instantiated without a URL', () => {
    // Given/When/Then
    expect(() => new ProjextWebpackOpenDevServer()).toThrow(/You need to specify a valid URL/i);
  });

  it('should register the webpack hooks for the plugin', () => {
    // Given
    const url = 'http://chari.to';
    const name = 'my-plugin-instance';
    const compiler = {
      hooks: {
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    let sut = null;
    // When
    sut = new ProjextWebpackOpenDevServer(url, { name });
    sut.apply(compiler);
    // Then
    expect(compiler.hooks.compile.tap).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.compile.tap).toHaveBeenCalledWith(name, expect.any(Function));
    expect(compiler.hooks.done.tap).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.done.tap).toHaveBeenCalledWith(name, expect.any(Function));
  });

  it('should log a message when compilation starts', () => {
    // Given
    const logger = {
      warning: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const url = 'http://chari.to';
    const compiler = {
      hooks: {
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    let sut = null;
    let onCompilationStarts = null;
    // When
    sut = new ProjextWebpackOpenDevServer(url);
    sut.apply(compiler);
    [[, onCompilationStarts]] = compiler.hooks.compile.tap.mock.calls;
    onCompilationStarts();
    // Then
    expect(logger.warning).toHaveBeenCalledTimes(2);
    expect(logger.warning).toHaveBeenCalledWith(`Starting on ${url}`);
    expect(logger.warning).toHaveBeenCalledWith('waiting for webpack...');
  });

  it('should log a message when compilation ends', () => {
    // Given
    const logger = {
      success: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const url = 'http://chari.to';
    const openBrowser = false;
    const compiler = {
      hooks: {
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    let sut = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackOpenDevServer(url, { openBrowser });
    sut.apply(compiler);
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onCompilationEnds();
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(1);
    expect(logger.success).toHaveBeenCalledWith(`Your app is running on ${url}`);
  });

  it('should open the browser when compilation ends (only once)', () => {
    // Given
    const logger = {
      success: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const url = 'http://chari.to';
    const openBrowser = true;
    const compiler = {
      hooks: {
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    let sut = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackOpenDevServer(url, { openBrowser });
    sut.apply(compiler);
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onCompilationEnds();
    jest.runAllTimers();
    onCompilationEnds();
    jest.runAllTimers();
    // Then
    expect(opener).toHaveBeenCalledTimes(1);
    expect(opener).toHaveBeenCalledWith(url);
    expect(logger.success).toHaveBeenCalledTimes(2);
    expect(logger.success).toHaveBeenCalledWith(`Your app is running on ${url}`);
    expect(logger.success).toHaveBeenCalledWith(`Your app is running on ${url}`);
  });
});
