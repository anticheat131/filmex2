import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const SITE_URL = "https://fmovies4u.com";
const OUTPUT_PATH = "./public/sitemap.xml";
const totalPages = 10;

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

async function buildSitemap() {
  const [movies, tv] = await Promise.all([
    fetchItems("/movie/popular"),
    fetchItems("/tv/popular"),
  ]);

  const urls = [];

  for (const movie of movies) {
    const slug = slugify(movie.title);
    urls.push(`${SITE_URL}/movie/${movie.id}-${slug}`);
  }

  for (const show of tv) {
    const slug = slugify(show.name);
    const year = new Date(show.first_air_date).getFullYear();
    urls.push(`${SITE_URL}/tv/${show.id}-${slug}-${year}`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, xml);
}

buildSitemap().catch(console.error);
