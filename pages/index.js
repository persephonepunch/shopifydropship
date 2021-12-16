import Head from 'next/head'
import Link from 'next/link'
import parseHtml, { domToReact } from 'html-react-parser'
import get from 'lodash/get'
import React from 'react'
import fetchWebflowPage from '@smarterlabs/polymorph/build/fetch-webflow-page'
import polymorphConfig from '../polymorph.json'

// Determines if URL is internal or external
function isUrlInternal(link){
  if(
    !link ||
    link.indexOf(`https:`) === 0 ||
    link.indexOf(`#`) === 0 ||
    link.indexOf(`http`) === 0 ||
    link.indexOf(`://`) === 0
  ){
    return false
  }
  return true
}

// Replaces DOM nodes with React components
function replace(node){
  const attribs = node.attribs || {}

  // Replace links with Next links
  if(node.name === `a` && isUrlInternal(attribs.href)){
    const { href, style, ...props } = attribs
    if(props.class){
      props.className = props.class
      delete props.class
    }
    if(!style){
      return (
        <Link href={href}>
          <a {...props}>
            {!!node.children && !!node.children.length &&
              domToReact(node.children, parseOptions)
            }
          </a>
        </Link>
      )
    }
    return (
      <Link href={href}>
        <a {...props} href={href} css={style}>
          {!!node.children && !!node.children.length &&
            domToReact(node.children, parseOptions)
          }
        </a>
      </Link>
    )
  }


  // Make Google Fonts scripts work
  if(node.name === `script`){
    let content = get(node, `children.0.data`, ``)
    if(content && content.trim().indexOf(`WebFont.load(`) === 0){
      content = `setTimeout(function(){${content}}, 1)`
      return (
        <script {...attribs} dangerouslySetInnerHTML={{__html: content}}></script>
      )
    }
  }

}
const parseOptions = { replace }

export default function Home(props) {
  return (
    <>
      <Head>
        {parseHtml(props.headContent, parseOptions)}
      </Head>
      {parseHtml(props.bodyContent, parseOptions)}
    </>
  )
}

export async function getStaticProps(ctx) {

  // Use path to determine Webflow path
  let url = get(ctx, `params.path`, [])
  url = url.join(`/`)
  if(url.charAt(0) !== `/`){
    url = `/${url}`
  }
  let webflowUrl = polymorphConfig.site
  if(webflowUrl.charAt(webflowUrl.length - 1) === `/`){
    webflowUrl = webflowUrl.slice(0, -1)
  }
  url = webflowUrl + url

  const props = await fetchWebflowPage({ url })

  // Send HTML to component via props
  return { props }
}