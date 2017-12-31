const mocks = {
  webpackNodeUtilsRunner: jest.fn(),
  externals: jest.fn(() => 'externals-mock-result'),
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
  externals: mocks.externals,
  reset,
};
