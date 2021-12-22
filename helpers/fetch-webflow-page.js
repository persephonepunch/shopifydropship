const cheerio = require(`cheerio`)
const axios = require(`axios`).default
const containsAssetDomain = require(`./contains-asset-domain`)
const config = require('../exolayer.config')
const pageList = require('../.exolayer/page-list.json')

module.exports = async function fetchWebflowPage({ url }) {

  if(url.charAt(0) !== `/`){
    url = `/${url}`
  }

  let webflowUrl = config.site
  if(webflowUrl.charAt(webflowUrl.length - 1) === `/`){
    webflowUrl = webflowUrl.slice(0, -1)
  }

  // If not in page list, it's probably a paginated link that needs to be reassembled
  if(pageList.indexOf(url) === -1 && url !== `/404`){
    url = url.split(`/`)
    const pageNumber = url.pop()
    const paramName = url.pop()
    url = url.join(`/`)
    url = `${url}?${paramName}=${pageNumber}`
  }
  url = webflowUrl + url

  console.log(`Fetching`, url)

  // Fetch HTML
  console.log(`Fetching ${url}`)
  let res = await axios(url)
    .catch(err => {
      console.log(`Error fetching ${url}`)
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
  let webflowStylesheetUrl
  let webflowStylesheet = ``
  $(`link`).each((i, el) => {
    const $el = $(el)
    const href = $el.attr(`href`)
    if(href && containsAssetDomain(href) && href.indexOf(`.css`) > -1){
      webflowStylesheetUrl = href
      $el.remove()
    }

    // Remove fonts
    // const type = $el.attr(`type`)
    // if(type && type.indexOf(`font`) > -1){
    //   $el.remove()
    // }
  })


  // if(webflowStylesheetUrl){
  //   // Fetch as string
  //   console.log(`Fetching ${webflowStylesheetUrl}`)
  //   let res = await axios(webflowStylesheetUrl)
  //     .catch(err => {
  //       console.log(`Error fetching ${webflowStylesheetUrl}`)
  //       console.error(err)
  //     }
  //   )
  //   console.log(`res`, res)
  //   // Convert to string
  //   webflowStylesheet = res.data.toString()

  // }

  // Get path
  const parseUrl = new URL(url)
  const pathname = parseUrl.pathname


  $(`a`).each((i, el) => {
    const $el = $(el)
    let href = $el.attr(`href`)
    if(href){

      // Fix cross-origin links
      if (href.indexOf(`://`) > -1) {
        $el.attr(`rel`, `noopener noreferrer`)
      }

      // Convert paginated links to static paths
      if(href.indexOf(`?`) > -1 && href.indexOf(`=`) > -1){

        href = href.replace(/\?/g, `/`).replace(/\=/g, `/`)
        $el.attr(`href`, pathname + href)
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
    headContent,
    webflowStylesheet,
    url,
  }
}