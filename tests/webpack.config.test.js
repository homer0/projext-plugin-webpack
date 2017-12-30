const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('woopack', () => ({
  get: jest.fn(() => ({
    getWebpackConfig: () => 'webpackConfig',
  })),
}));
jest.unmock('/src/webpack.config');

require('jasmine-expect');
const woopack = require('woopack');
require('/src/webpack.config');

describe('plugin:webpack.config', () => {
  it('should register all the services', () => {
    // Given/When/Then
    expect(woopack.get).toHaveBeenCalledTimes(1);
    expect(woopack.get).toHaveBeenCalledWith('webpackBuildEngine');
  });
});
