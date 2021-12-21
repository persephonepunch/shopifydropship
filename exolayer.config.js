module.exports = {
  site: `https://sl4.webflow.io/`,
  publishUrl: process.env.URL || process.env.VERCEL_URL || process.env.DEPLOY_URL,
  removeBranding: true,
  optimizeImages: true,
  clientRouting: true,
  optimizeCssLoading: true,
  optimizeJsLoading: true,
}
