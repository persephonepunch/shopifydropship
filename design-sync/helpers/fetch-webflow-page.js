const cheerio = require(`cheerio`)
const axios = require(`axios`).default
const containsAssetDomain = require(`./contains-asset-domain`)
const meta = require(`../../.design-sync/meta.json`)

module.exports = async function fetchWebflowPage({ url, ignoreError }) {

  if(url.charAt(0) !== `/`){
    url = `/${url}`
  }

  let webflowUrl = meta.webflowUrl
  if(webflowUrl.charAt(webflowUrl.length - 1) === `/`){
    webflowUrl = webflowUrl.slice(0, -1)
  }

  url = webflowUrl + url

  console.log(`Fetching`, url)

  // Fetch HTML
  let data
  try{
    let res = await axios(url)
      .catch(err => {
        console.log(`Error fetching ${url}`)
        // console.error(err)
        if(ignoreError){
          data = err.response.data
        }
      })
    data = res.data
    // console.log(`res.data`, data)
  }
  catch(err){
    if(!data){
      process.exit(1)
    }
  }
  const html = data


  // Parse HTML with Cheerio
  const $ = cheerio.load(html)

  // $(`[data-component], [component]`).remove()

  // Add ignore attribute to slideshow images
  $(`.w-slider-mask img`).attr(`data-next-ignore`, `true`)

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
      const isExternal = href.indexOf(`:`) > -1
      if (isExternal) {
        $el.attr(`rel`, `noopener noreferrer`)
      }

      // Convert paginated links to static paths
      else if(href.indexOf(`?`) > -1 && href.indexOf(`=`) > -1){

        href = href.replace(/\?/g, `/`).replace(/\=/g, `/`)
        $el.attr(`href`, pathname + href)
      }
    }
  })


  const htmlAttributes = $(`html`).attr()
  delete htmlAttributes[`data-wf-domain`]
  const bodyAttributes = $(`body`).attr()

  // Create body HTML without scripts for initial render
  let noScriptsBody = $(`body`).clone()
  noScriptsBody.find(`script`).remove()
  noScriptsBody = noScriptsBody.html()

  // Create head HTML without scripts for initial render
  let noScriptsHead = $(`head`).clone()
  noScriptsHead.find(`script`).remove()
  noScriptsHead = noScriptsHead.html()

  // Convert back to HTML strings
  const bodyContent = $(`body`).html()
  const headContent = $(`head`).html()

  if(bodyAttributes.style){
    bodyAttributes.css = bodyAttributes.style
    delete bodyAttributes.style
  }

  // Send HTML to component via props
  return {
    bodyContent,
    headContent,
    noScriptsBody,
    noScriptsHead,
    htmlAttributes,
    bodyAttributes,
    webflowStylesheet,
    url,
  }
}