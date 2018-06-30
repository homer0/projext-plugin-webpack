const { Logger } = require('wootils/node/logger');
/**
 * This is a set of utility methods the Projext webpack plugins use.
 */
class ProjextWebpackUtils {
  /**
   * Validate and create a {@link Logger} instance for a plugin.
   * If the logger the plugin received on its options is an instance of {@link Logger} or has the
   * same interface, it will _"accept it"_ and return it; If the plugin didn't receive a logger,
   * it will create a new instance of {@link Logger} and return it, but if the received logger
   * is an invalid object, it will throw an error.
   * @param {string}  plugin The plugin's instance name.
   * @param {?Logger} logger The logger the plugin received on its options.
   * @return {Logger}
   * @throws {Error} If the logger the plugin received is not an instance of {@link Logger} and it
   *                 doesn't have the same methods.
   * @static
   */
  static createLogger(plugin, logger) {
    let result;
    // If no logger was sent, create a new instance and set it as the return value.
    if (!logger) {
      result = new Logger();
    } else if (logger instanceof Logger) {
      // If the received logger is an instance of `Logger`, set it as the return value.
      result = logger;
    } else {
      // Validate if there's a `Logger` method the received logger doesn't support.
      const unsupportedMethod = ['success', 'info', 'warning', 'error']
      .find((method) => typeof logger[method] !== 'function');
      /**
       * If there's a method that doesn't support, throw and error, otherwise, set it to be
       * returned.
       */
      if (unsupportedMethod) {
        throw new Error(`${plugin}: The logger must be an instance of the wootils's Logger class`);
      } else {
        result = logger;
      }
    }
    // Return the logger for the plugin.
    return result;
  }
}

module.exports = ProjextWebpackUtils;
