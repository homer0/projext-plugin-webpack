jest.mock('opener');
jest.mock('child_process');
jest.unmock('/src/plugins/bundleRunner');

const path = require('path');
const { fork } = require('child_process');
const ProjextWebpackUtils = require('/src/plugins/utils');
const ProjextWebpackBundleRunner = require('/src/plugins/bundleRunner');

describe('plugins:bundleRunner', () => {
  beforeEach(() => {
    ProjextWebpackUtils.createLogger.mockClear();
    fork.mockClear();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    let result = null;
    // When
    sut = new ProjextWebpackBundleRunner();
    result = sut.getOptions();
    // Then
    expect(sut).toBeInstanceOf(ProjextWebpackBundleRunner);
    expect(result).toEqual({
      entry: null,
      name: 'projext-webpack-plugin-bundle-runner',
      logger: null,
    });
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledWith(
      'projext-webpack-plugin-bundle-runner',
      null
    );
  });

  it('should be instantiated with a custom logger', () => {
    // Given
    const logger = 'my-logger';
    let sut = null;
    let result = null;
    // When
    sut = new ProjextWebpackBundleRunner({ logger });
    result = sut.getOptions();
    // Then
    expect(sut).toBeInstanceOf(ProjextWebpackBundleRunner);
    expect(result).toEqual({
      entry: null,
      name: 'projext-webpack-plugin-bundle-runner',
      logger,
    });
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledTimes(1);
    expect(ProjextWebpackUtils.createLogger).toHaveBeenCalledWith(
      'projext-webpack-plugin-bundle-runner',
      logger
    );
  });

  it('should register the webpack hooks for the plugin', () => {
    // Given
    const name = 'my-plugin-instance';
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
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
    sut = new ProjextWebpackBundleRunner({ name });
    sut.apply(compiler);
    // Then
    expect(compiler.hooks.afterEmit.tapAsync).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.afterEmit.tapAsync).toHaveBeenCalledWith(name, expect.any(Function));
    expect(compiler.hooks.compile.tap).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.compile.tap).toHaveBeenCalledWith(name, expect.any(Function));
    expect(compiler.hooks.done.tap).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.done.tap).toHaveBeenCalledWith(name, expect.any(Function));
  });

  it('shouldn\'t find an entry after assets are emitted', () => {
    // Given
    const logger = {
      error: jest.fn(),
      info: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const otherEntry = 'other-entry';
    const compilation = {
      assets: {
        [otherEntry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    // Then
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(`The required entry (${entry}) doesn't exist`);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`These are the available entries: ${otherEntry}`);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should automatically select the only available entry', () => {
    // Given
    const logger = {
      success: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const compilation = {
      assets: {
        [entry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    // When
    sut = new ProjextWebpackBundleRunner();
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(2);
    expect(logger.success).toHaveBeenCalledWith(`Using the only available entry: ${entry}`);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should select the first one from a list of available entries', () => {
    // Given
    const logger = {
      warning: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const otherEntry = 'other-entry';
    const compilation = {
      assets: {
        'hot-update': {
          existsAt: 'hot-file.js',
        },
        'invalid: Stylesheet file': {
          existsAt: 'some-file.css',
        },
        'invalid: No existsAt path': {},
        [entry]: {
          existsAt: 'asset.js',
        },
        [otherEntry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    // When
    sut = new ProjextWebpackBundleRunner();
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    // Then
    expect(logger.warning).toHaveBeenCalledTimes(1);
    expect(logger.warning).toHaveBeenCalledWith(`Doing fallback to the first entry: ${entry}`);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info)
    .toHaveBeenCalledWith(`These are the available entries: ${entry}, ${otherEntry}`);
    expect(logger.success).toHaveBeenCalledTimes(1);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should select the specified entry the first time the assets are emitted', () => {
    // Given
    const logger = {
      success: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const compilation = {
      assets: {
        [entry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    onAssetsEmitted(compilation, callback);
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(2);
    expect(logger.success).toHaveBeenCalledWith(`Using the selected entry: ${entry}`);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should execute the bundle when the compilation ends', () => {
    // Given
    const logger = {
      success: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const compilation = {
      assets: {
        [entry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    onCompilationEnds();
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(3);
    expect(logger.success).toHaveBeenCalledWith(`Using the selected entry: ${entry}`);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(logger.success).toHaveBeenCalledWith('Starting the bundle execution');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledWith(resolvedEntry);
  });

  it('shouldn\'t execute the bundle if it\'s already running', () => {
    // Given
    fork.mockImplementationOnce(() => true);
    const logger = {
      success: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const compilation = {
      assets: {
        [entry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    onCompilationEnds();
    jest.runAllTimers();
    onCompilationEnds();
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(3);
    expect(logger.success).toHaveBeenCalledWith(`Using the selected entry: ${entry}`);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(logger.success).toHaveBeenCalledWith('Starting the bundle execution');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledWith(resolvedEntry);
  });

  it('shouldn\'t execute the bundle if no entry was selected', () => {
    // Given
    const logger = {
      error: jest.fn(),
      info: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const otherEntry = 'other-entry';
    const compilation = {
      assets: {
        [otherEntry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    onCompilationEnds();
    // Then
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(`The required entry (${entry}) doesn't exist`);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`These are the available entries: ${otherEntry}`);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledTimes(0);
  });

  it('should stop the bundle execution when the compilation starts', () => {
    // Given
    const instance = {
      kill: jest.fn(),
    };
    fork.mockImplementationOnce(() => instance);
    const logger = {
      success: jest.fn(),
      info: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const compilation = {
      assets: {
        [entry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    let onCompilationStarts = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    [[, onCompilationStarts]] = compiler.hooks.compile.tap.mock.calls;
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    onCompilationEnds();
    jest.runAllTimers();
    onCompilationStarts();
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(3);
    expect(logger.success).toHaveBeenCalledWith(`Using the selected entry: ${entry}`);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(logger.success).toHaveBeenCalledWith('Starting the bundle execution');
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Stopping the bundle execution');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledWith(resolvedEntry);
    expect(instance.kill).toHaveBeenCalledTimes(1);
  });

  it('should only try to stop the bundle execution when the instance is running', () => {
    // Given
    const instance = {
      kill: jest.fn(),
    };
    fork.mockImplementationOnce(() => instance);
    const logger = {
      success: jest.fn(),
      info: jest.fn(),
    };
    ProjextWebpackUtils.createLogger.mockImplementationOnce(() => logger);
    const compiler = {
      hooks: {
        afterEmit: {
          tapAsync: jest.fn(),
        },
        compile: {
          tap: jest.fn(),
        },
        done: {
          tap: jest.fn(),
        },
      },
    };
    const entry = 'my-entry';
    const compilation = {
      assets: {
        [entry]: {
          existsAt: 'other-asset.js',
        },
      },
    };
    const resolvedEntry = path.resolve(compilation.assets[entry].existsAt);
    const callback = jest.fn();
    let sut = null;
    let onAssetsEmitted = null;
    let onCompilationStarts = null;
    let onCompilationEnds = null;
    // When
    sut = new ProjextWebpackBundleRunner({ entry });
    sut.apply(compiler);
    [[, onAssetsEmitted]] = compiler.hooks.afterEmit.tapAsync.mock.calls;
    [[, onCompilationStarts]] = compiler.hooks.compile.tap.mock.calls;
    [[, onCompilationEnds]] = compiler.hooks.done.tap.mock.calls;
    onAssetsEmitted(compilation, callback);
    jest.runAllTimers();
    onCompilationEnds();
    jest.runAllTimers();
    onCompilationStarts();
    jest.runAllTimers();
    onCompilationStarts();
    jest.runAllTimers();
    // Then
    expect(logger.success).toHaveBeenCalledTimes(3);
    expect(logger.success).toHaveBeenCalledWith(`Using the selected entry: ${entry}`);
    expect(logger.success).toHaveBeenCalledWith(`Entry file: ${resolvedEntry}`);
    expect(logger.success).toHaveBeenCalledWith('Starting the bundle execution');
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Stopping the bundle execution');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledTimes(1);
    expect(fork).toHaveBeenCalledWith(resolvedEntry);
    expect(instance.kill).toHaveBeenCalledTimes(1);
  });
});
