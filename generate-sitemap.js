import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const SITE_URL = "https://fmovies4u.com";
const OUTPUT_DIR = "./public";

// Max URLs per sitemap
const MAX_URLS_PER_SITEMAP = 3000;
const totalPages = 10;

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function fetchItems(endpoint) {
  let items = [];
  for (let page = 1; page <= totalPages; page++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${page}`);
      const data = await res.json();
      if (!res.ok) {
        console.error(`API error on ${endpoint} page ${page}:`, data);
        break;
      }
      console.log(`Fetched ${data.results?.length || 0} items from ${endpoint} page ${page}`);
      if (data.results) items.push(...data.results);
    } catch (error) {
      console.error(`Fetch error on ${endpoint} page ${page}:`, error);
      break;
    }
  }
  return items;
}

function generateSitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("")}
</urlset>`;
}

function generateSitemapIndexXml(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `
  <sitemap>
    <loc>${SITE_URL}/${sitemap}</loc>
  </sitemap>`
  )
  .join("")}
</sitemapindex>`;
}

async function buildSitemap() {
  const staticPages = [
    `${SITE_URL}/`,
    `${SITE_URL}/tv`,
    `${SITE_URL}/movie`,
    `${SITE_URL}/dmca`,
    `${SITE_URL}/privacypolicy`,
  ];

  const [movies, tv] = await Promise.all([
    fetchItems("/movie/popular"),
    fetchItems("/tv/popular"),
  ]);

  console.log(`Total movies fetched: ${movies.length}`);
  console.log(`Total TV shows fetched: ${tv.length}`);

  const dynamicUrls = [];

  for (const movie of movies) {
    const slug = slugify(movie.title);
    dynamicUrls.push(`${SITE_URL}/movie/${movie.id}-${slug}`);
  }

  for (const show of tv) {
    const slug = slugify(show.name);
    const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "";
    dynamicUrls.push(`${SITE_URL}/tv/${show.id}-${slug}-${year}`);
  }

  const allUrls = [...staticPages, ...dynamicUrls];

  const sitemaps = [];
  for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = allUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const sitemapFilename = `sitemap${sitemaps.length + 1}.xml`;
    const sitemapXml = generateSitemapXml(chunk);
    fs.writeFileSync(`${OUTPUT_DIR}/${sitemapFilename}`, sitemapXml);
    sitemaps.push(sitemapFilename);
  }

  const sitemapIndexXml = generateSitemapIndexXml(sitemaps);
  fs.writeFileSync(`${OUTPUT_DIR}/sitemap_index.xml`, sitemapIndexXml);

  console.log(`Generated ${sitemaps.length} sitemap files + sitemap_index.xml`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
buildSitemap().catch(console.error);
