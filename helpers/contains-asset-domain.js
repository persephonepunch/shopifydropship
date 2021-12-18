const assetDomains = require(`./asset-domains`)

module.exports = function containsAssetDomain(str){
	for(let i = 0; i < assetDomains.length; i++){
		if(str.indexOf(assetDomains[i]) > -1){
			return true
		}
	}
	return false
}