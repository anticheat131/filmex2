import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const SITE_URL = "https://fmovies4u.com";
const OUTPUT_DIR = "./public";

const MAX_URLS_PER_SITEMAP = 1000; // max URLs per sitemap file
const START_YEAR = 1990;
const END_YEAR = 2025;
const MAX_PAGES_PER_YEAR = 5; // adjust if needed to control API calls

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Fetch movies by year with pagination
async function fetchMoviesByYear(year) {
  let items = [];
  for (let page = 1; page <= MAX_PAGES_PER_YEAR; page++) {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}` +
      `&primary_release_date.gte=${year}-01-01` +
      `&primary_release_date.lte=${year}-12-31` +
      `&page=${page}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error fetching movies for year ${year} page ${page}`, await res.text());
      break;
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) break;

    items.push(...data.results);

    if (page >= data.total_pages) break; // no more pages
  }
  return items;
}

// Fetch TV shows by year with pagination
async function fetchTVByYear(year) {
  let items = [];
  for (let page = 1; page <= MAX_PAGES_PER_YEAR; page++) {
    const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}` +
      `&first_air_date.gte=${year}-01-01` +
      `&first_air_date.lte=${year}-12-31` +
      `&page=${page}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error fetching TV shows for year ${year} page ${page}`, await res.text());
      break;
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) break;

    items.push(...data.results);

    if (page >= data.total_pages) break;
  }
  return items;
}

// Generate XML for URLs in a sitemap file
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

// Generate sitemap index XML pointing to all sitemap files
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

  let allMovies = [];
  let allTV = [];

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    console.log(`Fetching movies for year ${year}`);
    const movies = await fetchMoviesByYear(year);
    allMovies.push(...movies);

    console.log(`Fetching TV shows for year ${year}`);
    const tvShows = await fetchTVByYear(year);
    allTV.push(...tvShows);
  }

  // Deduplicate movies by id
  const uniqueMovies = [...new Map(allMovies.map(m => [m.id, m])).values()];
  const uniqueTV = [...new Map(allTV.map(t => [t.id, t])).values()];

  console.log(`Unique movies fetched: ${uniqueMovies.length}`);
  console.log(`Unique TV shows fetched: ${uniqueTV.length}`);

  const dynamicUrls = [];

  for (const movie of uniqueMovies) {
    const slug = slugify(movie.title || "");
    dynamicUrls.push(`${SITE_URL}/movie/${movie.id}-${slug}`);
  }

  for (const show of uniqueTV) {
    const slug = slugify(show.name || "");
    const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : "";
    dynamicUrls.push(`${SITE_URL}/tv/${show.id}-${slug}-${year}`);
  }

  const allUrls = [...staticPages, ...dynamicUrls];

  console.log(`Total URLs to include in sitemap: ${allUrls.length}`);

  const sitemaps = [];

  for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = allUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const sitemapFilename = `sitemap${sitemaps.length + 1}.xml`;
    const sitemapXml = generateSitemapXml(chunk);
    fs.writeFileSync(`${OUTPUT_DIR}/${sitemapFilename}`, sitemapXml);
    sitemaps.push(sitemapFilename);
    console.log(`Generated ${sitemapFilename} with ${chunk.length} URLs`);
  }

  const sitemapIndexXml = generateSitemapIndexXml(sitemaps);
  fs.writeFileSync(`${OUTPUT_DIR}/sitemap_index.xml`, sitemapIndexXml);
  console.log(`Generated sitemap_index.xml pointing to ${sitemaps.length} sitemaps`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
buildSitemap().catch(console.error);
