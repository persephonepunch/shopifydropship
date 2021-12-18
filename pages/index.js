import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import parseHtml, { domToReact } from 'html-react-parser'
import get from 'lodash/get'
import React from 'react'
import containsAssetDomain from '../helpers/contains-asset-domain'
import fetchWebflowPage from '../helpers/fetch-webflow-page'
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
function createReplace(placement){
  return function replace(node){
    const attribs = node.attribs || {}
  
    // Replace links with Next links
    if(polymorphConfig.clientSideRouting && node.name === `a` && isUrlInternal(attribs.href)){
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
                domToReact(node.children, placement === `body` ? bodyOptions : headOptions)
              }
            </a>
          </Link>
        )
      }
      return (
        <Link href={href}>
          <a {...props} href={href} css={style}>
            {!!node.children && !!node.children.length &&
              domToReact(node.children, placement === `body` ? bodyOptions : headOptions)
            }
          </a>
        </Link>
      )
    }
  
    if(node.name === `img` && polymorphConfig.optimizeImages){
      const { src, alt, style, ...props } = attribs
      if(props.class){
        props.className = props.class
        delete props.class
      }
      if(props.width && props.height){
  
        if(!style){
          return (
            <Image
              {...props}
              src={src}
              alt={alt}
              width={props.width}
              height={props.height}
            />
          )
        }
        return (
          <Image
            {...props}
            src={src}
            alt={alt}
            width={props.width}
            height={props.height}
            css={style}
          />
        )
      }
    }
  
  
    // Make Google Fonts scripts work
    if(node.name === `script`){
      let content = get(node, `children.0.data`, ``)
      // if(content && content.trim().indexOf(`WebFont.load(`) === 0){
      //   content = `setTimeout(function(){${content}}, 1)`
      //   return (
      //     <script {...attribs} dangerouslySetInnerHTML={{__html: content}}></script>
      //   )
      // }
      // Get src
      if(placement === `body` && attribs.src){
        if(containsAssetDomain(attribs.src)){
          return (
            <Script src='/polymorph/scripts.js' />
          )
        }
        return (
          <Script {...attribs}></Script>
        )
      }
    }
  
  }
}
const headOptions = {
  replace: createReplace(`head`),
}
const bodyOptions = {
  replace: createReplace(`body`),
}



export default function Home(props) {
  return (
    <>
      <Head>
        {parseHtml(props.headContent, headOptions)}
      </Head>
      {parseHtml(props.bodyContent, bodyOptions)}
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
  return {
    props,
    revalidate: false,
  }
}