var scriptProperties = PropertiesService.getScriptProperties();

function setLastRetrievalDate(){
  var key = 'DATE';
  var property = new Date().toISOString();
  Logger.log("Set Key: " + key + " Value: " + property);
  scriptProperties.setProperty(key, property);
}

function shouldRefreshData(refreshRate){
  var scriptProperties = PropertiesService.getScriptProperties();
  var lastRetrievalDate = new Date(scriptProperties.getProperty('DATE'));
  
  if (lastRetrievalDate === null) {
    return true
  }
  var today = new Date();
  var oneDay = 24*60*60*1000;
  Logger.log("Last Date")
  Logger.log(lastRetrievalDate)
  var diffDays = Math.round(Math.abs((today.getTime() - lastRetrievalDate.getTime())/(oneDay)));
  Logger.log("Diff Days");
  return diffDays > refreshRate;
}


function getAuthType() {
  return {
    type: "NONE"
  };
}

function isAdminUser() {
  return true;
}

function getConfig() {
    var cc = DataStudioApp.createCommunityConnector();
    var config = cc.getConfig();

    config.newInfo()
        .setId('instructions')
        .setText('Semrush Configurations');

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

    return config.build()
}

function getSchema() {
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
        name: 'errors',
        label: 'Errors',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC'
        }
      },
      {
        name: 'quality',
        label: 'Quality',
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
    ]
  };
}

function getData(request) {
    // Prepare the schema for the fields requested.
    var projectId = request.configParams.projectId
    var apiKey = request.configParams.apiKey
    var refreshRate = parseInt(request.configParams.refreshRate)
    var dataSchema = [];
    var fixedSchema = getSchema().schema;
    request.fields.forEach(function(field) {
        for (var i = 0; i < fixedSchema.length; i++) {
            if (fixedSchema[i].name == field.name) {
                dataSchema.push(fixedSchema[i]);
                break;
            }
        }
    });
    
    if (shouldRefreshData(refreshRate)) {
      var url = "https://api.semrush.com/reports/v1/projects/" + projectId + "/siteaudit/info?key=" + apiKey;
      var result = UrlFetchApp.fetch(url)
      scriptProperties.setProperty('DATA', result);
      setLastRetrievalDate();
      Logger.log("Refresh data");
    }

    Logger.log("Showing result");
    var result = JSON.parse(scriptProperties.getProperty('DATA'));
    Logger.log(result);

    // Prepare the tabular data.
    var data = [];
    var values = [];
    dataSchema.forEach(function(field) {
        switch (field.name) {
            case 'site_url':
                values.push(result['url']);
                break;
            case 'errors':
                values.push(result['errors']);
                break;
            case 'quality':
                values.push(result['current_snapshot']['quality']['value']);
                break;
            case 'quality_delta':
                values.push(result['current_snapshot']['quality']['delta']);
                break;
            default:
                values.push('');
        }
    });
    data.push({
        values: values
    });
    return {
        schema: dataSchema,
        rows: data
    };
}
