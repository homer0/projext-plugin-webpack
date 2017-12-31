const mocks = {
  noEmitOnErrorsPlugin: jest.fn(),
  definePlugin: jest.fn(),
  hotModuleReplacementPlugin: jest.fn(),
};

class NoEmitOnErrorsPluginMock {
  constructor(...args) {
    this.constructorMock = mocks.noEmitOnErrorsPlugin;
    this.constructorMock(...args);
  }
}

class DefinePluginMock {
  constructor(...args) {
    this.constructorMock = mocks.definePlugin;
    this.constructorMock(...args);
  }
}

class HotModuleReplacementPluginMock {
  constructor(...args) {
    this.constructorMock = mocks.hotModuleReplacementPlugin;
    this.constructorMock(...args);
  }
}

class WebpackMock {
  static mock(name, mock) {
    mocks[name] = mock;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }
}

module.exports = WebpackMock;
module.exports.NoEmitOnErrorsPlugin = NoEmitOnErrorsPluginMock;
module.exports.NoEmitOnErrorsPluginMock = mocks.noEmitOnErrorsPlugin;
module.exports.DefinePlugin = DefinePluginMock;
module.exports.DefinePluginMock = mocks.definePlugin;
module.exports.HotModuleReplacementPlugin = HotModuleReplacementPluginMock;
module.exports.HotModuleReplacementPluginMock = mocks.hotModuleReplacementPlugin;
