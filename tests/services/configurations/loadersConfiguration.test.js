const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('extract-text-webpack-plugin');
jest.mock('/src/interfaces/configurationFile', () => ConfigurationFileMock);
jest.unmock('/src/services/configurations/loadersConfiguration');

require('jasmine-expect');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {
  WebpackLoadersConfiguration,
  webpackLoadersConfiguration,
} = require('/src/services/configurations/loadersConfiguration');

describe('services/configurations:loadersConfiguration', () => {
  const getExpectedLoaders = (
    target,
    babelConfig,
    extractResult,
    versionReplaceKey,
    version
  ) => {
    const loaders = {};
    loaders.jsLoaders = [{
      test: expect.any(RegExp),
      include: [RegExp(target.folders.source)],
      use: [{
        loader: 'babel-loader',
        options: babelConfig,
      }],
    }];
    loaders.scssExtractOptions = {
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
    loaders.scssExtractOptionsWithModules = {
      fallback: expect.any(String),
      use: [
        {
          loader: 'css-loader',
          query: {
            importLoaders: 2,
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
    loaders.cssExtractOptions = {
      fallback: 'style-loader',
      use: [
        'css-loader',
      ],
    };
    loaders.scssLoaders = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: extractResult,
    }];
    loaders.cssLoaders = [{
      test: expect.any(RegExp),
      use: extractResult,
    }];
    loaders.htmlLoaders = [{
      test: expect.any(RegExp),
      exclude: expect.any(RegExp),
      use: [
        'raw-loader',
      ],
    }];
    loaders.fontsLoaders = [
      {
        test: expect.any(RegExp),
        include: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: expect.any(String),
            mimetype: 'image/svg+xml',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: expect.any(String),
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: expect.any(String),
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: expect.any(String),
            mimetype: 'application/octet-stream',
          },
        }],
      },
      {
        test: expect.any(RegExp),
        use: [{
          loader: 'file-loader',
          options: {
            name: expect.any(String),
          },
        }],
      },
    ];
    loaders.imagesLoaders = [
      {
        test: expect.any(RegExp),
        exclude: expect.any(RegExp),
        use: [
          {
            loader: 'file-loader',
            options: {
              name: expect.any(String),
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
    loaders.faviconLoaders = [
      {
        test: expect.any(RegExp),
        include: expect.any(RegExp),
        use: [
          {
            loader: 'file-loader',
            options: {
              name: expect.any(String),
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
    loaders.versionLoaders = [{
      test: expect.any(RegExp),
      include: expect.any(RegExp),
      use: [{
        loader: 'string-replace-loader',
        options: {
          search: RegExp(`{{${versionReplaceKey}}}`, 'g'),
          replace: version,
        },
      }],
    }];

    return loaders;
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
    const projectConfiguration = 'projectConfiguration';
    let sut = null;
    // When
    sut = new WebpackLoadersConfiguration(
      babelConfiguration,
      events,
      pathUtils,
      projectConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(WebpackLoadersConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'webpack/loaders.config.js'
    );
    expect(sut.babelConfiguration).toBe(babelConfiguration);
    expect(sut.events).toBe(events);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
  });

  it('should return the loaders for a node target', () => {
    // Given
    const version = 'latest';
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      version: {
        replaceKey: 'APP_VERSION',
      },
    };
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
    const expectedLoaders = getExpectedLoaders(
      target,
      babelConfig,
      '',
      projectConfiguration.version.replaceKey,
      version
    );
    let sut = null;
    let result = null;
    // When
    sut = new WebpackLoadersConfiguration(
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
      'getJSLoaders',
      'getVersionLoaders',
      'createNodeConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-loaders-configuration-for-node',
      expectedLoaders.jsLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-version-loaders-configuration-for-node',
      expectedLoaders.versionLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-loaders-configuration-for-node',
      [
        ...expectedLoaders.jsLoaders,
        ...expectedLoaders.versionLoaders,
      ],
      params
    );
  });

  it('should return the loaders for a browser target', () => {
    // Given
    const extractResult = 'extract';
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    const version = 'latest';
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      paths: {
        output: {
          fonts: 'statics/fonts',
          images: 'statics/images',
        },
      },
      version: {
        replaceKey: 'APP_VERSION',
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
    };
    const hashStr = 'hash.';
    const params = {
      target,
      version,
      hashStr,
    };
    const expectedLoaders = getExpectedLoaders(
      target,
      babelConfig,
      extractResult,
      projectConfiguration.version.replaceKey,
      version
    );
    let sut = null;
    let result = null;

    // When
    sut = new WebpackLoadersConfiguration(
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
      'getJSLoaders',
      'getVersionLoaders',
      'getSCSSLoaders',
      'getCSSLoaders',
      'getHTMLLoaders',
      'getFontsLoaders',
      'getImagesLoaders',
      'getFaviconsLoaders',
      'createBrowserConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-loaders-configuration-for-browser',
      expectedLoaders.jsLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-version-loaders-configuration-for-browser',
      expectedLoaders.versionLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-loaders-configuration-for-browser',
      expectedLoaders.scssLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-loaders-configuration-for-browser',
      expectedLoaders.cssLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-loaders-configuration-for-browser',
      expectedLoaders.htmlLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-loaders-configuration-for-browser',
      expectedLoaders.fontsLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-loaders-configuration-for-browser',
      expectedLoaders.imagesLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-loaders-configuration-for-browser',
      expectedLoaders.faviconLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-loaders-configuration-for-browser',
      [
        ...expectedLoaders.jsLoaders,
        ...expectedLoaders.versionLoaders,
        ...expectedLoaders.scssLoaders,
        ...expectedLoaders.cssLoaders,
        ...expectedLoaders.htmlLoaders,
        ...expectedLoaders.fontsLoaders,
        ...expectedLoaders.imagesLoaders,
        ...expectedLoaders.faviconLoaders,
      ],
      params
    );
    expect(ExtractTextPlugin.extract).toHaveBeenCalledTimes(['scss', 'css'].length);
    expect(ExtractTextPlugin.extract).toHaveBeenCalledWith(expectedLoaders.scssExtractOptions);
    expect(ExtractTextPlugin.extract).toHaveBeenCalledWith(expectedLoaders.cssExtractOptions);
  });

  it('should return the loaders for a browser target that uses CSS modules', () => {
    // Given
    const extractResult = 'extract';
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    ExtractTextPlugin.extract.mockImplementationOnce(() => extractResult);
    const version = 'latest';
    const babelConfig = 'babel';
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => babelConfig),
    };
    const events = {
      reduce: jest.fn((eventName, loaders) => loaders),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      paths: {
        output: {
          fonts: 'statics/fonts',
          images: 'statics/images',
        },
      },
      version: {
        replaceKey: 'APP_VERSION',
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
    const hashStr = 'hash.';
    const params = {
      target,
      version,
      hashStr,
    };
    const expectedLoaders = getExpectedLoaders(
      target,
      babelConfig,
      extractResult,
      projectConfiguration.version.replaceKey,
      version
    );
    let sut = null;
    let result = null;

    // When
    sut = new WebpackLoadersConfiguration(
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
      'getJSLoaders',
      'getVersionLoaders',
      'getSCSSLoaders',
      'getCSSLoaders',
      'getHTMLLoaders',
      'getFontsLoaders',
      'getImagesLoaders',
      'getFaviconsLoaders',
      'createBrowserConfig',
    ].length);
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-js-loaders-configuration-for-browser',
      expectedLoaders.jsLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-version-loaders-configuration-for-browser',
      expectedLoaders.versionLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-scss-loaders-configuration-for-browser',
      expectedLoaders.scssLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-css-loaders-configuration-for-browser',
      expectedLoaders.cssLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-html-loaders-configuration-for-browser',
      expectedLoaders.htmlLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-fonts-loaders-configuration-for-browser',
      expectedLoaders.fontsLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-images-loaders-configuration-for-browser',
      expectedLoaders.imagesLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-favicons-loaders-configuration-for-browser',
      expectedLoaders.faviconLoaders,
      params
    );
    expect(events.reduce).toHaveBeenCalledWith(
      'webpack-loaders-configuration-for-browser',
      [
        ...expectedLoaders.jsLoaders,
        ...expectedLoaders.versionLoaders,
        ...expectedLoaders.scssLoaders,
        ...expectedLoaders.cssLoaders,
        ...expectedLoaders.htmlLoaders,
        ...expectedLoaders.fontsLoaders,
        ...expectedLoaders.imagesLoaders,
        ...expectedLoaders.faviconLoaders,
      ],
      params
    );
    expect(ExtractTextPlugin.extract).toHaveBeenCalledTimes(['scss', 'css'].length);
    expect(ExtractTextPlugin.extract)
    .toHaveBeenCalledWith(expectedLoaders.scssExtractOptionsWithModules);
    expect(ExtractTextPlugin.extract).toHaveBeenCalledWith(expectedLoaders.cssExtractOptions);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    webpackLoadersConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('webpackLoadersConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(WebpackLoadersConfiguration);
    expect(sut.babelConfiguration).toBe('babelConfiguration');
    expect(sut.events).toBe('events');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
  });
});
