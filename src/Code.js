/* global PropertiesService, UrlFetchApp */

/* istanbul ignore next */
if (typeof(require) !== 'undefined') {
  var Connector = require('./Connector.js')['default'];
}

/* istanbul ignore next */
function getConnector() {
  return new Connector({
    PropertiesService: PropertiesService,
    UrlFetchApp: UrlFetchApp
  });
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getConfig() {
  return getConnector().getConfig();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getSchema() {
  return getConnector().getSchema();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getData(request) {
  return getConnector().getData(request);
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getAuthType() {
  return getConnector().getAuthType();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function isAdminUser() {
  return getConnector().isAdminUser();
}

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['getConfig'] = getConfig;
}
