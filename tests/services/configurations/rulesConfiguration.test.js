const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');
const MiniCssExtractPluginMock = require('/tests/mocks/miniCssExtractPlugin.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('mini-css-extract-plugin', () => MiniCssExtractPluginMock);
jest.unmock('/src/services/configurations/rulesConfiguration');

require('jasmine-expect');
const {
  WebpackRulesConfiguration,
  webpackRulesConfiguration,
} = require('/src/services/configurations/rulesConfiguration');

describe('services/configurations:rulesConfiguration', () => {
  const getTargetRules = () => {
    const fileTypes = [
      'js',
      'scss',
      'css',
      'fonts.common',
      'fonts.svg',
      'images',
      'favicon',
    ];

    const targetRulesSettings = {};
    const targetRules = {};
    const targetRulesMocks = [];
    fileTypes.forEach((type) => {
      targetRulesSettings[type] = {
        extension: `${type}-extension`,
        files: {
          include: [`${type}-include`],
          exclude: [`${type}-exclude`],
        },
      };
      const getRule = jest.fn(() => targetRulesSettings[type]);
      targetRulesMocks.push(getRule);
      const ruleInstance = { getRule };
      if (type.includes('.')) {
        const [typeName, subType] = type.split('.');
        if (!targetRules[typeName]) {
          targetRules[typeName] = {};
        }
        targetRules[typeName][subType] = ruleInstance;
      } else {
        targetRules[type] = ruleInstance;
      }
    });

    return {
      targetRules,
      targetRulesSettings,
      targetRulesMocks,
    };
  };
  const getExpectedRules = (
    target,
    targetRulesSettings,
    babelConfig,
    extractResult,
    targetOutput = null
  ) => {
    // Set the mock for the Mini CSS extract
    MiniCssExtractPluginMock.mocks.loader.mockImplementation(() => extractResult);
    // Define the dictionary of paths for the static files.
    const output = targetOutput || {
      images: expect.any(String),
      fonts: expect.any(String),
    };
    // Define the rules expectations...
    const rules = {};
    // - JS Rules
    rules.jsRules = [{
      test: targetRulesSettings.js.extension,
      include: targetRulesSettings.js.files.include,
      exclude: targetRulesSettings.js.files.exclude,
      use: [{
        loader: 'babel-loader',
        options: babelConfig,
      }],
    }];
    // - SCSS Rules
    const scssUseBase = [
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
    const scssUse = [
      extractResult,
      ...scssUseBase,
    ];
    const scssUseWithInject = [
      'style-loader',
      ...scssUseBase,
    ];
    const scssUseBaseWithModules = [
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
    const scssUseWithModules = [
      extractResult,
      ...scssUseBaseWithModules,
    ];
    const scssUseWithModulesAndInject = [
      'style-loader',
      ...scssUseBaseWithModules,
    ];
    // - - Rules
    rules.scssRulesForBrowser = [{
      test: targetRulesSettings.scss.extension,
      include: targetRulesSettings.scss.files.include,
      exclude: targetRulesSettings.scss.files.exclude,
      use: scssUse,
    }];
    rules.scssRulesForBrowserWithModules = [{
      test: targetRulesSettings.scss.extension,
      include: targetRulesSettings.scss.files.include,
      exclude: targetRulesSettings.scss.files.exclude,
      use: scssUseWithModules,
    }];
    rules.scssRulesForBrowserWithInject = [{
      test: targetRulesSettings.scss.extension,
      include: targetRulesSettings.scss.files.include,
      exclude: targetRulesSettings.scss.files.exclude,
      use: scssUseWithInject,
    }];
    rules.scssRulesForBrowserWithModulesAndInject = [{
      test: targetRulesSettings.scss.extension,
      include: targetRulesSettings.scss.files.include,
      exclude: targetRulesSettings.scss.files.exclude,
      use: scssUseWithModulesAndInject,
    }];
    rules.scssRulesForNode = [{
      test: targetRulesSettings.scss.extension,
      include: targetRulesSettings.scss.files.include,
      exclude: targetRulesSettings.scss.files.exclude,
      use: scssUseBase,
    }];
    rules.scssRulesForNodeWithModules = [{
      test: targetRulesSettings.scss.extension,
      include: targetRulesSettings.scss.files.include,
      exclude: targetRulesSettings.scss.files.exclude,
      use: scssUseBaseWithModules,
    }];
    // - CSS Rules
    const cssUseBase = [
      'css-loader',
    ];
    const cssUse = [
      extractResult,
      ...cssUseBase,
    ];
    const cssUseWithInject = [
      'style-loader',
      ...cssUseBase,
    ];
    // - - Rules
    rules.cssRulesForBrowser = [{
      test: targetRulesSettings.css.extension,
      include: targetRulesSettings.css.files.include,
      exclude: targetRulesSettings.css.files.exclude,
      use: cssUse,
    }];
    rules.cssRulesForBrowserWithInject = [{
      test: targetRulesSettings.css.extension,
      include: targetRulesSettings.css.files.include,
      exclude: targetRulesSettings.css.files.exclude,
      use: cssUseWithInject,
    }];
    rules.cssRulesForNode = [{
      test: targetRulesSettings.css.extension,
      include: targetRulesSettings.css.files.include,
      exclude: targetRulesSettings.css.files.exclude,
      use: cssUseBase,
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
        test: targetRulesSettings['fonts.common'].extension,
        include: targetRulesSettings['fonts.common'].files.include,
        exclude: targetRulesSettings['fonts.common'].files.exclude,
        use: [{
          loader: 'file-loader',
          options: {
            name: output.fonts,
          },
        }],
      },
      {
        test: targetRulesSettings['fonts.svg'].extension,
        include: targetRulesSettings['fonts.svg'].files.include,
        exclude: targetRulesSettings['fonts.svg'].files.exclude,
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
        test: targetRulesSettings.images.extension,
        include: targetRulesSettings.images.files.include,
        exclude: targetRulesSettings.images.files.exclude,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: output.images,
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
        test: targetRulesSettings.favicon.extension,
        include: targetRulesSettings.favicon.files.include,
        exclude: targetRulesSettings.favicon.files.exclude,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
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
    MiniCssExtractPluginMock.reset();
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
      reduce: jest.fn((eventNames, rules) => rules),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      paths: {
        source: '/absolute/src/target',
      },
      css: {},
      includeModules: [],
      is: {
        node: true,
        browser: false,
      },
    };
    const {
      targetRules,
      targetRulesSettings,
      targetRulesMocks,
    } = getTargetRules();
    const params = {
      target,
      targetRules,
      version,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
      babelConfig,
      'mini-css-extract',
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-node',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-node',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-node',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-node',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-node',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-node',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-node',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-node',
        'webpack-rules-configuration',
      ],
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
    targetRulesMocks.forEach((targetRuleMock) => {
      expect(targetRuleMock).toHaveBeenCalledTimes(1);
    });
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
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      paths: {
        source: '/absolute/src/target',
      },
      css: {
        modules: true,
      },
      includeModules: [],
      is: {
        node: true,
        browser: false,
      },
    };
    const { targetRules, targetRulesSettings } = getTargetRules();
    const params = {
      target,
      targetRules,
      version,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
      babelConfig,
      'mini-css-extract',
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-node',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-node',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForNodeWithModules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-node',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForNode,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-node',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-node',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-node',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-node',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-node',
        'webpack-rules-configuration',
      ],
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
  });

  it('should return the rules for a browser target', () => {
    // Given
    const extractResult = 'mini-css-extract';
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = 'pathUtils';
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      paths: {
        source: '/absolute/src/target',
      },
      css: {},
      includeModules: [],
      is: {
        node: false,
        browser: true,
      },
    };
    const { targetRules, targetRulesSettings } = getTargetRules();
    const params = {
      target,
      targetRules,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-browser',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-browser',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-browser',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-browser',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-browser',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-browser',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-browser',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-browser',
        'webpack-rules-configuration',
      ],
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
    expect(MiniCssExtractPluginMock.mocks.loader).toHaveBeenCalledTimes(['scss', 'css'].length);
  });

  it('should return the rules for a browser target that transpiles a \'node_module\'', () => {
    // Given
    const extractResult = 'mini-css-extract';
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = 'pathUtils';
    const targetName = 'some-target';
    const target = {
      name: targetName,
      folders: {
        source: 'src/target',
      },
      paths: {
        source: '/absolute/src/target',
      },
      css: {},
      includeModules: ['wootils', 'projext'],
      is: {
        node: false,
        browser: true,
      },
    };
    const { targetRules, targetRulesSettings } = getTargetRules();
    const params = {
      target,
      targetRules,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
      babelConfig,
      extractResult,
      output
    );
    let sut = null;
    let result = null;
    let expressions = null;
    // When
    sut = new WebpackRulesConfiguration(
      babelConfiguration,
      events,
      pathUtils
    );
    result = sut.getConfig(params);
    [[, [{ include: expressions }]]] = events.reduce.mock.calls;
    expressions = expressions.slice();
    expressions.splice(0, ['target source', 'configurations'].length);
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-browser',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-browser',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-browser',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-browser',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-browser',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-browser',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-browser',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-browser',
        'webpack-rules-configuration',
      ],
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
    expect(MiniCssExtractPluginMock.mocks.loader).toHaveBeenCalledTimes(['scss', 'css'].length);
  });

  it('should return the rules for a browser target that uses CSS modules', () => {
    // Given
    const extractResult = 'mini-css-extract';
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = 'pathUtils';
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
      paths: {
        source: '/absolute/src/target',
      },
      css: {
        modules: true,
      },
      includeModules: [],
      is: {
        node: false,
        browser: true,
      },
    };
    const { targetRules, targetRulesSettings } = getTargetRules();
    const params = {
      target,
      targetRules,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-browser',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-browser',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForBrowserWithModules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-browser',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForBrowser,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-browser',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-browser',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-browser',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-browser',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-browser',
        'webpack-rules-configuration',
      ],
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
    expect(MiniCssExtractPluginMock.mocks.loader).toHaveBeenCalledTimes(['scss', 'css'].length);
  });

  it('should return the rules for a browser target that injects the CSS on the HTML', () => {
    // Given
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = 'pathUtils';
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
      paths: {
        source: '/absolute/src/target',
      },
      css: {
        inject: true,
      },
      includeModules: [],
      is: {
        node: false,
        browser: true,
      },
    };
    const { targetRules, targetRulesSettings } = getTargetRules();
    const params = {
      target,
      targetRules,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
      babelConfig,
      '',
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-browser',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-browser',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForBrowserWithInject,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-browser',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForBrowserWithInject,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-browser',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-browser',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-browser',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-browser',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-browser',
        'webpack-rules-configuration',
      ],
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForBrowserWithInject,
          ...expectedRules.cssRulesForBrowserWithInject,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(MiniCssExtractPluginMock.mocks.loader).toHaveBeenCalledTimes(0);
  });

  it('should return the rules for a browser target that uses CSS modules and inject', () => {
    // Given
    const output = {
      fonts: 'statics/fonts/[name].[ext]',
      images: 'statics/images/[name].[ext]',
    };
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, rules) => rules),
    };
    const pathUtils = 'pathUtils';
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
      paths: {
        source: '/absolute/src/target',
      },
      css: {
        modules: true,
        inject: true,
      },
      includeModules: [],
      is: {
        node: false,
        browser: true,
      },
    };
    const { targetRules, targetRulesSettings } = getTargetRules();
    const params = {
      target,
      targetRules,
      output,
    };
    const expectedRules = getExpectedRules(
      target,
      targetRulesSettings,
      babelConfig,
      '',
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
      'createConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-js-rules-configuration-for-browser',
        'webpack-js-rules-configuration',
      ],
      expectedRules.jsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-scss-rules-configuration-for-browser',
        'webpack-scss-rules-configuration',
      ],
      expectedRules.scssRulesForBrowserWithModulesAndInject,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-css-rules-configuration-for-browser',
        'webpack-css-rules-configuration',
      ],
      expectedRules.cssRulesForBrowserWithInject,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-html-rules-configuration-for-browser',
        'webpack-html-rules-configuration',
      ],
      expectedRules.htmlRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-fonts-rules-configuration-for-browser',
        'webpack-fonts-rules-configuration',
      ],
      expectedRules.fontsRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-images-rules-configuration-for-browser',
        'webpack-images-rules-configuration',
      ],
      expectedRules.imagesRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-favicons-rules-configuration-for-browser',
        'webpack-favicons-rules-configuration',
      ],
      expectedRules.faviconRules,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      [
        'webpack-rules-configuration-for-browser',
        'webpack-rules-configuration',
      ],
      {
        rules: [
          ...expectedRules.jsRules,
          ...expectedRules.scssRulesForBrowserWithModulesAndInject,
          ...expectedRules.cssRulesForBrowserWithInject,
          ...expectedRules.htmlRules,
          ...expectedRules.fontsRules,
          ...expectedRules.imagesRules,
          ...expectedRules.faviconRules,
        ],
      },
      params
    );
    expect(MiniCssExtractPluginMock.mocks.loader).toHaveBeenCalledTimes(0);
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
