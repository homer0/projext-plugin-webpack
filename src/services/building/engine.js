const path = require('path');
const { provider } = require('jimple');

class WebpackBuildEngine {
  constructor(
    appLogger,
    environmentUtils,
    targets,
    webpackConfiguration
  ) {
    this.appLogger = appLogger;
    this.environmentUtils = environmentUtils;
    this.targets = targets;
    this.webpackConfiguration = webpackConfiguration;
    this.envVars = {
      target: 'WOOPACK_WEBPACK_TARGET',
      type: 'WOOPACK_WEBPACK_BUILD_TYPE',
    };
  }

  getBuildCommand(target, buildType) {
    const vars = this.getEnvVarsAsString({
      target: target.name,
      type: buildType,
    });

    const config = path.join(
      'node_modules/woopack-plugin-webpack',
      'src/webpack.config.js'
    );

    const options = [
      '--progress',
      '--profile',
      '--colors',
    ]
    .join(' ');

    const command = target.is.browser && target.runOnDevelopment ?
      'webpack-dev-server' :
      'webpack';

    return `${vars} ${command} --config ${config} ${options}`;
  }

  getConfiguration(target, buildType) {
    return this.webpackConfiguration.getConfig(target, buildType);
  }

  getWebpackConfig() {
    const vars = this.getEnvVarsValues();
    if (!vars.target || !vars.type) {
      throw new Error('This file can only be run by using the `build` command');
    }

    const { type } = vars;
    const target = this.targets.getTarget(vars.target);
    return this.getConfiguration(target, type);
  }

  getEnvVarsAsString(values) {
    return Object.keys(values)
    .map((name) => `${this.envVars[name]}=${values[name]}`)
    .join(' ');
  }

  getEnvVarsValues() {
    const vars = {};
    Object.keys(this.envVars).forEach((name) => {
      vars[name] = this.environmentUtils.get(this.envVars[name]);
    });

    return vars;
  }
}

const webpackBuildEngine = provider((app) => {
  app.set('webpackBuildEngine', () => new WebpackBuildEngine(
    app.get('appLogger'),
    app.get('environmentUtils'),
    app.get('targets'),
    app.get('webpackConfiguration')
  ));
});

module.exports = {
  WebpackBuildEngine,
  webpackBuildEngine,
};
