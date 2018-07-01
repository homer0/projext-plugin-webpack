const extend = require('extend');
const opener = require('opener');
const ProjextWebpackUtils = require('../utils');
/**
 * This is a webpack plugin that works as a tiny helper for the dev server: It logs clear messages
 * when the bundle isbeing created, when it's available, in which URL and it even opens the
 * browser.
 * The reason it was created was because the dev server log messages are hard to find and,
 * depending on the settings, when the dev server opens the browser, you can end up on
 * `/webpack-dev-server`.
 */
class ProjextWebpackOpenDevServer {
  /**
   * @param {string}                             url          The dev server URL.
   * @param {ProjextWebpackOpenDevServerOptions} [options={}] Settings to customize the plugin
   *                                                          behaviour.
   * @throws {Error} If `url` is not specified or if isn't a `string`.
   */
  constructor(url, options = {}) {
    /**
     * The plugin options.
     * @type {ProjextWebpackOpenDevServerOptions}
     * @access protected
     * @ignore
     */
    this._options = extend(
      true,
      {
        openBrowser: true,
        name: 'projext-webpack-plugin-open-dev-server',
        logger: null,
      },
      options
    );
    // Validate the recevied URL.
    if (!url || typeof url !== 'string') {
      throw new Error(`${this._options.name}: You need to specify a valid URL`);
    }
    /**
     * The dev server URL.
     * @type {string}
     */
    this._url = url;
    /**
     * A logger to output the plugin's information messages.
     * @type {Logger}
     * @access protected
     * @ignore
     */
    this._logger = ProjextWebpackUtils.createLogger(this._options.name, this._options.logger);
    /**
     * This flag is used to check if the browser was already open once. The method that opens the
     * browser is called every time the bundle is ready, which means every time it changes, but the
     * plugin will only open the browser the first time.
     * @type {boolean}
     * @access protected
     * @ignore
     */
    this._browserAlreadyOpen = false;
  }
  /**
   * Gets the plugin options.
   * @return {ProjextWebpackOpenDevServerOptions}
   */
  getOptions() {
    return this._options;
  }
  /**
   * Gets the dev server URL.
   * @return {string}
   */
  getURL() {
    return this._url;
  }
  /**
   * This is called by webpack when the plugin is being processed. The method takes care of adding
   * the required listener to the webpack hooks in order to log the information messages and
   * open the browser..
   * @param {Object} compiler The compiler information provided by webpack.
   */
  apply(compiler) {
    const { name } = this._options;
    compiler.hooks.compile.tap(name, this._onCompilationStarts.bind(this));
    compiler.hooks.done.tap(name, this._onCompilationEnds.bind(this));
  }
  /**
   * This is called by webpack when it starts compiling the bundle. This method just logs a
   * message with the server URL and that the user should wait for webpack to finish.
   * @access protected
   * @ignore
   */
  _onCompilationStarts() {
    this._logger.warning(`Starting on ${this._url}`);
    this._logger.warning('waiting for webpack...');
  }
  /**
   * This is called by webpack when it finishes compiling the bundle. It opens the browser, if
   * specified, and logs a message saying the bundle is ready on the server URL.
   * @access protected
   * @ignore
   */
  _onCompilationEnds() {
    // Make sure the browser should be opened and that it wasn't already.
    if (this._options.openBrowser && !this._browserAlreadyOpen) {
      // Mark the flag in order to prevent the browser from being open again.
      this._browserAlreadyOpen = true;
      // Open the browser.
      opener(this._url);
    }
    // Prevent the output from being added on the same line as webpack messages.
    setTimeout(() => {
      this._logger.success(`Your app is running on ${this._url}`);
    }, 1);
  }
}

module.exports = ProjextWebpackOpenDevServer;
