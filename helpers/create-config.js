const { outputJson } = require('fs-extra')
const config = require(`../exolayer.config.js`)

outputJson(`./exolayer.config.json`, config, { spaces: 2 }).catch(err => {
	console.error(err)
	process.exit(1)
})