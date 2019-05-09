import Connector from './Connector';
import PropertiesServiceMock from './mocks/PropertiesService.mock';
import UrlFetchAppMock from './mocks/UrlFetchApp.mock';

let service, propertiesServiceMock, urlFetchAppMock, requestConfig;

const apiResponses = {
  'https://api.semrush.com/reports/v1/projects/2443254/siteaudit/info?key=abcdef': {
    url: 'www.astroawani.com',
    errors: 21,
    current_snapshot: {
      quality: {
        value: 79,
        delta: 0
      },
      thematicScores: {
        performance: {
          value: 84,
          delta: 0
        },
        linking: {
          value: 92,
          delta: 0
        }
      }
    }
  },
  'https://api.semrush.com/reports/v1/projects/2443254/tracking/info?key=abcdef&action=report&type=tracking_overview_organic&linktype_filter=0&url=*.astroawani.com%2F*&serp_feature_filter=fsn': {
    visibility: 41.8269,
  },
  'https://api.semrush.com/?type=domain_domains&database=my&display_limit=10&domains=*|or|sinarharian.com.my|*|or|utusan.com.my|*|or|bharian.com.my&display_sort=kd_asc&key=abcdef': {
    keywords: ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg']
  },
};

beforeEach(() => {
  propertiesServiceMock = new PropertiesServiceMock();
  urlFetchAppMock = new UrlFetchAppMock(apiResponses);
  requestConfig = {
    projectId: 2443254,
    apiKey: 'abcdef',
    rootDomain: 'astroawani.com',
    refreshRate: 0,
    siteAuditURL: 'https://api.semrush.com/reports/v1/projects/2443254/siteaudit/info?key=abcdef',
    positionTrackingURL: 'https://api.semrush.com/reports/v1/projects/2443254/tracking/info?key=abcdef&action=report&type=tracking_overview_organic&linktype_filter=0&url=*.astroawani.com%2F*&serp_feature_filter=fsn',
    keywordGapAnalysisURL: 'https://api.semrush.com/?type=domain_domains&database=my&display_limit=10&domains=*|or|sinarharian.com.my|*|or|utusan.com.my|*|or|bharian.com.my&display_sort=kd_asc&key=abcdef'
  };
  service = new Connector({
    UrlFetchApp: urlFetchAppMock,
    PropertiesService: propertiesServiceMock,
  });
});

describe('Connector', () => {
  test('getSchema', () => {
    const fields = service.getSchema().schema.map((f) => f.name);
    const expected = [
      'site_url',
      'keyword',
      'errors',
      'quality',
      'quality_delta',
      'site_performance',
    ];
    expect(fields).toEqual(expected, 'it returns the schema content');
  });

  test('getAuthType', () => {
    expect(service.getAuthType().type).toBe('NONE');
  });

  test('isAdminUser', () => {
    expect(service.isAdminUser()).toBe(true);
  });
});
