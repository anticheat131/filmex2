import { tmdb } from './tmdb';
import { Media } from '../types';
import { TMDBMovieResult, TMDBTVResult } from '../types/tmdb';
import { formatMediaResult } from './media';

// Helper to fetch logo_path for a movie or tv show
async function fetchLogoPath(mediaType: 'movie' | 'tv', id: number): Promise<string | null> {
  try {
    const res = await tmdb.get(`/${mediaType}/${id}/images`);
    const logos = res.data.logos || [];
    // DEBUG: Log the full logos array for inspection
    console.log(`[TMDB LOGO DEBUG] ${mediaType} ${id} logos:`, JSON.stringify(logos, null, 2));
    if (logos.length === 0) {
      console.warn(`[TMDB LOGO] No logos for`, mediaType, id);
    } else {
      console.info(`[TMDB LOGO] Logos for`, mediaType, id, logos.map(l => ({ path: l.file_path, width: l.width, lang: l.iso_639_1 })));
    }
    // Strict logo selection logic:
    // 1. English logo with width 1916
    // 2. Any English logo
    // 3. Any logo with width 1916
    // 4. First available logo
    let logo = logos.find((l: any) => l.width === 1916 && l.iso_639_1 === 'en')
      || logos.find((l: any) => l.iso_639_1 === 'en')
      || logos.find((l: any) => l.width === 1916)
      || logos[0];
    return logo ? logo.file_path : null;
  } catch (e) {
    console.error(`[TMDB LOGO] Error fetching logos for`, mediaType, id, e);
    return null;
  }
}

// Get trending movies and TV shows with logo_path
export async function getTrending(timeWindow: 'day' | 'week' = 'week', page = 1): Promise<Media[]> {
  try {
    const [moviesResponse, tvShowsResponse] = await Promise.all([
      tmdb.get<{ results: TMDBMovieResult[] }>(`/trending/movie/${timeWindow}`, {
        params: { page }
      }),
      tmdb.get<{ results: TMDBTVResult[] }>(`/trending/tv/${timeWindow}`, {
        params: { page }
      })
    ]);

    // Combine and format all results
    const movies = moviesResponse.data.results.map(item => 
      formatMediaResult({ ...item, media_type: 'movie' }));
    const tvShows = tvShowsResponse.data.results.map(item => 
      formatMediaResult({ ...item, media_type: 'tv' }));

    // Merge and sort by popularity (vote_average)
    let combined = [...movies, ...tvShows]
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 20);

    // Fetch logo_path for each item in parallel
    combined = await Promise.all(combined.map(async (item) => {
      const logo_path = await fetchLogoPath(item.media_type, item.id);
      console.log('[TRENDING LOGO]', item.title || item.name, 'ID:', item.id, 'logo_path:', logo_path);
      return { ...item, logo_path };
    }));

    return combined;
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return [];
  }
}
