const mocks = {
  noEmitOnErrorsPlugin: jest.fn(),
  definePlugin: jest.fn(),
  definePluginApply: jest.fn(),
  definePluginRuntimeValue: jest.fn(),
  hotModuleReplacementPlugin: jest.fn(),
  namedModulesPlugin: jest.fn(),
};

class NoEmitOnErrorsPluginMock {
  constructor(...args) {
    this.constructorMock = mocks.noEmitOnErrorsPlugin;
    this.constructorMock(...args);
  }
}

class DefinePluginMock {
  static runtimeValue(...args) {
    return mocks.definePluginRuntimeValue(...args);
  }

  constructor(...args) {
    this.constructorMock = mocks.definePlugin;
    this.applyMock = mocks.definePluginApply;
    this.constructorMock(...args);
  }

  apply(...args) {
    this.applyMock(...args);
  }
}

class HotModuleReplacementPluginMock {
  constructor(...args) {
    this.constructorMock = mocks.hotModuleReplacementPlugin;
    this.constructorMock(...args);
  }
}

class NamedModulesPluginMock {
  constructor(...args) {
    this.constructorMock = mocks.namedModulesPlugin;
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
module.exports.DefinePluginApplyMock = mocks.definePluginApply;
module.exports.DefinePluginRuntimeValueMock = mocks.definePluginRuntimeValue;
module.exports.HotModuleReplacementPlugin = HotModuleReplacementPluginMock;
module.exports.HotModuleReplacementPluginMock = mocks.hotModuleReplacementPlugin;
module.exports.NamedModulesPlugin = NamedModulesPluginMock;
module.exports.NamedModulesPluginMock = mocks.namedModulesPlugin;
