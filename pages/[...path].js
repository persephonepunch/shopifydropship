import GetSitemapLinks from 'sitemap-links'
import DynamicPath, { getStaticProps } from './index'
import polymorphConfig from '../polymorph.json'

export default DynamicPath

export { getStaticProps }

export async function getStaticPaths() {
	// Fetch links from Webflow sitemap
  let webflowUrl = polymorphConfig.site
  if(webflowUrl.charAt(webflowUrl.length - 1) === `/`){
    webflowUrl = webflowUrl.slice(0, -1)
  }

	const sitemapLink = webflowUrl + `/sitemap.xml`
	const links = await GetSitemapLinks(sitemapLink).catch(err => {
		console.error(err)
	})

	// Extract paths from absolute links
	const paths = []
	for(let link of links){
		let url = new URL(link)
		const path = url.pathname.replace(`/`, ``).split(`/`)
		if(!path.length || !path[0]) continue
		paths.push({
			params: { path }
		})
	}

	return {
	  paths: paths,
	  fallback: `blocking`,
	}
 }