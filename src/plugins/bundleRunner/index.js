const path = require('path');
const { fork } = require('child_process');
const extend = require('extend');
const ProjextWebpackUtils = require('../utils');
/**
 * This is a webpack plugin that executes a Node bundle when it finishes compiling.
 */
class ProjextWebpackBundleRunner {
  /**
   * @param {ProjextWebpackBundleRunnerOptions} [options={}] Settings to customize the plugin
   *                                                         behaviour.
   */
  constructor(options = {}) {
    /**
     * The plugin options.
     * @type {ProjextWebpackBundleRunnerOptions}
     * @access protected
     * @ignore
     */
    this._options = extend(
      true,
      {
        entry: null,
        name: 'projext-webpack-plugin-bundle-runner',
        logger: null,
        inspect: {
          enabled: false,
          host: '0.0.0.0',
          port: 9229,
          command: 'inspect',
          ndb: false,
        },
      },
      options
    );
    /**
     * The options that are going to be sent to the `fork` function.
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._forkOptions = this._createForkOptions();
    /**
     * A logger to output the plugin's information messages.
     * @type {Logger}
     * @access protected
     * @ignore
     */
    this._logger = ProjextWebpackUtils.createLogger(this._options.name, this._options.logger);
    /**
     * The absolute path for the entry file that will be executed. This will be assigned after
     * webpack emits its assets.
     * @type {?string}
     * @access protected
     * @ignore
     */
    this._entryPath = null;
    /**
     * Once the bundle is executed, this property will hold the reference for the process.
     * @type {?ChildProcess}
     * @access protected
     * @ignore
     */
    this._instance = null;
    /**
     * This flag is used during the process in which the plugin finds the file to execute.
     * Since the process runs every time webpack emits assets, which happens every time the build
     * is updated, the flag is needed in order to prevent it from running more than once.
     * @type {boolean}
     * @access protected
     * @ignore
     */
    this._setupReady = false;
  }
  /**
   * Gets the plugin options.
   * @return {ProjextWebpackBundleRunnerOptions}
   */
  getOptions() {
    return this._options;
  }
  /**
   * This is called by webpack when the plugin is being processed. The method takes care of adding
   * the required listener to the webpack hooks in order to get the file, execute it and stop it.
   * @param {Object} compiler The compiler information provided by webpack.
   */
  apply(compiler) {
    const { name } = this._options;
    compiler.hooks.afterEmit.tapAsync(name, this._onAssetsEmitted.bind(this));
    compiler.hooks.compile.tap(name, this._onCompilationStarts.bind(this));
    compiler.hooks.done.tap(name, this._onCompilationEnds.bind(this));
  }
  /**
   * Generates the options for the `fork` function by evluating the inspect options.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _createForkOptions() {
    const result = {};
    const {
      enabled,
      host,
      port,
      command,
      ndb,
    } = this._options.inspect;
    if (enabled) {
      if (ndb) {
        result.execPath = 'ndb';
      } else {
        result.execArgv = [`--${command}=${host}:${port}`];
      }
    }

    return result;
  }
  /**
   * This is called by webpack every time assets are emitted. The first time the method is called,
   * it will validate the entries and try to obtain the path to the file that will be executed.
   * @param {Object}   compilation A dictionary with the assets information. Provided by webpack.
   * @param {Function} callback    A function the method needs to call so webpack can continue the
   *                               process.
   * @access protected
   * @ignore
   */
  _onAssetsEmitted(compilation, callback) {
    // Check if the assets weren't already validated.
    if (!this._setupReady) {
      // Make sure this block won't run again.
      this._setupReady = true;

      // Get the assets dictionary emitted by webpack.
      const { assets } = compilation;
      // Transform the dictionary into an array and clear invalid entries.
      const entries = Object.keys(assets).filter((asset) => (
        // No need for HMR entries.
        !asset.includes('hot-update') &&
        // Remove it if doesn't provide a path for a file.
        compilation.assets[asset].existsAt &&
        // Remove it if the file path is not for JS file.
        compilation.assets[asset].existsAt.match(/\.jsx?$/i)
      ));
      // Get the _"specified"_ entry from the plugin options.
      let { entry } = this._options;
      if (entry && !entries.includes(entry)) {
        // If an entry was specified but is not on the list, show an error.
        this._logger.error(`The required entry (${entry}) doesn't exist`);
        entry = null;
        // And show the list of available entries.
        this._logAvailableEntries(entries);
      } else if (!entry && entries.length === 1) {
        // If no entry was specified, but there's only one, use it.
        [entry] = entries;
        // Prevent the output from being added on the same line as webpack messages.
        setTimeout(() => {
          this._logger.success(`Using the only available entry: ${entry}`);
        }, 1);
      } else if (!entry && entries.length > 1) {
        // If no entry was specified and there are more than one, use the first one.
        [entry] = entries;
        // Prevent the output from being added on the same line as webpack messages.
        setTimeout(() => {
          this._logger.warning(`Doing fallback to the first entry: ${entry}`);
          // And show the list of available entries.
          this._logAvailableEntries(entries);
        }, 1);
      } else {
        /**
         * If this was reached, it means that an entry was specified and it was on the entries
         * list.
         */
        setTimeout(() => {
          this._logger.success(`Using the selected entry: ${entry}`);
        }, 1);
      }
      // After validating the entry, update the reference on the plugin options.
      this._options.entry = entry;
      // If after the validation, there's still an entry to use...
      if (entry) {
        // ...resolve its file path and save it on a local property.
        this._entryPath = path.resolve(compilation.assets[entry].existsAt);
        // Prevent the output from being added on the same line as webpack messages.
        setTimeout(() => {
          this._logger.success(`Entry file: ${this._entryPath}`);
        }, 1);
      }
    }
    // Invoke the callback to continue the webpack process.
    callback();
  }
  /**
   * This is called by webpack when it starts compiling the bundle. If there's a child process
   * running for the bundle, it will stop it and delete the reference.
   * @access protected
   * @ignore
   */
  _onCompilationStarts() {
    // Make sure the child process is running.
    if (this._instance) {
      // Prevent the output from being added on the same line as webpack messages.
      setTimeout(() => {
        this._logger.info('Stopping the bundle execution');
      }, 1);
      // Kill the child process.
      this._instance.kill();
      // Remove its reference from the plugin.
      this._instance = null;
    }
  }
  /**
   * This is called by webpack when it finishes compiling the bundle. If an entry was selected
   * on the assets hook, and there's no child process already running, fork a new one.
   * @access protected
   * @ignore
   */
  _onCompilationEnds() {
    // Make sure an entry was selected and there's no child process already running.
    if (this._options.entry && !this._instance) {
      // Fork a new instance of the bundle.
      this._instance = fork(this._entryPath, [], this._forkOptions);
      // Prevent the output from being added on the same line as webpack messages.
      setTimeout(() => {
        this._logger.success('Starting the bundle execution');
      }, 1);
    }
  }
  /**
   * This is called during the assets hook event if no entry was specified and there's more than
   * one, or if the specified entry wasn't found. The method logs the list of available entries
   * that can be used with the plugin.
   * @param {Array} entries The list of available entries.
   * @access protected
   * @ignore
   */
  _logAvailableEntries(entries) {
    const list = entries.join(', ');
    this._logger.info(`These are the available entries: ${list}`);
  }
}

module.exports = ProjextWebpackBundleRunner;
