import { tmdb } from './tmdb';
import { Media } from '../types';
import { TMDBMovieResult } from '../types/tmdb';
import { formatMediaResult } from './media';

// Provider IDs
const PROVIDERS = {
  NETFLIX: 8,
  HULU: 15,
  HOTSTAR: 122,
  PRIME: 119,
  PARAMOUNT: 531,
  DISNEY: 337,
  APPLE_TV: 350,
  JIO_CINEMA: 970,
  SONY_LIV: 237,
  HBO_MAX: 384,
  PEACOCK: 386,
} as const;

// List of all major TMDB region codes (ISO 3166-1 alpha-2)
const ALL_REGIONS = [
  'US','GB','CA','IN','AU','DE','FR','IT','ES','BR','MX','JP','KR','RU','TR','NL','SE','NO','FI','DK','PL','AR','CO','ID','TH','ZA','CN','HK','SG','TW','BE','CH','IE','PT','GR','HU','CZ','RO','SK','UA','MY','PH','NZ','AT','IL','SA','AE','EG','CL','PE','VE','BG','HR','SI','RS','LT','LV','EE','LU','IS','MT','CY','MC','LI','QA','KW','OM','BH','JO','LB','MA','DZ','TN','NG','KE','GH','PK','BD','LK','VN','KH','LA','MM','NP','UZ','KZ','GE','AZ','AM','BY','MD','AL','MK','BA','ME','XK','PA','CR','SV','GT','HN','NI','PY','UY','BO','EC','DO','CU','PR','JM','TT','BS','BB','AG','VC','GD','KN','LC','SR','GY','BZ','HT','MQ','GP','RE','PF','NC','WF','PM','YT','BL','MF','SX','CW','AW','BQ','AI','BM','VG','KY','MS','TC','SH','FK','GI','GG','JE','IM','AX','GL','MP','GU','AS','PW','FM','MH','CK','NU','TK','TO','WS','TV','NR','KI','FJ','SB','VU','PG','NC','PF','WF','TF','IO','UM','AQ'
];

// Helper function for provider content
const getProviderContent = async (providerId: number, page: number = 1, region: string = 'US'): Promise<Media[]> => {
  try {
    const response = await tmdb.get('/discover/movie', {
      params: {
        with_watch_providers: providerId,
        watch_region: region,
        sort_by: 'popularity.desc',
        page
      }
    });
    return response.data.results.map((item: TMDBMovieResult) => formatMediaResult({ ...item, media_type: 'movie' }));
  } catch (error) {
    console.error(`Error fetching provider ${providerId} content:`, error);
    return [];
  }
};

// Helper function for provider TV content
const getProviderTVContent = async (providerId: number, page: number = 1, region: string = 'US'): Promise<Media[]> => {
  try {
    const response = await tmdb.get('/discover/tv', {
      params: {
        with_watch_providers: providerId,
        watch_region: region,
        sort_by: 'popularity.desc',
        page
      }
    });
    return response.data.results.map((item: TMDBMovieResult) => formatMediaResult({ ...item, media_type: 'tv' }));
  } catch (error) {
    console.error(`Error fetching provider ${providerId} TV content:`, error);
    return [];
  }
};

// Helper with region fallback for provider content
const getProviderContentWithFallback = async (providerId: number, page: number = 1, regions: string[] = ['US']): Promise<Media[]> => {
  for (const region of regions) {
    const results = await getProviderContent(providerId, page, region);
    console.log(`[ProviderContent] Provider ${providerId} region ${region}: ${results.length} items`);
    if (results.length > 0) return results;
  }
  return [];
};

const getProviderTVContentWithFallback = async (providerId: number, page: number = 1, regions: string[] = ['US']): Promise<Media[]> => {
  for (const region of regions) {
    const results = await getProviderTVContent(providerId, page, region);
    console.log(`[ProviderTVContent] Provider ${providerId} region ${region}: ${results.length} items`);
    if (results.length > 0) return results;
  }
  return [];
};

// Netflix (provider id: 8)
export const getNetflixContent = (page: number = 1) => getProviderContent(PROVIDERS.NETFLIX, page);
export const getNetflixTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.NETFLIX, page);

// Hulu (provider id: 15)
export const getHuluContent = (page: number = 1) => getProviderContent(PROVIDERS.HULU, page);
export const getHuluTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.HULU, page);

// Prime Video (provider id: 119) with all-region fallback
export const getPrimeContent = (page: number = 1) => getProviderContentWithFallback(PROVIDERS.PRIME, page, ALL_REGIONS);
export const getPrimeTVContent = (page: number = 1) => getProviderTVContentWithFallback(PROVIDERS.PRIME, page, ALL_REGIONS);

// Paramount+ (provider id: 531)
export const getParamountContent = (page: number = 1) => getProviderContent(PROVIDERS.PARAMOUNT, page);
export const getParamountTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.PARAMOUNT, page);

// Disney+ (provider id: 337)
export const getDisneyContent = (page: number = 1) => getProviderContent(PROVIDERS.DISNEY, page);
export const getDisneyTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.DISNEY, page);

// Hotstar (provider id: 122)
export const getHotstarContent = (page: number = 1) => getProviderContent(PROVIDERS.HOTSTAR, page, 'IN');
export const getHotstarTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.HOTSTAR, page, 'IN');

// Apple TV+ (provider id: 350)
export const getAppleTVContent = (page: number = 1) => getProviderContent(PROVIDERS.APPLE_TV, page);
export const getAppleTVTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.APPLE_TV, page);

// JioCinema (provider id: 970)
export const getJioCinemaContent = (page: number = 1) => getProviderContent(PROVIDERS.JIO_CINEMA, page, 'IN');
export const getJioCinemaTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.JIO_CINEMA, page, 'IN');

// Sony Liv (provider id: 237)
export const getSonyLivContent = (page: number = 1) => getProviderContent(PROVIDERS.SONY_LIV, page, 'IN');
export const getSonyLivTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.SONY_LIV, page, 'IN');

// HBO Max (provider id: 384) with all-region fallback
const MAX_PROVIDER_IDS = [384, 2839];
// Limit HBO Max/Max to only UK region for both provider IDs
const MAX_REGIONS = ['GB'];

export const getHBOMaxContent = async (page: number = 1) => {
  let allResults: Media[] = [];
  for (const providerId of MAX_PROVIDER_IDS) {
    const results = await getProviderContentWithFallback(providerId, page, MAX_REGIONS);
    console.log(`[HBO/Max] Provider ${providerId} (GB) total: ${results.length}`);
    allResults = allResults.concat(results);
  }
  // Remove duplicates by TMDB id
  const unique = Array.from(new Map(allResults.map(item => [item.id, item])).values());
  return unique;
};

export const getHBOMaxTVContent = async (page: number = 1) => {
  let allResults: Media[] = [];
  for (const providerId of MAX_PROVIDER_IDS) {
    const results = await getProviderTVContentWithFallback(providerId, page, MAX_REGIONS);
    console.log(`[HBO/Max TV] Provider ${providerId} (GB) total: ${results.length}`);
    allResults = allResults.concat(results);
  }
  // Remove duplicates by TMDB id
  const unique = Array.from(new Map(allResults.map(item => [item.id, item])).values());
  return unique;
};

// Peacock (provider id: 386)
export const getPeacockContent = (page: number = 1) => getProviderContent(PROVIDERS.PEACOCK, page);
export const getPeacockTVContent = (page: number = 1) => getProviderTVContent(PROVIDERS.PEACOCK, page);
