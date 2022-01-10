function toBool(arg, d = false){
  if(
    arg == "true" ||
    arg == "1" ||
    arg == "yes" ||
    arg == "y" ||
    arg == "enabled"
  ){
    return true
  }
  if(
    arg == "false" ||
    arg == "0" ||
    arg == "no" ||
    arg == "n" ||
    arg == "disabled"
  ){
    return false
  }
  return d
}

const config = {
  site: process.env.WEBFLOW_URL,
  publishUrl: process.env.URL || process.env.VERCEL_URL || process.env.DEPLOY_URL,
  removeBranding: toBool(process.env.REMOVE_WEBFLOW_BRANDING),
  clientRouting: toBool(process.env.CLIENT_ROUTING),

  // optimizeCssLoading: toBool(process.env.INLINE_CSS),

  optimizeImages: toBool(process.env.OPTIMIZE_IMAGES),
  optimizeJsLoading: toBool(process.env.OPTIMIZE_JS_LOADING, true),
  robotsTxt: process.env.REPLACE_ROBOTS_TXT,
  replaceSitemap: toBool(process.env.REPLACE_SITEMAP),
}

console.log(`config`, JSON.stringify(config, null, 2))

module.exports = config