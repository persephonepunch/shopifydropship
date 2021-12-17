const pages = require('../helpers/polymorph/page-list.json')
const config = require('../polymorph.json')
const { outputFile } = require('fs-extra')

async function generateSitemap(){
  let baseUrl = config.publishUrl || process.env.URL || `http://localhost:3000`
  if(baseUrl.charAt(baseUrl.length - 1) == `/`){
    baseUrl = baseUrl.substring(0, baseUrl.length - 1)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((url) => {
          return `
            <url>
              <loc>${baseUrl + url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>1.0</priority>
            </url>
          `;
        })
        .join("")}
    </urlset>
  `
  await outputFile(`./public/sitemap.xml`, sitemap)

}
generateSitemap().catch(err => {
  console.error(err)
  process.exit(1)
})