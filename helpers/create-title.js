const siteTitle = 'Polymorph'
const delimiter = ' | '

export default function createTitle(title) {
  return title ? `${title}${delimiter}${siteTitle}` : siteTitle
}