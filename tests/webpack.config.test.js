const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('projext/index', () => ({
  get: jest.fn(() => ({
    getWebpackConfig: () => 'webpackConfig',
  })),
}));
jest.unmock('/src/webpack.config');

require('jasmine-expect');
const projext = require('projext/index');
require('/src/webpack.config');

describe('plugin:webpack.config', () => {
  it('should register all the services', () => {
    // Given/When/Then
    expect(projext.get).toHaveBeenCalledTimes(1);
    expect(projext.get).toHaveBeenCalledWith('webpackBuildEngine');
  });
});
