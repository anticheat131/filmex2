import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const BASE_URL = 'https://mapple.tv/live-tv?page=';
const MAX_PAGES = 61; // Adjust if needed

async function scrapePage(page) {
  const url = `${BASE_URL}${page}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const channels = [];

  $('.grid a[href^="/watch/channel/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const idMatch = href.match(/channel\/(\d+)/);
    const id = idMatch ? parseInt(idMatch[1], 10) : null;
    const name = $el.find('h3').text().trim();
    const logo = $el.find('img').attr('src');
    // Collect all category badges as an array
    const categories = $el.find('.inline-flex.items-center.rounded-full')
      .map((_, catEl) => $(catEl).text().trim().toLowerCase())
      .get();
    if (id && name) {
      channels.push({
        id,
        name,
        logo,
        categories, // now an array
        streamUrl: `https://daddylivehd.site/embed/stream-${id}.php`
      });
    }
  });

  return channels;
}

(async () => {
  let allChannels = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    console.log(`Scraping page ${page}...`);
    try {
      const channels = await scrapePage(page);
      allChannels = allChannels.concat(channels);
    } catch (e) {
      console.error(`Failed to scrape page ${page}:`, e.message);
    }
  }
  fs.writeFileSync('channels.json', JSON.stringify(allChannels, null, 2));
  console.log(`Scraped ${allChannels.length} channels. Saved to channels.json`);
})();
