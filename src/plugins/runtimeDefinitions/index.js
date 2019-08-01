const ObjectUtils = require('wootils/shared/objectUtils');
const { DefinePlugin } = require('webpack');
/**
 * This is a webpack plugin that works with `webpack.DefinePlugin` in order to reload all
 * definitions when the bundle changes.
 */
class ProjextWebpackRuntimeDefinitions {
  /**
   * @param {Array}                                   files         The list of files that need to
   *                                                                change in order to reload
   *                                                                the definitions.
   * @param {Function():Object}                       definitionsFn When this function is called,
   *                                                                it should return the object
   *                                                                with the definitions.
   * @param {ProjextWebpackRuntimeDefinitionsOptions} [options={}]  The options to customize the
   *                                                                plugin instance.
   * @throws {Error} If `files` is not an Array.
   * @throws {Error} If `files` is empty.
   * @throws {Error} If `definitionsFn` is not a function.
   */
  constructor(files, definitionsFn, options = {}) {
    if (!Array.isArray(files) || !files.length) {
      throw new Error('You need to provide a valid files list');
    }

    if (typeof definitionsFn !== 'function') {
      throw new Error('You need to provide a valid definitions function');
    }

    /**
     * The list of files that need to change in order to reload the definitions.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._files = files;
    /**
     * The function that will generate the definitions.
     * @type {Function():Object}
     * @access protected
     * @ignore
     */
    this._definitionsFn = definitionsFn;
    /**
     * The options to customize the plugin instance.
     * @type {ProjextWebpackRuntimeDefinitionsOptions}
     * @access protected
     * @ignore
     */
    this._options = ObjectUtils.merge(
      {
        name: 'projext-webpack-plugin-runtime-definitions',
      },
      options
    );
    /**
     * This is where the plugin will "refresh" the definitions when the bundle changes.
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._values = {};
  }
  /**
   * Get the options that customize the plugin instance.
   * @return {ProjextWebpackRuntimeDefinitionsOptions}
   */
  getOptions() {
    return this._options;
  }
  /**
   * This is called by webpack when the plugin is being processed. The method will create a new
   * instance of `webpack.DefinePlugin` and set all the values as "runtime values", so they'll
   * get evaluated every time the bundle is generated.
   * The method will also tap into the `compile` hook, so this plugin can refresh the values (by
   * calling the `definitionFn`) when the bundle is about to be generated.
   * @param {Object} compiler The compiler information provided by webpack.
   */
  apply(compiler) {
    const plugin = new DefinePlugin(this._getDefinePluginSettings());
    plugin.apply(compiler);
    compiler.hooks.compile.tap(
      this._options.name,
      this._onCompilationStarts.bind(this)
    );
  }
  /**
   * Reloads the saved values on the instance by calling the `definitionsFn`.
   * @access protected
   * @ignore
   */
  _reloadValues() {
    this._values = this._definitionsFn();
    return this._values;
  }
  /**
   * Generates the settings for `webpack.DefinePlugin`. It basically creates a "runtime value" for
   * each of the definitions keys and sets a function that will call this instance.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _getDefinePluginSettings() {
    const keys = Object.keys(this._reloadValues());
    return keys.reduce(
      (settings, key) => Object.assign({}, settings, {
        [key]: DefinePlugin.runtimeValue(
          () => this._getValue(key),
          this._files
        ),
      }),
      {}
    );
  }
  /**
   * Get a single value from a definition already loaded.
   * @param {string} key The definition key.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getValue(key) {
    return this._values[key];
  }
  /**
   * This is called by webpack when the bundle compilation starts. The method just reloads the
   * definition values on the instance so they'll be available when `webpack.DefinePlugin` tries
   * to access them.
   * @access protected
   * @ignore
   */
  _onCompilationStarts() {
    this._reloadValues();
  }
}

module.exports = ProjextWebpackRuntimeDefinitions;
