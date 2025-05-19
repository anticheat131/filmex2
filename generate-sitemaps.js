import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const BASE_URL = 'https://fmovies4u.com'; // Replace with your domain
const TOTAL_ITEMS = 1000;
const ITEMS_PER_SITEMAP = 200;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapDir = path.join(__dirname, 'public', 'sitemaps');

// Helper to fetch from TMDB
async function fetchTmdb(endpoint) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${endpoint}`);
  return res.json();
}

// Helper to generate <url> entries
function createUrlEntry(loc) {
  return `
    <url>
      <loc>${loc}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
}

// Generate individual sitemaps
async function generateSitemaps() {
  await fs.mkdir(sitemapDir, { recursive: true });

  const urls = [];

  // Add static pages
  urls.push(`${BASE_URL}/`);
  urls.push(`${BASE_URL}/movie`);
  urls.push(`${BASE_URL}/tv`);
  urls.push(`${BASE_URL}/privacy-policy`);
  urls.push(`${BASE_URL}/terms`);
  urls.push(`${BASE_URL}/dmca`);

  // Fetch movies
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

  // Fetch TV shows
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

  // Split and write sitemaps
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
    await fs.writeFile(path.join(sitemapDir, filename), sitemapXml, 'utf-8');

    indexEntries.push(`
  <sitemap>
    <loc>${BASE_URL}/sitemaps/${filename}</loc>
  </sitemap>`);
  }

  // Write sitemap index
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>`;

  await fs.writeFile(path.join(sitemapDir, 'sitemap-index.xml'), indexXml, 'utf-8');

  console.log(`✅ Generated ${chunks.length} sitemap files with ${urls.length} total URLs`);
}

generateSitemaps().catch((err) => {
  console.error('❌ Error generating sitemaps:', err);
  process.exit(1);
});
