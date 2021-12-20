import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { useRouter } from 'next/router'
import parseHtml, { domToReact } from 'html-react-parser'
import get from 'lodash/get'
import React from 'react'
import containsAssetDomain from '../helpers/contains-asset-domain'
import fetchWebflowPage from '../helpers/fetch-webflow-page'
import polymorphConfig from '../polymorph.json'
import pageList from '../helpers/polymorph/page-list.json'


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
function createReplace({ placement, url }){
  return function replace(node){
    const attribs = node.attribs || {}
  
    // Replace links with Next links
    if(polymorphConfig.clientSideRouting && node.name === `a` && isUrlInternal(attribs.href)){
      let { href, style, ...props } = attribs
      if(props.class){
        props.className = props.class
        delete props.class
      }
      if(href.indexOf(`?`) === 0){
        href = url + href
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
  
  
    // Better loading for scripts, but can change the order they're loaded in at
    if(node.name === `script`){

      if(polymorphConfig.optimizeJsLoading){
        if(placement === `body`){
          if(attribs.src){
            if(containsAssetDomain(attribs.src)){
              return (
                <Script src='/polymorph/scripts.js' />
              )
            }
            if(attribs.src.indexOf(`jquery`) > -1 && attribs.src.indexOf(`site=`) > -1){
              return null
            }
            return (
              <Script {...attribs}></Script>
            )
          }
          let content = get(node, `children.0.data`, ``)
          return(
            <Script {...attribs} dangerouslySetInnerHTML={{__html: content}}></Script>
          )
          
        }
      }
      else if(attribs.src){
        if(containsAssetDomain(attribs.src)){
          return (
            <script src='/polymorph/scripts.js' />
          )
        }
        if(attribs.src.indexOf(`jquery`) > -1 && attribs.src.indexOf(`site=`) > -1){
          return null
        }
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



export default function WebflowPage(props) {
  const [options, setOptions] = useState({})
  const router = useRouter()
  
  useEffect(() => {
    setOptions({
      head: createReplace({
        placement: `head`,
        url: props.url,
      }),
      body: createReplace({
        placement: `body`,
        url: props.url,
      }),
    })
  }, [props.url])

  return (
    <>
      <Head>
        {parseHtml(props.headContent, options.head)}
      </Head>
      {parseHtml(props.bodyContent, options.body)}
    </>
  )
}

export async function getStaticProps(ctx) {
  console.log(`ctx`, ctx)

  // Use path to determine Webflow path
  let url = get(ctx, `params.path`, [])
  const originalLink = get(ctx, `params.originalLink`)
  console.log(`originalLink`, originalLink)
  url = url.join(`/`)
  if(url.charAt(0) !== `/`){
    url = `/${url}`
  }
  let webflowUrl = polymorphConfig.site
  if(webflowUrl.charAt(webflowUrl.length - 1) === `/`){
    webflowUrl = webflowUrl.slice(0, -1)
  }

  // If not in page list, it's probably a paginated link that needs to be reassembled
  if(pageList.indexOf(url) === -1){
    url = url.split(`/`)
    const pageNumber = url.pop()
    const paramName = url.pop()
    url = url.join(`/`)
    url = `${url}?${paramName}=${pageNumber}`
  }
  url = webflowUrl + url

  const props = await fetchWebflowPage({ url })

  // Send HTML to component via props
  return {
    props,
    revalidate: false,
  }
}