const { webpackBaseConfiguration } = require('./baseConfiguration');
const {
  webpackBrowserDevelopmentConfiguration,
} = require('./browserDevelopmentConfiguration');
const {
  webpackBrowserProductionConfiguration,
} = require('./browserProductionConfiguration');
const {
  webpackRulesConfiguration,
} = require('./rulesConfiguration');
const {
  webpackNodeDevelopmentConfiguration,
} = require('./nodeDevelopmentConfiguration');
const {
  webpackNodeProductionConfiguration,
} = require('./nodeProductionConfiguration');

module.exports = {
  webpackBaseConfiguration,
  webpackBrowserDevelopmentConfiguration,
  webpackBrowserProductionConfiguration,
  webpackRulesConfiguration,
  webpackNodeDevelopmentConfiguration,
  webpackNodeProductionConfiguration,
};
