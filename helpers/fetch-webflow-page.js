const cheerio = require(`cheerio`)
const axios = require(`axios`).default
const containsAssetDomain = require(`./contains-asset-domain`)

// For Node.js use outside of Polymorph
module.exports = async function fetchWebflowPage(config) {

  // Fetch HTML
  console.log(`Fetching ${config.url}`)
  let res = await axios(config.url)
    .catch(err => {
      console.log(`Error fetching ${config.url}`)
      console.error(err)
    })
  const html = res.data


  // Parse HTML with Cheerio
  const $ = cheerio.load(html)

  $(`[data-component], [component]`).remove()

  // Remove Webflow scripts
  // $(`script`).each((i, el) => {
  //   const $el = $(el)
  //   const src = $el.attr(`src`)
  //   if(src && containsAssetDomain(src)){
  //     $el.remove()
  //   }
  // })

  // Remove Webflow styles
  $(`link`).each((i, el) => {
    const $el = $(el)
    const href = $el.attr(`href`)
    if(href && containsAssetDomain(href)){
      $el.remove()
    }
  })


  // Fix cross-origin links
  $(`a`).each((i, el) => {
    const $el = $(el)
    const href = $el.attr(`href`)
    if(href){
      if (href.indexOf(`://`) > -1) {
        $el.attr(`rel`, `noopener noreferrer`)
      }
      // Make internal links external
      // else if (!toBool(process.env.BCP)) {
      //   $el.attr(`href`, `${origin}${href.replace(`/`, ``)}`)
      // }
    }
  })


  // Convert back to HTML strings
  const bodyContent = $(`body`).html()
  const headContent = $(`head`).html()

  // Send HTML to component via props
  return {
    bodyContent,
    headContent
  }
}