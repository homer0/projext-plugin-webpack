# projext plugin for webpack

Allows [projext](https://yarnpkg.com/en/package/projext) to use [webpack](https://webpack.js.org) as a build engine.

## Introduction

[projext](https://yarnpkg.com/en/package/projext) allows you to configure a project without adding specific settings for a module bundler, then you can decide which build engine to use. This plugin allows you to bundle your projext project targets using [webpack](https://webpack.js.org).

### Node targets

- It only handles Javascript files.
- It uses [`webpack-node-utils`](https://yarnpkg.com/en/package/webpack-node-utils) to execute the target.

### Browser targets

- It handles Javascript files, stylesheets (CSS and SCSS), images, favicons and fonts.
- It uses the [`webpack-dev-server`](https://yarnpkg.com/en/package/webpack-dev-server) to run the target.

## Information

| -            | -                                                                             |
|--------------|-------------------------------------------------------------------------------|
| Package      | projext-plugin-webpack                                                        |
| Description  | Allows projext to use webpack as a build engine.                              |
| Node Version | >= v6.10.0                                                                    |

## Usage

Since webpack is the default build engine for projext, after you install the plugin there's nothing else to do, just run the build command and the plugin will take care of the rest:

```bash
projext build [target-name]
```

In the case you changed the engine and you want to restore it to webpack, you just need to go to your project configuration file (`config/project.config.js`), on your target settings, change `engine` to `webpack`:

```js
// config/project.config.js

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
const useExpress = require('projext-plugin-plugin/express');

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
const Jimpex = require('jimpex');

// Define the Jimpex app
class DevApp extends Jimpex {}

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
- `entry`: A dictionary with the `entry` setting for a webpack configuration, generated with the target information.
- `output`: A dictionary with the filenames formats and paths of the different files the bundle can generate (`js`, `css`, `images` and `fonts`).
- `definitions`: A dictionary of defined variables that will be replaced on the bundled code.

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

## Making a plugin

If you want to write a plugin that works with this one (like a framework plugin), there are a lot of reducer events you can listen for and use to modify the webpack configuration:

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

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
npm run install-hooks
```

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `npm run install-hooks` | Install the GIT repository hooks.   |
| `npm test`              | Run the project unit tests.         |
| `npm run lint`          | Lint the modified files.            |
| `npm run lint:full`     | Lint the project code.              |
| `npm run docs`          | Generate the project documentation. |
| `npm run todo`          | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
