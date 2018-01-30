const mocks = {
  constructor: jest.fn(),
};

class ConfigurationFileMock {
  static mock(name, mock) {
    mocks[name] = mock;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }

  constructor(pathUtils, ...args) {
    this.constructorMock = mocks.constructor;
    this.constructorMock(pathUtils, ...args);
    this.pathUtils = pathUtils;
  }

  getConfig(...args) {
    return this.createConfig(...args);
  }
}

module.exports = ConfigurationFileMock;
