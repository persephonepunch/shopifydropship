import LivePath from './index'
import get from 'lodash/get'
import fetchWebflowPage from '../helpers/fetch-webflow-page'

export default LivePath

export async function getServerSideProps(ctx) {
	const url = get(ctx, `resolvedUrl`)
 
	const props = await fetchWebflowPage({ url })
 
	// Send HTML to component via props
	return {
	  props,
	}
}