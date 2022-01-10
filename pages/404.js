import DynamicPath from './z'
import fetchWebflowPage from '../design-sync/helpers/fetch-webflow-page'

export default DynamicPath

export async function getStaticProps(ctx) {
	const props = await fetchWebflowPage({ url: `/404`, ignoreError: true })

	// Send HTML to component via props
	return {
		props,
		// revalidate: false,
	}
}