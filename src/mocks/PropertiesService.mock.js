/**
 * Google PropertiesService mock
 *
 * @return {object}
 */
function PropertiesServiceMock() {
  this.scriptProperties = new InternalPropertiesService({});
  return this;
}

PropertiesServiceMock.prototype.getScriptProperties = function() {
  return this.scriptProperties;
};

/**
 * Internal properties service
 *
 * @return {object}
 */
function InternalPropertiesService(props) {
  this.props = props;

  return this;
}

InternalPropertiesService.prototype.getProperty = function(name) {
  return this.props[name];
};

InternalPropertiesService.prototype.setProperty = function(key, value) {
  this.props[key] = value;
  return value;
};

export default PropertiesServiceMock;
