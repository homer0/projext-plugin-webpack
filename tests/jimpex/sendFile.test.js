const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/jimpex/sendFile');

require('jasmine-expect');
const {
  WebpackSendFile,
  webpackSendFile,
} = require('/src/jimpex/sendFile');

describe('jimpex/sendFile', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const frontendFs = 'frontendFs';
    let sut = null;
    // When
    sut = new WebpackSendFile(frontendFs);
    // Then
    expect(sut).toBeInstanceOf(WebpackSendFile);
    expect(sut.frontendFs).toBe(frontendFs);
  });

  it('should send a file as a response', () => {
    // Given
    const response = {
      write: jest.fn(),
      end: jest.fn(),
    };
    const filepath = 'file.html';
    const contents = '<strong>content</strong>';
    let capturedPromise = Promise.resolve();
    const frontendFs = {
      read: jest.fn(() => {
        capturedPromise = capturedPromise.then(() => contents);
        return capturedPromise;
      }),
    };
    let sut = null;
    // When
    sut = new WebpackSendFile(frontendFs);
    sut.sendFile(response, filepath);
    return capturedPromise
    .then(() => {
      // Then
      expect(frontendFs.read).toHaveBeenCalledTimes(1);
      expect(frontendFs.read).toHaveBeenCalledWith(filepath);
      expect(response.write).toHaveBeenCalledTimes(1);
      expect(response.write).toHaveBeenCalledWith(contents);
      expect(response.end).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to send a file', () => {
    // Given
    const response = 'response';
    const filepath = 'file.html';
    const error = new Error('Unknown error');
    let capturedPromise = Promise.resolve();
    const frontendFs = {
      read: jest.fn(() => {
        capturedPromise = capturedPromise.then(() => Promise.reject(error));
        return capturedPromise;
      }),
    };
    let sut = null;
    // When
    sut = new WebpackSendFile(frontendFs);
    sut.sendFile(response, filepath);
    return capturedPromise
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(frontendFs.read).toHaveBeenCalledTimes(1);
      expect(frontendFs.read).toHaveBeenCalledWith(filepath);
    });
  });

  it(
    'should send the error to the next middleware if it fails to send a file',
    () => new Promise((resolve) => {
      // Given
      const response = 'response';
      const filepath = 'file.html';
      const error = new Error('Unknown error');
      const frontendFs = {
        read: jest.fn(() => Promise.reject(error)),
      };
      let sut = null;
      // When
      sut = new WebpackSendFile(frontendFs);
      sut.sendFile(response, filepath, (result) => {
        // Then
        expect(result).toBe(error);
        expect(frontendFs.read).toHaveBeenCalledTimes(1);
        expect(frontendFs.read).toHaveBeenCalledWith(filepath);
        resolve();
      });
    })
  );

  it('should include a provider for the DIC', () => {
    // Given
    const app = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let sut = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    webpackSendFile(app);
    [[serviceName, serviceFn]] = app.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('sendFile');
    expect(sut).toBeFunction();
  });
});
