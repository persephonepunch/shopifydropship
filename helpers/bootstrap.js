const getSitemapLinks = require(`sitemap-links`)
const axios = require(`axios`)
const cheerio = require(`cheerio`)
const UglifyJS = require("uglify-js")
const { outputFile, outputJson, remove } = require(`fs-extra`)
const config = require(`../exolayer.config.json`)

// Default Webflow CDNs
const assetDomains = [
	`assets.website-files.com`,
	`assets-global.website-files.com`,
	`uploads-ssl.webflow.com`,
	`global-uploads.webflow.com`,
]

const dist = `.exolayer`

// console.log(`config`, config)

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

async function getAllLinks(queue = [], crawled = [], links = [], excludeFromSitemap = []){
	if(!crawled.length){
		console.log(`Getting all links...`)
	}
	if(!queue.length){
		return {
			links,
			excludeFromSitemap,
		}
	}
	const totalCrawled = crawled.length
	const total = totalCrawled + queue.length
	console.log(`${totalCrawled} / ${total} crawled...`)

	const url = queue.shift()
	console.log(`Fetching ${url}...`)
	const html = await axios.get(url).catch(err => {
		console.log(`Error getting ${url}`, err)
	})
	if(html){
		const $ = cheerio.load(html.data)
		const $body = $('body')
		const sitemapAttr = $body.attr(`sitemap`) || $body.attr(`data-sitemap`)
		if(sitemapAttr === `false` || sitemapAttr === `no`){
			const urlPath = url.replace(site, ``)
			if(excludeFromSitemap.indexOf(urlPath) === -1){
				excludeFromSitemap.push(urlPath)
			}
		}
		const linksOnPage = $('a').map((i, el) => $(el).attr('href')).get()
		for(let link of linksOnPage){
			// For paginated links
			if(link.startsWith(`?`)){
				link = `${url.split(`?`)[0]}${link}`
			}
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
	return getAllLinks(queue, crawled, links, excludeFromSitemap)
}

async function createPageList(){
	console.log(`Creating page list from Webflow site...`)

	const sitemapUrl = `${site}/sitemap.xml`
	const sitemapLinks = await getSitemapLinks(sitemapUrl)
	const allLinks = await getAllLinks([`${site}/`])
	const crawlLinks = allLinks.links
	const excludeFromSitemap = allLinks.excludeFromSitemap
	
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
	await outputJson(`${dist}/exclude-from-sitemap.json`, excludeFromSitemap, { spaces: 2 })
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

async function fetchCss($, assetDomains){
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

async function fetchJs($, assetDomains){
	console.log(`Fetching JS...`)
	const $scripts = $('script')
	let jsUrl
	let jqueryUrl
	$scripts.each((i, el) => {
		const src = $(el).attr(`src`)
		if(!src) return
		const parsed = new URL(src)
		const ext = parsed.pathname.split(`.`).pop()
		if(assetDomains.indexOf(parsed.host) !== -1 && ext === `js`){
			jsUrl = src
		}
		if(parsed.pathname.indexOf(`/jquery-`) > -1){
			jqueryUrl = src
		}
	})
	if(jsUrl && jqueryUrl){

		const jqueryResponse = await axios.get(jqueryUrl)
		const jqueryData = jqueryResponse.data

		const filepath = `public/exolayer.js`
		const response = await axios.get(jsUrl)
		let data = jqueryData + `\n\n` + response.data


		// Create init function
		const initStr = /Webflow.require\('ix2'\).init\(\n(.*)\n\);/
		const dataTest = initStr.test(data)
		if(dataTest){
			console.log(`Adding init function...`)
			data = data.replace(initStr, [
				`window.webflowInit = function(){`,
				`\tconsole.log('Webflow init');`,
				`\tWebflow.require('ix2').init($1);`,
				`};`,
			].join(`\n`))
			data = data.replace(initStr, `window.webflowInit = function(){ Webflow.require('ix2').init($1) };\nwindow.webflowInit();`)
			// process.exit(0)
		}
		else{
			console.error(`Can't find init function.`)
			process.exit(1)
		}

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

		// console.log(`Minifying JS...`)
		data = UglifyJS.minify(data).code

		await outputFile(filepath, data)
	}
}

async function generateAssetDomains($){
	// Find asset domain from favicon URL
	const faviconEl = $('link').filter((i, el) => {
		return $(el).attr(`rel`).trim().split(` `).indexOf(`icon`) > -1
	})
	const faviconUrl = faviconEl.attr(`href`)
	const parsed = new URL(faviconUrl)
	const domain = parsed.hostname
	if(assetDomains.indexOf(domain) === -1){
		assetDomains.push(domain)
	}
	await outputJson(`${dist}/asset-domains.json`, assetDomains, { spaces: 2 })
	return assetDomains
}

async function bootstrap(){
	await clean()
	await createPageList()
	const $ = await fetchHomepage()
	await createMetaData($)
	const assetDomains = await generateAssetDomains($)
	await fetchCss($, assetDomains)
	await fetchJs($, assetDomains)
}

bootstrap().catch(err => {
	console.error(err)
	process.exit(1)
})