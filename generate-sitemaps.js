import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://fmovies4u.com';
const BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('Error: TMDB_API_KEY environment variable is not set.');
  process.exit(1);
}

const MAX_URLS_PER_SITEMAP = 500; // safe limit

async function fetchTmdb(endpoint, page = 1) {
  const url = `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint} page ${page}: ${res.statusText}`);
  return res.json();
}

function createUrlEntry(loc, lastmod = new Date().toISOString()) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

async function generateSitemaps() {
  // Base URLs
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/movie`,
    `${SITE_URL}/tv`,
    `${SITE_URL}/privacy-policy`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/dmca`,
  ];

  console.log('Fetching popular movies...');
  for (let page = 1; page <= 50; page++) {
    const data = await fetchTmdb('/movie/popular', page);
    for (const movie of data.results) {
      const slug = movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      urls.push(`${SITE_URL}/movie/${movie.id}-${slug}`);
    }
  }

  console.log('Fetching popular TV shows...');
  for (let page = 1; page <= 50; page++) {
    const data = await fetchTmdb('/tv/popular', page);
    for (const tv of data.results) {
      const slug = tv.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      urls.push(`${SITE_URL}/tv/${tv.id}-${slug}`);
    }
  }

  // Split URLs into chunks
  const chunks = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  const sitemapDir = path.join(process.cwd(), 'public', 'sitemaps');
  if (!fs.existsSync(sitemapDir)) {
    fs.mkdirSync(sitemapDir, { recursive: true });
  }

  // Write sitemap files
  console.log(`Writing ${chunks.length} sitemap files...`);
  for (let i = 0; i < chunks.length; i++) {
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${chunks[i].map(url => createUrlEntry(ur
