const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/jimpex/frontendFs');

require('jasmine-expect');
const {
  WebpackFrontendFs,
  webpackFrontendFs,
} = require('/src/jimpex/frontendFs');

describe('jimpex/frontendFs', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const getDirectory = 'getDirectory';
    const getFileSystem = 'getFileSystem';
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    // Then
    expect(sut).toBeInstanceOf(WebpackFrontendFs);
    expect(sut.getDirectory).toBe(getDirectory);
    expect(sut.getFileSystem).toBe(getFileSystem);
  });

  it('should read a file', () => {
    // Given
    const error = null;
    const filepath = 'file.html';
    const contents = '<strong>content</strong>';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      readFile: jest.fn((file, enc, callback) => {
        callback(error, contents);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.read(filepath)
    .then((result) => {
      // Then
      expect(result).toBe(contents);
      expect(fileSystem.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystem.readFile).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        'utf-8',
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should read a file with custom encoding', () => {
    // Given
    const error = null;
    const filepath = 'file.html';
    const contents = '<strong>content</strong>';
    const encoding = 'utf-9';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      readFile: jest.fn((file, enc, callback) => {
        callback(error, contents);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.read(filepath, encoding)
    .then((result) => {
      // Then
      expect(result).toBe(contents);
      expect(fileSystem.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystem.readFile).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        encoding,
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to read a file', () => {
    // Given
    const error = new Error('Unknown error');
    const filepath = 'file.html';
    const contents = '<strong>content</strong>';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      readFile: jest.fn((file, enc, callback) => {
        callback(error, contents);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.read(filepath)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(fileSystem.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystem.readFile).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        'utf-8',
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    });
  });

  it('should write on a file', () => {
    // Given
    const error = null;
    const filepath = 'file.html';
    const contents = '<strong>content</strong>';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      writeFile: jest.fn((file, data, callback) => {
        callback(error);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.write(filepath, contents)
    .then(() => {
      // Then
      expect(fileSystem.writeFile).toHaveBeenCalledTimes(1);
      expect(fileSystem.writeFile).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        contents,
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to write on a file', () => {
    // Given
    const error = new Error('Unknown error');
    const filepath = 'file.html';
    const contents = '<strong>content</strong>';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      writeFile: jest.fn((file, data, callback) => {
        callback(error);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.write(filepath, contents)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(fileSystem.writeFile).toHaveBeenCalledTimes(1);
      expect(fileSystem.writeFile).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        contents,
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    });
  });

  it('should delete a file', () => {
    // Given
    const error = null;
    const filepath = 'file.html';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      unlink: jest.fn((file, callback) => {
        callback(error);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.delete(filepath)
    .then(() => {
      // Then
      expect(fileSystem.unlink).toHaveBeenCalledTimes(1);
      expect(fileSystem.unlink).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to delete a file', () => {
    // Given
    const error = new Error('Unknown error');
    const filepath = 'file.html';
    const directory = 'some-dir';
    const getDirectory = jest.fn(() => directory);
    const fileSystem = {
      unlink: jest.fn((file, callback) => {
        callback(error);
      }),
    };
    const getFileSystem = jest.fn(() => Promise.resolve(fileSystem));
    let sut = null;
    // When
    sut = new WebpackFrontendFs(getDirectory, getFileSystem);
    return sut.delete(filepath)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(fileSystem.unlink).toHaveBeenCalledTimes(1);
      expect(fileSystem.unlink).toHaveBeenCalledWith(
        `${directory}/${filepath}`,
        expect.any(Function)
      );
      expect(getDirectory).toHaveBeenCalledTimes(1);
      expect(getFileSystem).toHaveBeenCalledTimes(1);
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const app = {
      set: jest.fn(),
    };
    const getDirectory = 'getDirectory';
    const getFileSystem = 'getFileSystem';
    let sut = null;
    let provider = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    provider = webpackFrontendFs(getDirectory, getFileSystem);
    provider(app);
    [[serviceName, serviceFn]] = app.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('frontendFs');
    expect(sut).toBeInstanceOf(WebpackFrontendFs);
    expect(sut.getDirectory).toBe('getDirectory');
    expect(sut.getFileSystem).toBe('getFileSystem');
  });
});
