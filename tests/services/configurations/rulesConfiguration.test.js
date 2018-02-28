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
    // Define the dictionary of paths for the static files.
    const output = targetOutput || {
      images: expect.any(String),
      fonts: expect.any(String),
    };
    // Define the rules expectations...
    const rules = {};
    // - JS Rules
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
    // - SCSS Rules
    const scssUse = [
      {
        loader: 'css-loader',
        query: expect.any(Object),
      },
      'resolve-url-loader',
      {
        loader: 'sass-loader',
        options: expect.any(Object),
      },
    ];
    const scssUseWithModules = [
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
    ];
    // - - Extract options
    rules.scssExtractOptions = {
      fallback: expect.any(String),
      use: scssUse,
    };
    rules.scssExtractOptionsWithModules = {
      fallback: expect.any(String),
      use: scssUseWithModules,
    };
    // - - Rules
    rules.scssRulesForBrowser = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: extractResult,
    }];
    rules.scssRulesForNode = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: scssUse,
    }];
    rules.scssRulesForNodeWithModules = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: scssUseWithModules,
    }];
    // - CSS Rules
    const cssUse = [
      'css-loader',
    ];
    // - - Extract options
    rules.cssExtractOptions = {
      fallback: 'style-loader',
      use: cssUse,
    };
    // - - Rules
    rules.cssRulesForBrowser = [{
      test: expect.any(RegExp),
      use: extractResult,
    }];
    rules.cssRulesForNode = [{
      test: expect.any(RegExp),
      use: cssUse,
    }];
    // - HTML Rules
    rules.htmlRules = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: [
        'raw-loader',
      ],
    }];
    // - Fonts Rules
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
    // - Images Rules
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
    // - Favicon Rules
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
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
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
        browser: false,
      },
    };
    const params = {
      target,
      version,
      output,
    };
    const expectedRules = getExpectedRules(target, babelConfig, '', output);
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
      'getJSRulesForNode',
      'getJSRules',
      'getSCSSRulesForNode',
      'getSCSSRules',
      'getCSSRulesForNode',
      'getCSSRules',
      'getHTMLRulesForNode',
      'getHTMLRules',
      'getFontsRulesForNode',
      'getFontsRules',
      'getImagesRulesForNode',
      'getImagesRules',
      'getFaviconsRulesForNode',
      'getFaviconsRules',
      'createNodeConfig',
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration-for-node',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration-for-node',
      expectedRules.scssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration',
      expectedRules.scssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration-for-node',
      expectedRules.cssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration',
      expectedRules.cssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration-for-node',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration-for-node',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration-for-node',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration-for-node',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-node',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForNode,
          ...expectedRules.cssRulesForNode,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForNode,
          ...expectedRules.cssRulesForNode,
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
  });

  it('should return the rules for a node target that uses CSS Modules', () => {
    // Given
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
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
        browser: false,
      },
      CSSModules: true,
    };
    const params = {
      target,
      version,
      output,
    };
    const expectedRules = getExpectedRules(target, babelConfig, '', output);
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
      'getJSRulesForNode',
      'getJSRules',
      'getSCSSRulesForNode',
      'getSCSSRules',
      'getCSSRulesForNode',
      'getCSSRules',
      'getHTMLRulesForNode',
      'getHTMLRules',
      'getFontsRulesForNode',
      'getFontsRules',
      'getImagesRulesForNode',
      'getImagesRules',
      'getFaviconsRulesForNode',
      'getFaviconsRules',
      'createNodeConfig',
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration-for-node',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-rules-configuration',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration-for-node',
      expectedRules.scssRulesForNodeWithModules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration',
      expectedRules.scssRulesForNodeWithModules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration-for-node',
      expectedRules.cssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration',
      expectedRules.cssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration-for-node',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration-for-node',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration-for-node',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration-for-node',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-node',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForNodeWithModules,
          ...expectedRules.cssRulesForNode,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForNodeWithModules,
          ...expectedRules.cssRulesForNode,
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
        browser: true,
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
      'getJSRulesForBrowser',
      'getJSRules',
      'getSCSSRulesForBrowser',
      'getSCSSRules',
      'getCSSRulesForBrowser',
      'getCSSRules',
      'getHTMLRulesForBrowser',
      'getHTMLRules',
      'getFontsRulesForBrowser',
      'getFontsRules',
      'getImagesRulesForBrowser',
      'getImagesRules',
      'getFaviconsRulesForBrowser',
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
      'webpack-js-rules-configuration',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration-for-browser',
      expectedRules.scssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration',
      expectedRules.scssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration-for-browser',
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration',
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration-for-browser',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration-for-browser',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration-for-browser',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration-for-browser',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-browser',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForBrowser,
          ...expectedRules.cssRulesForBrowser,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForBrowser,
          ...expectedRules.cssRulesForBrowser,
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
        browser: true,
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
      'getJSRulesForBrowser',
      'getJSRules',
      'getSCSSRulesForBrowser',
      'getSCSSRules',
      'getCSSRulesForBrowser',
      'getCSSRules',
      'getHTMLRulesForBrowser',
      'getHTMLRules',
      'getFontsRulesForBrowser',
      'getFontsRules',
      'getImagesRulesForBrowser',
      'getImagesRules',
      'getFaviconsRulesForBrowser',
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
      'webpack-js-rules-configuration',
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration-for-browser',
      expectedRules.scssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-rules-configuration',
      expectedRules.scssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration-for-browser',
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-rules-configuration',
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration-for-browser',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-rules-configuration',
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration-for-browser',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-rules-configuration',
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration-for-browser',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-rules-configuration',
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration-for-browser',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-rules-configuration',
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration-for-browser',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForBrowser,
          ...expectedRules.cssRulesForBrowser,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-rules-configuration',
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForBrowser,
          ...expectedRules.cssRulesForBrowser,
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
