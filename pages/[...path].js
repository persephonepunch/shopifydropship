import DynamicPath, { getStaticProps } from './index'
import pageList from '../helpers/polymorph/page-list.json'

export default DynamicPath

export { getStaticProps }

export async function getStaticPaths() {
	const paths = []

	// Add all pages
	for(let link of pageList){
		const path = link.replace(`/`, ``).split(`/`)
		if(!path.length || !path[0]) continue
		paths.push({
			params: { path }
		})
	}

	return {
	  paths,
	  fallback: `blocking`,
	}
 }