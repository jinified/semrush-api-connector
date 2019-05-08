/* istanbul ignore next */
if (typeof(require) !== 'undefined') {
  var SemrushClient = require('./SemrushClient.js')['default'];
}

/**
 * Constructor for Connector - a wrapper for GDS connector methods

 * @param {object} services - an object containing required Google services
 *
 * @return {object} a Connector object.
 */
function Connector(services) {
  this.services = services;

  return this;
}

/**
 * @return {object} Object containing field definitions
 */
Connector.prototype.getSchema = function() {
  return {
    schema: [
      {
        name: 'site_url',
        label: 'Site URL',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION'
        }
      },
      {
        name: 'keyword',
        label: 'Keyword',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION'
        }
      },
      {
        name: 'errors',
        label: 'Errors',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC'
        }
      },
      {
        name: 'quality',
        label: 'Overall Quality',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC'
        }
      },
      {
        name: 'quality_delta',
        label: 'Change in Quality',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC'
        }
      },
      {
        name: 'site_performance',
        label: 'Site Performance',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC'
        }
      },
    ]
  };
};

/**
 * @return {object} Object containing connector configuration
 */
Connector.prototype.getConfig = function() {
  // eslint-disable-next-line no-undef
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newInfo()
    .setId('instructions')
    .setText('Semrush Configurations');

  config.newTextInput()
    .setId('apiEndpoint')
    .setName('API Endpoint')
    .setPlaceholder('https://api.semrush.com')
    .setAllowOverride(true);

  config.newTextInput()
    .setId('apiKey')
    .setName('API Key')
    .setPlaceholder('API KEY')
    .setAllowOverride(true);

  config.newTextInput()
    .setId('projectId')
    .setName('Project ID')
    .setPlaceholder('Project ID')
    .setAllowOverride(true);

  config.newTextInput()
    .setId('refreshRate')
    .setName('Days to refresh')
    .setPlaceholder('7')
    .setAllowOverride(true);

  config.newTextInput()
    .setId('rootDomain')
    .setName('Domain')
    .setPlaceholder('astroawani.com')
    .setAllowOverride(true);

  config.newInfo()
    .setId('apiEndpoints instruction')
    .setText('API Endpoints');

  config.newTextInput()
    .setId('siteAuditURL')
    .setName('Site Audit Endpoint')
    .setPlaceholder('Endpoint')
    .setAllowOverride(true);

  config.newTextInput()
    .setId('positionTrackingURL')
    .setName('Position Tracking Endpoint')
    .setPlaceholder('Endpoint')
    .setAllowOverride(true);

  config.newTextInput()
    .setId('keywordGapAnalysisURL')
    .setName('Keyword Gap Analysis Endpoint')
    .setPlaceholder('Endpoint')
    .setAllowOverride(true);

  return config.build();
};

/**
 * @return {object} Object containing auth config
 */
Connector.prototype.getAuthType = function() {
  return {
    type: 'NONE'
  };
};

/**
 * @return {boolean}
 */
Connector.prototype.isAdminUser = function() {
  return true;
};

/**
 * @param request {object} GDS request object
 *
 * @return {object} Object with response schema and rows
 */
Connector.prototype.getData = function(request) {
  var projectId = request.configParams.projectId;
  var apiKey = request.configParams.apiKey;
  var apiEndpoint = request.configParams.endPoint;
  var rootDomain = request.configParams.rootDomain;
  var refreshRate = parseInt(request.configParams.refreshRate);
  var siteAuditURL = request.configParams.siteAuditURL;
  var positionTrackingURL = request.configParams.positionTrackingURL;
  var keywordGapAnalysisURL = request.configParams.keywordGapAnalysisURL;
  var dataSchema = this.prepareSchema(request);
  var semrushClient = new SemrushClient(this.services.PropertiesService, this.services.UrlFetchApp, {
    projectId: projectId,
    apiKey: apiKey,
    rootDomain: rootDomain,
    refreshRate: refreshRate,
    apiEndpoint: apiEndpoint,
    siteAuditURL: siteAuditURL,
    positionTrackingURL: positionTrackingURL,
    keywordGapAnalysisURL: keywordGapAnalysisURL
  });
  var result = semrushClient.getSEOInfo();
  return this.buildTabularData(result, dataSchema);
};

// private

Connector.prototype.prepareSchema = function(request) {
  // Prepare the schema for the fields requested.
  var dataSchema = [];
  var fixedSchema = this.getSchema().schema;
  request.fields.forEach(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name == field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });
  return dataSchema;
};

Connector.prototype.buildTabularData = function(result, dataSchema) {
  // Prepare the tabular data.
  var data = [];
  var keywords = ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg'];
  keywords.forEach(function(keyword) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch (field.name) {
      case 'site_url':
        values.push(result['url']);
        break;
      case 'keyword':
        values.push(keyword) ;
        break;
      case 'errors':
        values.push(result['errors']);
        break;
      case 'quality':
        values.push(result['quality']);
        break;
      case 'quality_delta':
        values.push(result['quality_delta']);
        break;
      case 'site_performance':
        values.push(result['site_performance']) ;
        break;
      default:
        values.push('');
      }
    });
    data.push({
      values: values
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = Connector;
}
