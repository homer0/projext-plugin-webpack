const mocks = {
  webpackNodeUtilsRunner: jest.fn(),
  hotModuleReplacementPlugin: jest.fn(),
};

const reset = () => {
  Object.keys(mocks).forEach((name) => {
    mocks[name].mockClear();
  });
};

class WebpackNodeUtilsRunnerMock {
  constructor(...args) {
    this.constructorMock = mocks.webpackNodeUtilsRunner;
    this.constructorMock(...args);
  }
}

module.exports = {
  WebpackNodeUtilsRunner: WebpackNodeUtilsRunnerMock,
  WebpackNodeUtilsRunnerMockMock: mocks.webpackNodeUtilsRunner,
  reset,
};
