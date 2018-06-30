jest.mock('wootils/node/logger');
jest.unmock('/src/plugins/utils');

require('jasmine-expect');
const { Logger } = require('wootils/node/logger');
const ProjextWebpackUtils = require('/src/plugins/utils');

describe('plugins:utils', () => {
  describe('createLogger', () => {
    it('should create a logger if no instance is sent to be validate', () => {
      // Given
      let result = null;
      // When
      result = ProjextWebpackUtils.createLogger();
      // Then
      expect(result).toBeInstanceOf(Logger);
    });

    it('should return the same received instance when it\'s an instance of Logger', () => {
      // Given
      const logger = new Logger();
      let result = null;
      // When
      result = ProjextWebpackUtils.createLogger('my-plugin', logger);
      // Then
      expect(result).toBe(logger);
    });

    it('should allow a method that support the same methods as Logger', () => {
      // Given
      const logger = {
        success: () => {},
        info: () => {},
        warning: () => {},
        error: () => {},
      };
      let result = null;
      // When
      result = ProjextWebpackUtils.createLogger('my-plugin', logger);
      // Then
      expect(result).toBe(logger);
    });

    it('should throw an error when an invalid logger is sent', () => {
      // Given
      const logger = {};
      const name = 'Charito';
      // When/Then
      expect(() => ProjextWebpackUtils.createLogger(name, logger))
      .toThrow(
        new RegExp(`${name}: The logger must be an instance of the wootils's Logger class`, 'i')
      );
    });
  });
});
