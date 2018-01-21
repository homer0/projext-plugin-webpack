const path = require('path');
const { provider } = require('jimple');
/**
 * This service overwrites the `Jimpex` default `FrontendFs` so it will use the file system
 * provided by the Webpack middleware instead of using the real file system.
 */
class WebpackFrontendFs {
  /**
   * Class constructor.
   * @param {function():string}            getDirectory  A function to get the directory the
   *                                                     Webpack middleware is using.
   * @param {function():Promise<fs,Error>} getFileSystem A function to get the virtual file system
   *                                                     the Webpack middleware uses. It uses a
   *                                                     Promise in order to avoid accessing it
   *                                                     before the middleware finishes compiling.
   */
  constructor(getDirectory, getFileSystem) {
    /**
     * A function to get the directory the Webpack middleware is using.
     * @type {function():string}
     */
    this.getDirectory = getDirectory;
    /**
     * A function that returns a Promise with the virtual file system the Webpack middleware uses.
     * @type {function():Promise<fs,Error>}
     */
    this.getFileSystem = getFileSystem;
  }
  /**
   * Read a file from the file system.
   * @param {string} filepath           The path to the file.
   * @param {string} [encoding='utf-8'] The text encoding in which the file should be read.
   * @return {Promise<string,Error>}
   */
  read(filepath, encoding = 'utf-8') {
    return this.getFileSystem()
    .then((fileSystem) => new Promise((resolve, reject) => {
      fileSystem.readFile(this._getPath(filepath), encoding, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    }));
  }
  /**
   * Write a file on the file system.
   * @param {string} filepath The path to the file.
   * @param {string} data     The contents of the file.
   * @return {Promise<undefined,Error>}
   */
  write(filepath, data) {
    return this.getFileSystem()
    .then((fileSystem) => new Promise((resolve, reject) => {
      fileSystem.writeFile(this._getPath(filepath), data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }));
  }
  /**
   * Delete a file from the file system.
   * @param {string} filepath The path to the file.
   * @return {Promise<undefined,Error>}
   */
  delete(filepath) {
    return this.getFileSystem()
    .then((fileSystem) => new Promise((resolve, reject) => {
      fileSystem.unlink(this._getPath(filepath), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }));
  }
  /**
   * Generate a path using the virtual file system directory as root.
   * @param {string} rest The path you want to prefix with the file system directory.
   * @return {string}
   * @ignore
   * @access protected
   */
  _getPath(rest) {
    return path.join(this.getDirectory(), rest);
  }
}
/**
 * Generate a `Provider` with an already defined `getDirectory` and `getFileSystem` functions.
 * @example
 * // Generate the provider
 * const provider = webpackFrontendFs(() => 'some-dir', () => middleware.fs);
 * // Register it on the container
 * container.register(provider);
 * // Getting access to the service instance
 * const frontendFs = container.get('frontendFs');
 * @param {function():string}            getDirectory  A function to get the directory the
 *                                                     Webpack middleware is using.
 * @param {function():Promise<fs,Error>} getFileSystem A function to get the virtual file system
 *                                                     the Webpack middleware uses. It uses a
 *                                                     Promise in order to avoid accessing it
 *                                                     before the middleware finishes compiling.
 * @return {Provider}
 */
const webpackFrontendFs = (getDirectory, getFileSystem) => provider((app) => {
  app.set('frontendFs', () => new WebpackFrontendFs(
    getDirectory,
    getFileSystem
  ));
});

module.exports = {
  WebpackFrontendFs,
  webpackFrontendFs,
};
