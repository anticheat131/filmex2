// generate-sitemaps.js
const fs = require("fs");
const path = require("path");

const sitemapFolder = path.join(__dirname, "public", "sitemaps");
if (!fs.existsSync(sitemapFolder)) fs.mkdirSync(sitemapFolder, { recursive: true });

const sitemapPath = path.join(sitemapFolder, "sitemap-1.xml");

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fmovies4u.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapContent);
console.log("✅ Sitemap generated:", sitemapPath);
