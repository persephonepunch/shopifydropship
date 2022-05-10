import DynamicPath from './index'
import get from 'lodash/get'
import fetchWebflowPage from '../helpers/fetch-webflow-page'
import pageList from '../../.design-sync/page-list.json'
import config from '../config'

export default DynamicPath

export async function getStaticProps(ctx) {

	// Use path to determine Webflow path
	let url = get(ctx, `params.path`)
	url = url.join(`/`)

 	 // If not in page list, it's probably a paginated link that needs to be reassembled
	if(pageList.indexOf(`/${url}`) === -1 && url !== `404`){
		url = url.split(`/`)
		const pageNumber = url.pop()
		const paramName = url.pop()
		url = url.join(`/`)
		url = `${url}?${paramName}=${pageNumber}`
	}

	if(pageList.indexOf(`/${url}`) === -1){
		return{
			notFound: true,
			revalidate: false,
		}
	}
 
	const props = await fetchWebflowPage({ url })
 
	// Send HTML to component via props
	return {
	  props,
	  revalidate: config.revalidate || false,
	}
}

export async function getStaticPaths() {
	const paths = []

	// Limit so builds don't take forever for large sites
	let limit = config.staticPageLimit || 0
	let i = 0
	for(let link of pageList){
		i++
		if(i > limit){
			break
		}
		link = link
			.replace(/\=/g, `/`)
			.replace(/\?/g, `/`)
		const path = link.replace(`/`, ``).split(`/`)
		if(!path.length || !path[0]) continue

		paths.push({
			params: {
				path,
			}
		})
	}

	return {
	  paths,
	  fallback: `blocking`,
	}
 }