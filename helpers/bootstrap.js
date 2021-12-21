const getSitemapLinks = require(`sitemap-links`)
const axios = require(`axios`)
const cheerio = require(`cheerio`)
const { outputFile, outputJson, remove } = require(`fs-extra`)
const config = require(`../exolayer.config`)
const assetDomains = require(`./asset-domains`)

const dist = `.exolayer`

// Remove trailing slash from site
let site = config.site
while(site[site.length - 1] === `/`){
	site = site.slice(0, -1)
}

async function clean(){
	console.log(`Cleaning...`)
	await Promise.all([
		remove(dist),
		remove(`public/exolayer.js`),
		remove(`public/sitemap.xml`),
	])
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
	if(!crawled.length){
		console.log(`Getting all links...`)
	}
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
	if(htmlAttributes.class){
		htmlAttributes.className = htmlAttributes.class
		delete htmlAttributes.class
	}
	delete htmlAttributes[`data-wf-domain`]
	const bodyAttributes = $('body').attr()
	if(bodyAttributes.class){
		bodyAttributes.className = bodyAttributes.class
		delete bodyAttributes.class
	}
	const metaData = {
		htmlAttributes,
		bodyAttributes,
	}
	await outputJson(`${dist}/meta.json`, metaData, { spaces: 2 })
}

async function fetchCss($){
	console.log(`Fetching CSS...`)
	const $styles = $('link[rel="stylesheet"]')
	let cssUrl
	$styles.each((i, el) => {
		const href = $(el).attr(`href`)
		if(!href) return
		const parsed = new URL(href)
		const ext = parsed.pathname.split(`.`).pop()
		if(assetDomains.indexOf(parsed.host) !== -1 && ext === `css`){
			cssUrl = href
		}
	})
	if(cssUrl){
		const filepath = `${dist}/styles.css`
		const response = await axios.get(cssUrl)
		await outputFile(filepath, response.data)
	}
}

async function fetchJs($){
	console.log(`Fetching JS...`)
	const $scripts = $('script')
	let jsUrl
	$scripts.each((i, el) => {
		const src = $(el).attr(`src`)
		if(!src) return
		const parsed = new URL(src)
		const ext = parsed.pathname.split(`.`).pop()
		if(assetDomains.indexOf(parsed.host) !== -1 && ext === `js`){
			jsUrl = src
		}
	})
	if(jsUrl){
		const filepath = `public/exolayer.js`
		const response = await axios.get(jsUrl)
		let data = response.data
		if(config.removeBranding){

			console.log(`Removing Webflow branding...`)
			const oldStr = `(e=e||(n=t('<a class="w-webflow-badge"></a>')`
			const newStr = `(true||(n=t('<a class="w-webflow-badge"></a>')`
			const fullOldStr = `var shouldBrand = $html.attr('data-wf-status');`
			const fullNewStr = `var shouldBrand = false;`
			let replaced = false

			if(data.indexOf(oldStr) > -1){
				console.log(`Replacing Webflow branding...`)
				data = data.replace(oldStr, newStr)
				replaced = true
			}
			if(data.indexOf(fullOldStr) > -1){
				console.log(`Replacing Webflow branding...`)
				data = data.replace(fullOldStr, fullNewStr)
				data = data.replace(`shouldBrand = true;`, `shouldBrand = false;`)
				replaced = true
			}
			if(!replaced){
				console.log(`No Webflow branding to replace...`)
			}
		}
		await outputFile(filepath, data)
	}
}

async function bootstrap(){
	await clean()
	await createPageList()
	const $ = await fetchHomepage()
	await createMetaData($)
	await fetchCss($)
	await fetchJs($)
}

bootstrap().catch(err => {
	console.error(err)
	process.exit(1)
})