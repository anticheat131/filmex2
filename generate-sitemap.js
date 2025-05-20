import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const SITE_URL = "https://fmovies4u.com";
const OUTPUT_DIR = "./public";
const MAX_URLS_PER_SITEMAP = 40000; // safe margin under 50k limit
const totalPages = 50;  // updated from 10 to 50

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function fetchItems(endpoint) {
  let items = [];
  for (let page = 1; page <= totalPages; page++) {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    if (data.results) items.push(...data.results);
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
  // 1. Static pages to always include
  const staticPages = [
    `${SITE_URL}/`,
    `${SITE_URL}/tv`,
    `${SITE_URL}/movie`,
    `${SITE_URL}/dmca`,
    `${SITE_URL}/privacypolicy`,
    // Add more static pages here if needed
  ];

  // 2. Fetch TMDB popular movies and tv shows
  const [movies, tv] = await Promise.all([
    fetchItems("/movie/popular"),
    fetchItems("/tv/popular"),
  ]);

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

  // Combine all URLs
  const allUrls = [...staticPages, ...dynamicUrls];

  // Split into multiple sitemap files if needed
  const sitemaps = [];
  for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = allUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const sitemapFilename = `sitemap${sitemaps.length + 1}.xml`;
    const sitemapXml = generateSitemapXml(chunk);
    fs.writeFileSync(`${OUTPUT_DIR}/${sitemapFilename}`, sitemapXml);
    sitemaps.push(sitemapFilename);
  }

  // Generate sitemap index
  const sitemapIndexXml = generateSitemapIndexXml(sitemaps);
  fs.writeFileSync(`${OUTPUT_DIR}/sitemap_index.xml`, sitemapIndexXml);

  console.log(`Generated ${sitemaps.length} sitemap file(s) plus sitemap_index.xml`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
buildSitemap().catch(console.error);
