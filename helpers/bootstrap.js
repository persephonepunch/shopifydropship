const getSitemapLinks = require(`sitemap-links`)
const axios = require(`axios`)
const cheerio = require(`cheerio`)
const { outputJson, remove } = require(`fs-extra`)
const config = require(`../exolayer.config`)

const dist = `.exolayer`

// Remove trailing slash from site
let site = config.site
while(site[site.length - 1] === `/`){
	site = site.slice(0, -1)
}

async function clean(){
	console.log(`Cleaning...`)
	await remove(dist)
}

async function fetchHomepage(){
	console.log(`Fetching site...`)
	const url = `${site}/`
	const html = await axios.get(url).catch(err => {
		throw err
	})
	const $ = cheerio.load(html.data)
	return $
}

async function getAllLinks(queue = [], crawled = [], links = []){
	console.log(`Getting all links...`)
	if(!queue.length){
		return links
	}
	const url = queue.shift()
	const html = await axios.get(url).catch(err => {
		console.log(`Error getting ${url}`, err)
	})
	if(html){
		const $ = cheerio.load(html.data)
		const linksOnPage = $('a').map((i, el) => $(el).attr('href')).get()
		for(let link of linksOnPage){
			if(link.startsWith(`#`)){
				continue
			}
			if(link.startsWith(`/`)){
				link = site + link
			}
			if(link.indexOf(site) === 0){
				if(queue.indexOf(link) === -1 && crawled.indexOf(link) === -1){
					queue.push(link)
				}
				if(links.indexOf(link) === -1){
					links.push(link)
				}
			}
		}
	}
	crawled.push(url)
	return getAllLinks(queue, crawled, links)
}

async function createPageList(){
	console.log(`Creating page list from Webflow site...`)
	const sitemapUrl = `${site}/sitemap.xml`
	console.log(`sitemapUrl`, sitemapUrl)
	const sitemapLinks = await getSitemapLinks(sitemapUrl)
	const crawlLinks = await getAllLinks([`${site}/`])
	
	const links = sitemapLinks.map(link => {
		// Remove domain from link
		const parsed = new URL(link)
		link = parsed.pathname + parsed.search
		return link
	})
	for(link of crawlLinks){
		// Remove domain from link
		const parsed = new URL(link)
		link = parsed.pathname + parsed.search
		if(links.indexOf(link) === -1){
			links.push(link)
		}
	}
	await outputJson(`${dist}/page-list.json`, links, { spaces: 2 })
}

async function createMetaData($){
	console.log(`Creating metadata...`)
	const htmlAttributes = $('html').attr()
	delete htmlAttributes[`data-wf-domain`]
	const metaData = {
		htmlAttributes,
		bodyAttributes: $(`body`).attr(),
	}
	await outputJson(`${dist}/meta.json`, metaData, { spaces: 2 })
}

async function bootstrap(){
	await clean()
	await createPageList()
	const $ = await fetchHomepage()
	await createMetaData($)
}

bootstrap().catch(err => {
	console.error(err)
	process.exit(1)
})