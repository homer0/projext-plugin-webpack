const { provider } = require('jimple');

class WebpackSendFile {
  constructor(frontendFs) {
    this.frontendFs = frontendFs;
    this.sendFile = this.sendFile.bind(this);
  }

  sendFile(res, filepath, next = () => {}) {
    this.frontendFs.read(filepath)
    .then((contents) => {
      res.write(contents);
      res.end();
    })
    .catch((error) => {
      next(error);
    });
  }
}

const webpackSendFile = provider((app) => {
  app.set('sendFile', () => new WebpackSendFile(
    app.get('frontendFs')
  ).sendFile);
});

module.exports = {
  WebpackSendFile,
  webpackSendFile,
};
