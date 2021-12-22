import DynamicPath from './index'
import fetchWebflowPage from '../helpers/fetch-webflow-page'

export default DynamicPath

export async function getStaticProps(ctx) {
	console.log(`ctx`, ctx)


	const props = await fetchWebflowPage({ url: `/404` })
 
	// Send HTML to component via props
	return {
	  props,
	  // revalidate: false,
	}
 }