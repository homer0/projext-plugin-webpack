const webpackMock = require('/tests/mocks/webpack.mock');

jest.unmock('/src/plugins/runtimeDefinitions');
jest.mock('webpack', () => webpackMock);

const ProjextWebpackRuntimeDefinitions = require('/src/plugins/runtimeDefinitions');

describe('plugins:runtimeDefinitions', () => {
  beforeEach(() => {
    webpackMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    let result = null;
    // When
    sut = new ProjextWebpackRuntimeDefinitions(['file'], () => {});
    result = sut.getOptions();
    // Then
    expect(sut).toBeInstanceOf(ProjextWebpackRuntimeDefinitions);
    expect(result).toEqual({
      name: 'projext-webpack-plugin-runtime-definitions',
    });
  });

  it('should throw error when instantiated without a files list', () => {
    // Given/When/Then
    expect(() => new ProjextWebpackRuntimeDefinitions())
    .toThrow(/You need to provide a valid files list/i);
  });

  it('should throw error when instantiated without a definitions function', () => {
    // Given/When/Then
    expect(() => new ProjextWebpackRuntimeDefinitions(['file']))
    .toThrow(/You need to provide a valid definitions function/i);
  });

  it('should be instantiated with custom option', () => {
    // Given
    const options = {
      name: 'custom',
    };
    let sut = null;
    let result = null;
    // When
    sut = new ProjextWebpackRuntimeDefinitions(['file'], () => {}, options);
    result = sut.getOptions();
    // Then
    expect(sut).toBeInstanceOf(ProjextWebpackRuntimeDefinitions);
    expect(result).toEqual(options);
  });

  it('should create the DefinePlugin and hook to the compilation', () => {
    // Given
    webpackMock.DefinePluginRuntimeValueMock.mockImplementationOnce((fn) => fn());
    const files = ['file'];
    const definitionVarName = 'ROSARIO';
    const definitionVarValue = 'Charito!';
    const definitionFn = jest.fn(() => ({
      [definitionVarName]: definitionVarValue,
    }));
    const compiler = {
      hooks: {
        compile: {
          tap: jest.fn(),
        },
      },
    };
    let sut = null;
    // When
    sut = new ProjextWebpackRuntimeDefinitions(files, definitionFn);
    sut.apply(compiler);
    // Then
    expect(definitionFn).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginRuntimeValueMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginRuntimeValueMock).toHaveBeenCalledWith(
      expect.any(Function),
      files
    );
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledTimes(1);
    expect(webpackMock.DefinePluginMock).toHaveBeenCalledWith({
      [definitionVarName]: definitionVarValue,
    });
    expect(compiler.hooks.compile.tap).toHaveBeenCalledTimes(1);
    expect(compiler.hooks.compile.tap).toHaveBeenCalledWith(
      sut.getOptions().name,
      expect.any(Function)
    );
  });

  it('should refresh the definitions when the bundle changes', () => {
    // Given
    webpackMock.DefinePluginRuntimeValueMock.mockImplementationOnce((fn) => fn());
    const definitionFn = jest.fn(() => ({}));
    const compiler = {
      hooks: {
        compile: {
          tap: jest.fn(),
        },
      },
    };
    let sut = null;
    let onCompile = null;
    // When
    sut = new ProjextWebpackRuntimeDefinitions(['file'], definitionFn);
    sut.apply(compiler);
    [[, onCompile]] = compiler.hooks.compile.tap.mock.calls;
    onCompile();
    // Then
    expect(definitionFn).toHaveBeenCalledTimes(2);
  });
});
