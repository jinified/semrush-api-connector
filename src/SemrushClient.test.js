import SemrushClient from './SemrushClient';
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
  service = new SemrushClient(propertiesServiceMock, urlFetchAppMock, requestConfig);
});

describe('Semrush Client', () => {
  test('getSEOInfo when refreshRate is 0 endpoint will be called', () => {
    const result = service.getSEOInfo();
    expect(result).toEqual({
      url: 'www.astroawani.com',
      errors: 21,
      quality: 0.79,
      quality_delta: 0,
      site_performance: 0.84,
      visibility: 41.8269,
      keywords: ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg']
    });
  });

  test('getSEOInfo when refreshRate is > 0 cache result shall be returned', () => {
    // Trigger retrieval from cache
    requestConfig['refreshRate'] = 7;

    // Preload cache with result
    propertiesServiceMock.getScriptProperties().setProperty('DATE', new Date());
    propertiesServiceMock.getScriptProperties().setProperty('DATA', JSON.stringify({
      url: 'www.astroawani.com',
      errors: 0,
      quality: 0.80,
      quality_delta: 0,
      site_performance: 0.84,
      visibility: 41.8269,
      keywords: ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg']
    }));

    const result = service.getSEOInfo();

    expect(urlFetchAppMock.calls).toEqual({}, 'should not call endpoints');
    expect(result).toEqual({
      url: 'www.astroawani.com',
      errors: 0,
      quality: 0.80,
      quality_delta: 0,
      site_performance: 0.84,
      visibility: 41.8269,
      keywords: ['malaysia kini bm', 'shopee', 'br1m', 'kosmo', 'bank rakyat', 'myeg']
    });
  });
});

