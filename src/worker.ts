export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml") {
      let sitemap = await env.SITEMAPS.get("sitemap.xml");

      if (!sitemap) {
        const urls = await fetchSitemapData();
        sitemap = generateSitemapXml(urls, url.origin);
        await env.SITEMAPS.put("sitemap.xml", sitemap);
      }

      return new Response(sitemap, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env) {
    const urls = await fetchSitemapData();
    const sitemap = generateSitemapXml(urls, "https://yourdomain.com");
    await env.SITEMAPS.put("sitemap.xml", sitemap);
  }
};

async function fetchSitemapData(): Promise<string[]> {
  // Replace with your dynamic URL fetching logic (e.g., from TMDB)
  return ["/", "/movie/123", "/tv/456"];
}

function generateSitemapXml(urls: string[], baseUrl: string): string {
  const urlSet = urls.map(url => `
    <url>
      <loc>${baseUrl}${url}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlSet}
  </urlset>`;
}

interface Env {
  SITEMAPS: KVNamespace;
}
