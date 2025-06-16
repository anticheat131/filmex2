import axios from 'axios';
import { TMDB } from '../config/constants';

// Create axios instance for TMDB
export const tmdb = axios.create({
  baseURL: TMDB.BASE_URL,
  params: {
    api_key: TMDB.API_KEY,
    language: 'en-US'
  }
});

// Helper function to get full image URL
export const getImageUrl = (path: string | null, size: string): string | null => {
  if (!path) return null;
  return `${TMDB.IMAGE_BASE_URL}/${size}${path}`;
};

// NEW: Fetch full media details (needed for runtime, etc.)
export const getMediaDetails = async (mediaType: 'movie' | 'tv', mediaId: number) => {
  const response = await tmdb.get(`/${mediaType}/${mediaId}`);
  return response.data;
};

// Fetch person details
export const getPersonDetails = async (personId: string | number) => {
  const response = await tmdb.get(`/person/${personId}`);
  return response.data;
};

// Fetch person combined credits (movies + TV)
export const getPersonCombinedCredits = async (personId: string | number) => {
  const response = await tmdb.get(`/person/${personId}/combined_credits`);
  return response.data;
};

// Fetch person images
export const getPersonImages = async (personId: string | number) => {
  const response = await tmdb.get(`/person/${personId}/images`);
  return response.data;
};

// Update TMDB language
export function setTmdbLanguage(lang: string) {
  tmdb.defaults.params.language = lang;
}
