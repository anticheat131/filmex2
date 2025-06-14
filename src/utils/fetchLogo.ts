import { useEffect, useState } from 'react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export async function fetchLogo(mediaId: number, mediaType: string = 'movie') {
  const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/images?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  let logo = null;
  if (data.logos && data.logos.length > 0) {
    // Prefer English logo
    const enLogo = data.logos.find((l: any) => l.iso_639_1 === 'en');
    logo = enLogo ? enLogo.file_path : data.logos[0].file_path;
  }
  return logo;
}
