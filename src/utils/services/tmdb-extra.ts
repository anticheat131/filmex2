// utils/services/tmdb-extra.ts
import { tmdbFetch } from './tmdb';

export async function getReleaseInfo(movieId: number): Promise<number | null> {
  try {
    const data = await tmdbFetch(`/movie/${movieId}/release_dates`);
    const usRelease = data.results.find((r: any) => r.iso_3166_1 === 'US');
    return usRelease?.release_dates?.[0]?.type ?? null;
  } catch {
    return null;
  }
}
