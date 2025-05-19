import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_URL = 'https://fmovies4u.com'; // Change to your actual site

const MAX_URLS_PER_SITEMAP = 500; // safe limit below Google max 50k

async function fetchTmdb(endpoint, page = 1) {
  const url = `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint} page ${page}`);
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
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set in environment variables');
  }

  // Basic URLs
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/movie`,
    `${SITE_URL}/tv`,
    `${SITE_URL}/privacy-policy`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/dmca`,
  ];

  // Fetch popular movies (first 50 pages, ~1000 movies)
  for (let page = 1; page <= 50; page++) {
    const data = await fetchTmdb('/movie/popular', page);
    for (const movie of data.results) {
      const slug = movie.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      urls.push(`${SITE_URL}/movie/${movie.id}-${slug}`);
    }
  }

  // Fetch popular TV shows (first 50 pages, ~1000 shows)
  for (let page = 1; page <= 50; page++) {
    const data = await fetchTmdb('/tv/popular', page);
    for (const tv of data.results) {
      const slug = tv.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      urls.push(`${SITE_URL}/tv/${tv.id}-${slug}`);
    }
  }

  // Split URLs into chunks for multiple sitemap files
  const chunks = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  const sitemapDir = path.join(process.cwd(), 'public', 'sitemaps');
  if (!fs.existsSync(sitemapDir)) {
    fs.mkdirSync(sitemapDir, { recursive: true });
  }

  // Write sitemap files
  for (let i = 0; i < chunks.length; i++) {
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${chunks[i].map(url => createUrlEntry(url)).join('\n')}
</urlset>`.trim();

    fs.writeFileSync(path.join(sitemapDir, `sitemap-${i + 1}.xml`), sitemapContent);
  }

  // Write sitemap index
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${chunks.map((_, i) => `<sitemap><loc>${SITE_URL}/sitemaps/sitemap-${i + 1}.xml</loc></sitemap>`).join('\n')}
</sitemapindex>`.trim();

  fs.writeFileSync(path.join(sitemapDir, 'sitemap-index.xml'), sitemapIndex);

  console.log(`Generated ${chunks.length} sitemap files plus index.`);
}

generateSitemaps().catch(err => {
  console.error('Error generating sitemaps:', err);
  process.exit(1);
});
