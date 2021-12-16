import DynamicPath, { getStaticProps } from './index'
// import pageList from '../helpers/ui-page-list.json'

export default DynamicPath

export { getStaticProps }

export async function getStaticPaths() {
	// const paths = []
	// for(let link of pageList){
	// 	const path = link.replace(`/`, ``).split(`/`)
	// 	if(!path.length || !path[0]) continue
	// 	paths.push({
	// 		params: { path }
	// 	})
	// }

	return {
	  paths: [],
	  fallback: `blocking`,
	}
 }