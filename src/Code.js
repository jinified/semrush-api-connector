var scriptProperties = PropertiesService.getScriptProperties();

// Get keywords sorted in ascending order of difficulty to wrestle control from competitors
function getKeywordsToFocus(apiKey) {
    var url = "https://api.semrush.com" + "/?type=domain_domains&database=my&display_limit=10&domains=*|or|sinarharian.com.my|*|or|utusan.com.my|*|or|bharian.com.my&display_sort=kd_asc&key=" + apiKey
    Logger.log("Keyword Gap Analysis Report: Requesting URL %s", url);
    // var result = UrlFetchApp.fetch(url)
    return {
        keywords: ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg']
    }
}

function getSiteVisibility(projectId, apiKey, rootDomain) {
    // Domain pattern that will be considered for measurement
    var trackedURL = "*." + rootDomain + "%2F*"
    var url = "https://api.semrush.com/reports/v1/projects/" + projectId + "/tracking/info?key=" + apiKey + "&action=report&type=tracking_overview_organic&linktype_filter=0&url=" + trackedURL + "&serp_feature_filter=fsn";
    Logger.log("Visibilty Report: Requesting URL %s", url);
    var result = JSON.parse(UrlFetchApp.fetch(url))
    return {
        visbility: result['visibility']
    }
}

function getSiteAudit(projectId, apiKey) {
    var url = "https://api.semrush.com/reports/v1/projects/" + projectId + "/siteaudit/info?key=" + apiKey;
    Logger.log("Site Audit Report: Requesting URL %s", url);
    var result = JSON.parse(UrlFetchApp.fetch(url))
    return {
        url: result['url'],
        errors: result['errors'],
        quality: result['current_snapshot']['quality']['value'] / 100,
        quality_delta: result['current_snapshot']['quality']['delta'],
        site_performance: result['current_snapshot']['thematicScores']['performance']['value'] / 100
    }
}

function getDataFromSemrush(projectId, apiKey, rootDomain) {
    overallResult = getSiteAudit(projectId, apiKey);
    siteVisibility = getSiteVisibility(projectId, apiKey, rootDomain)
    recommendedKeywords = getKeywordsToFocus(apiKey)
    overallResult['visibility'] = siteVisibility['visibility']
    overallResult['keywords'] = recommendedKeywords['keywords']
    return overallResult
}

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
  return diffDays >= refreshRate;
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

     config.newTextInput()
      .setId('rootDomain')
      .setName('Domain')
      .setPlaceholder('astroawani.com')
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
}

function getData(request) {
    // Prepare the schema for the fields requested.
    var projectId = request.configParams.projectId
    var apiKey = request.configParams.apiKey
    var rootDomain = request.configParams.rootDomain
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
      var result = JSON.stringify(getDataFromSemrush(projectId, apiKey, rootDomain))
      scriptProperties.setProperty('DATA', result);
      setLastRetrievalDate();
      Logger.log("Refresh data");
    }

    Logger.log("Showing result");
    var result = JSON.parse(scriptProperties.getProperty('DATA'));
    Logger.log(result);

    // Prepare the tabular data.
    var data = [];
    var keywords = ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg']
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
    })

    var dataResponse = {
        schema: dataSchema,
        rows: data
    };
    return dataResponse;
}
