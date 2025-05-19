import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const BASE_URL = 'https://fmovies4u.com';
const TOTAL_ITEMS = 1000;
const ITEMS_PER_SITEMAP = 200;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FIXED: use repo root, not script location
const sitemapDir = path.join(process.cwd(), 'public', 'sitemaps');

// Helper to fetch from TMDB
async function fetchTmdb(endpoint) {
  const url = `https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${process.env.TMDB_API_KEY}`;
  console.log(`Fetching TMDB: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${endpoint}`);
  return res.json();
}

function createUrlEntry(loc) {
  return `
    <url>
      <loc>${loc}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
}

async function generateSitemaps() {
  await fs.mkdir(sitemapDir, { recursive: true });
  console.log('Sitemap output dir:', sitemapDir);

  const urls = [];

  // Static pages
  urls.push(`${BASE_URL}/`, `${BASE_URL}/movie`, `${BASE_URL}/tv`);
  urls.push(`${BASE_URL}/privacy-policy`, `${BASE_URL}/terms`, `${BASE_URL}/dmca`);

  // Movies
  let page = 1;
  while (urls.length < TOTAL_ITEMS && page <= 50) {
    const data = await fetchTmdb(`/movie/popular?page=${page}`);
    for (const movie of data.results) {
      const slug = movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      urls.push(`${BASE_URL}/movie/${movie.id}-${slug}`);
      if (urls.length >= TOTAL_ITEMS) break;
    }
    page++;
  }

  // TV shows
  page = 1;
  while (urls.length < TOTAL_ITEMS && page <= 50) {
    const data = await fetchTmdb(`/tv/popular?page=${page}`);
    for (const tv of data.results) {
      const slug = tv.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      urls.push(`${BASE_URL}/tv/${tv.id}-${slug}-${tv.first_air_date?.split('-')[0] || 'unknown'}`);
      if (urls.length >= TOTAL_ITEMS) break;
    }
    page++;
  }

  console.log(`Collected ${urls.length} URLs`);

  const chunks = [];
  for (let i = 0; i < urls.length; i += ITEMS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + ITEMS_PER_SITEMAP));
  }

  const indexEntries = [];

  for (let i = 0; i < chunks.length; i++) {
    const body = chunks[i].map(url => createUrlEntry(url)).join('');
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

    const filename = `sitemap-${i + 1}.xml`;
    const filepath = path.join(sitemapDir, filename);
    console.log(`Writing ${filepath}`);
    await fs.writeFile(filepath, sitemapXml, 'utf-8');

    indexEntries.push(`
  <sitemap>
    <loc>${BASE_URL}/sitemaps/${filename}</loc>
  </sitemap>`);
  }

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>`;

  const indexPath = path.join(sitemapDir, 'sitemap-index.xml');
  console.log(`Writing ${indexPath}`);
  await fs.writeFile(indexPath, indexXml, 'utf-8');

  console.log(`✅ Finished. ${chunks.length} sitemaps written.`);
}

generateSitemaps().catch((err) => {
  console.error('❌ Error generating sitemaps:', err);
  process.exit(1);
});
