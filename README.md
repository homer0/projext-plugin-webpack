# projext plugin for webpack

[![Travis](https://img.shields.io/travis/homer0/projext-plugin-webpack.svg?style=flat-square)](https://travis-ci.org/homer0/projext-plugin-webpack)
[![Coveralls github](https://img.shields.io/coveralls/github/homer0/projext-plugin-webpack.svg?style=flat-square)](https://coveralls.io/github/homer0/projext-plugin-webpack?branch=master)
[![David](https://img.shields.io/david/homer0/projext-plugin-webpack.svg?style=flat-square)](https://david-dm.org/homer0/projext-plugin-webpack)
[![David](https://img.shields.io/david/dev/homer0/projext-plugin-webpack.svg?style=flat-square)](https://david-dm.org/homer0/projext-plugin-webpack)

Allows [projext](https://yarnpkg.com/en/package/projext) to use [webpack](https://webpack.js.org) as a build engine.

## Introduction

[projext](https://yarnpkg.com/en/package/projext) allows you to configure a project without adding specific settings for a module bundler, then you can decide which build engine to use. This plugin allows you to bundle your projext project targets using [webpack](https://webpack.js.org).

## Information

| -            | -                                                                             |
|--------------|-------------------------------------------------------------------------------|
| Package      | projext-plugin-webpack                                                        |
| Description  | Allows projext to use webpack as a build engine.                              |
| Node Version | >= v10.13.0                                                                    |

## Usage

Since webpack is the default build engine for projext, after you install the plugin there's nothing else to do, just run the build command and the plugin will take care of the rest:

```bash
projext build [target-name]
```

In the case you changed the engine and you want to restore it to webpack, you just need to go to your projext configuration file, on your target settings, change `engine` to `webpack`:

```js
// projext.config.js

module.exports = {
  targets: {
    myTarget: {
      type: 'browser',
      engine: 'webpack',
    },
  },
};
```

### Middleware implementation

You can implement both the [`webpack-dev-middleware`](https://yarnpkg.com/en/package/webpack-dev-middleware) and the [`webpack-hot-middleware`](https://yarnpkg.com/en/package/webpack-hot-middleware) on [Express](https://expressjs.com) and [Jimpex](https://yarnpkg.com/en/package/jimpex) very easy:

#### Express

```js
// Require the function for the implementation
const useExpress = require('projext-plugin-webpack/express');

// Require Express to create a dummy app
const express = require('express');

// Create the app
const app = express();

// Tell the plugin to configure the necessary middlewares for the `myApp` target to be served by the
// `myServer` target
useExpress(app, 'myApp', 'myServer');

// Start the app
app.listen(...);
```

#### Jimpex

```js
// Require the function for the implementation
const useJimpex = require('projext-plugin-webpack/jimpex');

// Require Jimpex to create a dummy app
const { Jimpex } = require('jimpex');

// Define the Jimpex app
class DevApp extends Jimpex {
  boot() {
    // This method needs to be created.
  }
}

// Create the app
const app = new DevApp();

// Tell the plugin to configure the necessary middlewares for the `myApp` target to be served by the
// `myServer` target
useJimpex(app, 'myApp', 'myServer');

// Start the app
app.start();
```

#### Accessing the dev middleware files

Both `useExpress` and `useJimpex` return and object with the following properties:

- `middlewares`: A list with the implemented middlewares.
- `getDirectory`: A function that returns the build directory of the target implementing the middleware(s).
- `getFileSystem`: A function that returns a promise with the instance of the _"virtual file system"_ the middleware uses to read and write the files in memory.

### Extending/Overwriting the configuration

This plugin has `6` different configuration services:

- Base configuration.
- Rules configuration.
- Browser targets configuration for development.
- Browser targets configuration for production.
- Node targets configuration for development.
- Node targets configuration for production.

They can be easily extended/overwritten by creating a file on your project with an specific name.

All the configurations receive a single object parameter with the following properties:

- `target`: It has all the information for the target being bundled.
- `targetRules`: The rules to find the target files on the file system.
- `entry`: A dictionary with the `entry` setting for a webpack configuration, generated with the target information.
- `output`: A dictionary with the filenames formats and paths of the different files the bundle can generate (`js`, `css`, `images` and `fonts`).
- `definitions`: A function that generates a dictionary of variables that will be replaced on the bundled code.
- `buildType`: The indented build type (`development` or `production`).
- `copy`: A list of information for files that need to be copied during the bundling process.
- `additionalWatch`: A list of additional paths webpack should watch for in order to restart the bundle.
- `analyze`: A flag to detect if the bundled should be analyzed or not. 

#### Base configuration

This is the top level configuration, the one a regular `webpack.config.js` file would export.

To extend/overwrite this configuration you would need to create a file with the following path: `config/webpack/base.config.js`. For example:

```js
// config/webpack/base.config.js

module.exports = (params) => ({
  resolve: {
    extensions: ['.js', '.jsx', '.tsx'],
  },
});
```

#### Rules configuration

This is what you would normally found inside `module.rules`. It has all the rules to handle the different file types, based on a target type: If it's a Node target, it will only handle Javascript; but if the target is for browsers, it will also handle stylesheets, images and fonts.

To extend/overwrite this configuration you would need to create a file with the following path: `config/webpack/rules.config.js`. For example:

```js
// config/webpack/rules.config.js

module.exports = (params) => ({
  rules: [{
    test: /\.tsx?$/i,
    use: [
      'babel-loader',
      'ts-loader',
    ],
  }]
});
```

#### Browser targets configuration for development and production

These configurations handles the specifics of a browser target: `entry`, `output` and `plugins`.

To extend/overwrite these configurations you would need to create a file with the following path: `config/webpack/browser.development.config.js` or `config/webpack/browser.production.config.js`. For example:

```js
// config/webpack/browser.development.config.js

module.exports = (params) => ({
  devtool: 'eval',
});
```

### Node targets configuration for development and production

These configurations handles the specifics of a Node target: `entry`, `output` and `plugins`.

To extend/overwrite these configurations you would need to create a file with the following path: `config/webpack/node.development.config.js` or `config/webpack/node.production.config.js`. For example:

```js
// config/webpack/node.production.config.js

module.exports = (params) => ({
  node: {
    __filename: false,
  }
});
```

### Extending/Overwriting a target configuration

The methods above allow you to extend/overwrite a configuration service for all the targets, but there are two ways of extending/overwriting configurations for an specific target:

**`config/webpack/[target].config.js`**

This file allows you to overwrite the webpack configuration generated for an specific target, no matter the build type:

```js
// config/webpack/myApp.config.js

module.exports = (params) => ({
  node: {
    __filename: false,
  }
});
```

That change will only be applied when building the target `myApp`.

**`config/webpack/[target].[build-type].config.js`**

This file allows you to overwrite the webpack configuration generated for an specifc target and build type.

```js
// config/webpack/myApp.production.config.js

module.exports = (params) => ({
  devtool: 'eval',
});
```

That change will only be applied when building the target `myApp` on a production build.

### Images optimization

By default, this plugin used to include [`image-webpack-loader`](https://yarnpkg.com/en/package/image-webpack-loader) but the package wasn't being updated often and the requirement of `libpng` was something that caused issues for some of the users' environments.

Now, this plugin only uses the loader if the implementation has `image-webpack-loader` on its `package.json` `dependencies`/`devDependencies`.

## Making a plugin

If you want to write a plugin that works with this one (like a framework plugin), there are a lot of reducer events you can listen for and use to modify the webpack configuration:

### Configuration parameters

- Name: `webpack-configuration-parameters`
- Reduces: The parameters used by the plugin services to build a target configuration.

This is called before generating any configuration.

### Node target configuration

- Name: `webpack-base-configuration-for-node`
- Reduces: A webpack configuration for a Node target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after generating the configuration for a Node target and before using it.

### Browser target configuration

- Name: `webpack-base-configuration-for-browser`
- Reduces: A webpack configuration for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after generating the configuration for a browser target and before using it.

### Rules configuration

- Name: `webpack-rules-configuration`
- Reduces: A dictionary with a `rules` property that contains all the file rules for an specific target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all the rules for a target and before sending them to the main configuration.

### Node target rules configuration

- Name: `webpack-rules-configuration-for-node`
- Reduces: A dictionary with a `rules` property that contains all the file rules for a Node target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all the rules for a Node target and before sending them to the main configuration.

### Browser target rules configuration

- Name: `webpack-rules-configuration-for-browser`
- Reduces: A dictionary with a `rules` property that contains all the file rules for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all the rules for a browser target and before sending them to the main configuration.

### Node target Javascript rules configuration

- Name: `webpack-js-rules-configuration-for-node`
- Reduces: A list of file rules for Javascript files for a Node target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all Javascript files rules for a Node target and before sending them to the main rules configuration.

### Browser target Javascript rules configuration

- Name: `webpack-js-rules-configuration-for-browser`
- Reduces: A list of file rules for Javascript files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all Javascript files rules for a browser target and before sending them to the main rules configuration.

### Browser target SCSS stylesheets rules configuration

- Name: `webpack-scss-rules-configuration-for-browser`
- Reduces: A list of file rules for SCSS stylesheets files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all SCSS stylesheets files rules for a browser target and before sending them to the main rules configuration.

### Browser target CSS stylesheets rules configuration

- Name: `webpack-css-rules-configuration-for-browser`
- Reduces: A list of file rules for CSS stylesheets files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all CSS stylesheets files rules for a browser target and before sending them to the main rules configuration.

### Browser target HTML rules configuration

- Name: `webpack-html-rules-configuration-for-browser`
- Reduces: A list of file rules for HTML files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all HTML files rules for a browser target and before sending them to the main rules configuration.

### Browser target fonts rules configuration

- Name: `webpack-fonts-rules-configuration-for-browser`
- Reduces: A list of file rules for font files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all font files rules for a browser target and before sending them to the main rules configuration.

The supported formats are:

- `.svg` - But they need to be inside a `fonts` folder, to be able to differentiate them between images and fonts.
- `.woff`
- `.woff2`
- `.ttf`
- `.eot`

### Browser target images rules configuration

- Name: `webpack-images-rules-configuration-for-browser`
- Reduces: A list of file rules for images files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all images files rules for a browser target and before sending them to the main rules configuration.

It excludes all images which path matches with `favicon`, as the favicon needs to be on the root directory in order to be automatically detected by the browser.

The supported formats are:

- `png`
- `jpg`
- `jpeg`
- `gif`
- `svg`
- `ico`

### Browser target favicons rules configuration

- Name: `webpack-html-favicons-configuration-for-browser`
- Reduces: A list of file rules for favicons files for a browser target.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after defining all favicons files rules for a browser target and before sending them to the main rules configuration.

The reason this is not included with the images rules is because favicons need to be on the roto directory in order to be automatically detected by the browser, and they can only be `ico` and `png`.

### Node target development configuration

- Name: `node-browser-development-configuration`
- Reduces: A dictionary with the specific configuration for a Node target: `entry`, `output` and `plugins`.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after generating the configuration for a Node target development build and before sending it to the main configuration to merge everything.

### Node target production configuration

- Name: `webpack-node-production-configuration`
- Reduces: A dictionary with the specific configuration for a Node target: `entry`, `output` and `plugins`.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after generating the configuration for a Node target production build and before sending it to the main configuration to merge everything.

### Browser target development configuration

- Name: `webpack-browser-development-configuration`
- Reduces: A dictionary with the specific configuration for a browser target: `entry`, `output` and `plugins`.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after generating the configuration for a browser target development build and before sending it to the main configuration to merge everything.

### Browser target production configuration

- Name: `webpack-browser-production-configuration`
- Reduces: A dictionary with the specific configuration for a browser target: `entry`, `output` and `plugins`.
- Parameters:
 - `params`: The same dictionary sent to all the files that extend a configuration. Check the _"Extending/Overwriting the configuration"_ section for more information.

This is called after generating the configuration for a browser target production build and before sending it to the main configuration to merge everything.

## Development

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `yarn test`             | Run the project unit tests.         |
| `yarn run lint`         | Lint the modified files.            |
| `yarn run lint:full`    | Lint the project code.              |
| `yarn run docs`         | Generate the project documentation. |
| `yarn run todo`         | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
