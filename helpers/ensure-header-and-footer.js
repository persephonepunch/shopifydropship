const { exists, outputFile } = require('fs-extra')

const emptyComponentTemplate = `
import React from 'react'

export default function Empty() {
  return null
}
`.trim()

const ensureComponents = [
  `components/SiteHeader.js`,
  `components/SiteFooter.js`,
]

async function ensureHeaderAndFooter(){

  const componentsExist = await Promise.all(ensureComponents.map(async (component) => {
    return await exists(component)
  }))

  for(let i = 0; i < componentsExist.length; i++){
    if(!componentsExist[i]){
      const path = ensureComponents[i]
      console.log(`Creating empty "${path}"...`)
      await outputFile(path, emptyComponentTemplate)
    }
  }

}
ensureHeaderAndFooter().catch(err => {
  console.error(err)
  process.exit(1)
})