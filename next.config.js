// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  // Optional: helps ensure correct asset paths
  assetPrefix: '/',
};
module.exports = {
  siteUrl: 'https://fmovies4u.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://fmovies4u.com/sitemap.xml',
      'https://fmovies4u.com/sitemap-12.xml',
    ],
  },
};
