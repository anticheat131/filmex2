// generate-sitemaps.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_KEY = process.env.TMDB_API_KEY;
const DOMAIN = 'https://fmovies4u.com';
const SITEMAP_DIR = path.join(__dirname, 'public', 'sitemaps');

const chunkSize = 50000; // Sitemap spec limit

function slugify(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

async function fetchItems(type = 'movie', maxPages = 10) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    all.push(...data.results);
  }
  return all;
}

function writeSitemap(fileName, urls) {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `<url><loc>${url}</loc></url>`).join('\n')}
  </urlset>`;
  fs.writeFileSync(path.join(SITEMAP_DIR, fileName), content);
}

function writeIndex(fileList) {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${fileList.map(f => `<sitemap><loc>${DOMAIN}/sitemaps/${f}</loc></sitemap>`).join('\n')}
  </sitemapindex>`;
  fs.writeFileSync(path.join(SITEMAP_DIR, 'sitemap.xml'), content);
}

async function main() {
  if (!fs.existsSync(SITEMAP_DIR)) fs.mkdirSync(SITEMAP_DIR, { recursive: true });

  const movies = await fetchItems('movie');
  const shows = await fetchItems('tv');

  const movieUrls = movies.map(m => `${DOMAIN}/movie/${m.id}-${slugify(m.title || m.name)}`);
  const tvUrls = shows.map(t => `${DOMAIN}/tv/${t.id}-${slugify(t.name)}`);

  const allUrls = [...movieUrls, ...tvUrls];
  const chunks = [];
  for (let i = 0; i < allUrls.length; i += chunkSize) {
    chunks.push(allUrls.slice(i, i + chunkSize));
  }

  const fileList = [];
  chunks.forEach((chunk, i) => {
    const fileName = `sitemap-${i + 1}.xml`;
    writeSitemap(fileName, chunk);
    fileList.push(fileName);
  });

  writeIndex(fileList);
  console.log(`Generated ${fileList.length} sitemap files.`);
}

main();
