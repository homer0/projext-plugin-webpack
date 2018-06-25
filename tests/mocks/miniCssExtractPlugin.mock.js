const mocks = {
  constructor: jest.fn(),
  loader: jest.fn(),
};

class MiniCssExtractPluginMock {
  static get mocks() {
    return mocks;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }

  static get loader() {
    return mocks.loader();
  }

  constructor(...args) {
    mocks.constructor(...args);
  }
}

module.exports = MiniCssExtractPluginMock;
