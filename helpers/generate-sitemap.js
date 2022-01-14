const pages = require('../.design-sync/page-list.json')
const config = require(`../design-sync/config`)
const { outputFile } = require('fs-extra')
// const axios = require('axios')

async function generateSitemap(){
  console.log(`Generating sitemap.xml...`)
  let baseUrl = config.publishUrl || process.env.URL || process.env.VERCEL_URL || process.env.DEPLOY_URL || `http://localhost:3000`
  if(baseUrl.charAt(baseUrl.length - 1) == `/`){
    baseUrl = baseUrl.substring(0, baseUrl.length - 1)
  }
  if(baseUrl.indexOf(`http`) !== 0){
    baseUrl = `https://${baseUrl}`
  }


  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((url) => {
          url = url
            .replace(/\=/g, `/`)
            .replace(/\?/g, `/`)
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