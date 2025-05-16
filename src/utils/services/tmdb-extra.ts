// src/utils/services/tmdb-extra.ts
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function getReleaseInfo(movieId: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const usRelease = data.results.find((r: any) => r.iso_3166_1 === 'US');
    return usRelease?.release_dates?.[0]?.type ?? null;
  } catch {
    return null;
  }
}
