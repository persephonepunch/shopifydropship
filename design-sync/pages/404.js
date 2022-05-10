import Page404 from './dynamic'
import fetchWebflowPage from '../helpers/fetch-webflow-page'

export default Page404

export async function getStaticProps(ctx) {
	const props = await fetchWebflowPage({ url: `/404`, ignoreError: true })

	// Send HTML to component via props
	return {
		props,
	}
}