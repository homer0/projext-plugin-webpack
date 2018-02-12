const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('extract-text-webpack-plugin');
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.unmock('/src/services/configurations/rulesConfiguration');

require('jasmine-expect');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {
  WebpackRulesConfiguration,
  webpackRulesConfiguration,
} = require('/src/services/configurations/rulesConfiguration');

describe('services/configurations:rulesConfiguration', () => {
  const getExpectedRules = (
    target,
    babelConfig,
    extractResult = '',
    targetOutput = null
  ) => {
    const output = targetOutput || {
      images: expect.any(String),
      fonts: expect.any(String),
    };
    const rules = {};
    rules.jsRules = [{
      test: expect.any(RegExp),
      include: [
        RegExp(target.folders.source),
        RegExp('config'),
      ],
      use: [{
        loader: 'babel-loader',
        options: babelConfig,
      }],
    }];
    rules.scssExtractOptions = {
      fallback: expect.any(String),
      use: [
        {
          loader: 'css-loader',
          query: expect.any(Object),
        },
        'resolve-url-loader',
        {
          loader: 'sass-loader',
          options: expect.any(Object),
        },
      ],
    };
    rules.scssExtractOptionsWithModules = {
      fallback: expect.any(String),
      use: [
        {
          loader: 'css-loader',
          query: {
            importRules: 2,
            modules: true,
            localIdentName: '[name]__[local]___[hash:base64:5]',
          },
        },
        'resolve-url-loader',
        {
          loader: 'sass-loader',
          options: expect.any(Object),
        },
      ],
    };
    rules.cssExtractOptions = {
      fallback: 'style-loader',
      use: [
        'css-loader',
      ],
    };
    rules.scssRules = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: extractResult,
    }];
    rules.cssRules = [{
      test: expect.any(RegExp),
      use: extractResult,
    }];
    rules.htmlRules = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: [
        'raw-loader',
      ],
    }];
    rules.fontsRules = [
      {
        test: expect.any(RegExp),
        include: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: output.fonts,
            mimetype: 'image/svg+xml',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: output.fonts,
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: output.fonts,
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: output.fonts,
            mimetype: 'application/octet-stream',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: output.fonts,
          },
        }],
      },
    ];
    rules.imagesRules = [
      {
        test: expect.any(RegExp),
        exclude: expect.any(RegExp),
        use: [
          {
            loader: 'file-loader',
            options: {
              name: output.images,
              digest: 'hex',
            },
          },
          {
            loader: 'image-webpack-loader',
            query: expect.any(Object),
          },
        ],
      },
    ];
    rules.faviconRules = [
      {
        test: expect.any(RegExp),
        include: expect.any(RegExp),
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              digest: 'hex',
            },
          },
          {
            loader: 'image-webpack-loader',
            query: expect.any(Object),
          },
        ],
      },
    ];

    return rules;
  };

  beforeEach(() => {
    ConfigurationFileMock.reset();
    ExtractTextPlugin.extract.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const babelConfiguration = 'babelConfiguration';
    const events = 'events';
    const pathUtils = 'pathUtils';
    let sut = null;
    // When
    sut = new WebpackRulesConfiguration(
      babelConfiguration,
      events,
      pathUtils
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackRulesConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'webpack/rules.config.js'
    );
    expect(sut.babelConfiguration).toBe(babelConfiguration);
    expect(sut.events).toBe(events);
  });

  it('should return the rules for a node target', () => {
    // Given
    const version = 'latest';
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = 'projectConfiguration';
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      is: {
        node: true,
      },
    };
    const params = {
      target,
      version,
    };
    const expectedRules = getExpectedRules(target, babelConfig);
    let sut = null;
    let result = null;
    // When
    sut = new WebpackRulesConfiguration(
      babelConfiguration,
      events,
      pathUtils,
      projectConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual({
      rules: expect.any(Array),
    });
    expect(events.reduce).toHaveBeenCalledTimes([
      'getJSRules',
      'createNodeConfig',
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration-for-node',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-node',
      [
        ...expectedRules.jsRules,
      ],
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
        ],
      },
      params
    );
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith('config');
  });

  it('should return the rules for a browser target', () => {
    // Given
    const extractResult = 'extract';
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      is: {
        node: false,
      },
    };
    const params = {
      target,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      babelConfig,
      extractResult,
      output
    );
    let sut = null;
    let result = null;

    // When
    sut = new WebpackRulesConfiguration(
      babelConfiguration,
      events,
      pathUtils
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual({
      rules: expect.any(Array),
    });
    expect(events.reduce).toHaveBeenCalledTimes([
      'getJSRules',
      'getSCSSRules',
      'getCSSRules',
      'getHTMLRules',
      'getFontsRules',
      'getImagesRules',
      'getFaviconsRules',
      'createBrowserConfig',
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration-for-browser',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration-for-browser',
      expectedRules.scssRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration-for-browser',
      expectedRules.cssRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration-for-browser',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration-for-browser',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration-for-browser',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration-for-browser',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-browser',
      [
        ...expectedRules.jsRules,
        ...expectedRules.scssRules,
        ...expectedRules.cssRules,
        ...expectedRules.htmlRules,
        ...expectedRules.fontsRules,
        ...expectedRules.imagesRules,
        ...expectedRules.faviconRules,
      ],
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRules,
          ...expectedRules.cssRules,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith('config');
    expect(ExtractTextPlugin.extract).toHaveBeenCalledTimes(['scss', 'css'].length);
    expect(ExtractTextPlugin.extract).toHaveBeenCalledWith(expectedRules.scssExtractOptions);
    expect(ExtractTextPlugin.extract).toHaveBeenCalledWith(expectedRules.cssExtractOptions);
  });

  it('should return the rules for a browser target that uses CSS modules', () => {
    // Given
    const extractResult = 'extract';
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        output: {
          fonts: 'statics/fonts',
          images: 'statics/images',
        },
      },
    };
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      is: {
        node: false,
      },
      CSSModules: true,
    };
    const params = {
      target,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      babelConfig,
      extractResult,
      output
    );
    let sut = null;
    let result = null;

    // When
    sut = new WebpackRulesConfiguration(
      babelConfiguration,
      events,
      pathUtils,
      projectConfiguration
    );
    result = sut.getConfig(params);
    // Then
    expect(result).toEqual({
      rules: expect.any(Array),
    });
    expect(events.reduce).toHaveBeenCalledTimes([
      'getJSRules',
      'getSCSSRules',
      'getCSSRules',
      'getHTMLRules',
      'getFontsRules',
      'getImagesRules',
      'getFaviconsRules',
      'createBrowserConfig',
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration-for-browser',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration-for-browser',
      expectedRules.scssRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration-for-browser',
      expectedRules.cssRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration-for-browser',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration-for-browser',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration-for-browser',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration-for-browser',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-browser',
      [
        ...expectedRules.jsRules,
        ...expectedRules.scssRules,
        ...expectedRules.cssRules,
        ...expectedRules.htmlRules,
        ...expectedRules.fontsRules,
        ...expectedRules.imagesRules,
        ...expectedRules.faviconRules,
      ],
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRules,
          ...expectedRules.cssRules,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith('config');
    expect(ExtractTextPlugin.extract).toHaveBeenCalledTimes(['scss', 'css'].length);
    expect(ExtractTextPlugin.extract)
    .toHaveBeenCalledWith(expectedRules.scssExtractOptionsWithModules);
    expect(ExtractTextPlugin.extract).toHaveBeenCalledWith(expectedRules.cssExtractOptions);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    webpackRulesConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackRulesConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackRulesConfiguration);
    expect(sut.babelConfiguration).toBe('babelConfiguration');
    expect(sut.events).toBe('events');
  });
});
