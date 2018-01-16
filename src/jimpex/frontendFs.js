const path = require('path');
const { provider } = require('jimple');

class WebpackFrontendFs {
  constructor(getDirectory, getFileSystem) {
    this.getDirectory = getDirectory;
    this.getFileSystem = getFileSystem;
  }

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

  _getPath(rest) {
    return path.join(this.getDirectory(), rest);
  }
}

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
