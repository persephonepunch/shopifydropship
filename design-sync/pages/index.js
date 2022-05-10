import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import parseHtml, { domToReact } from 'html-react-parser'
import get from 'lodash/get'
import React from 'react'
import containsAssetDomain from '../helpers/contains-asset-domain'
import fetchWebflowPage from '../helpers/fetch-webflow-page'
import config from '../config'
import userReplacer from '../replace'

// Determines if URL is internal or external
function isUrlInternal(link){
  if(
    !link ||
    link.indexOf(`https:`) === 0 ||
    link.indexOf(`#`) === 0 ||
    link.indexOf(`http`) === 0 ||
    link.indexOf(`://`) === 0 ||
    link.indexOf(`:`) !== -1
  ){
    return false
  }
  return true
}

// Replaces DOM nodes with React components
function createReplace({ placement, url }){
  return function replace(node){

    if(!node.attribs) node.attribs = {}

    const userReplacerResponse = userReplacer(node)
    if(userReplacerResponse){
      return userReplacerResponse
    }

    const attribs = node.attribs || {}
    if(attribs.class){
      attribs.className = attribs.class
      delete attribs.class
    }
  
    // Replace links with Next links
    if(node.name === `a`){
      const isInternal = isUrlInternal(attribs.href)
      if(config.clientRouting && isInternal && attribs.href.indexOf(`#`) === -1){
        let { href, style, ...props } = attribs
        if(props.class){
          props.className = props.class
          delete props.class
        }
        if(href.indexOf(`?`) === 0){
          href = url + href
        }
        // console.log(`Replacing link:`, href)
        if(!style){
          return (
            <Link href={href}>
              <a {...props}>
                {!!node.children && !!node.children.length &&
                  domToReact(node.children, {
                    replace: createReplace({ placement, url }),
                  })
                }
              </a>
            </Link>
          )
        }
        return (
          <Link href={href}>
            <a {...props} href={href} css={style}>
              {!!node.children && !!node.children.length &&
                domToReact(node.children, {
                  replace: createReplace({ placement, url }),
                })
              }
            </a>
          </Link>
        )
      }
    }
  
    // Remove this block for static pages since we can't use next/image
    if(node.name === `img` && config.optimizeImages && !attribs[`data-next-ignore`]){
      const { src, alt, style, ...props } = attribs

      // console.log(`src`, src)
      // console.log(`props`, props)
      if(props.class){
        props.className = props.class
        delete props.class
      }
      if(props.srcset){
        props.srcSet = props.srcset
        delete props.srcset
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
      else{
        return (
          <img
            // loading='lazy'
            {...props}
            src={src}
            alt={alt}
            width={props.width}
            height={props.height}
            css={style || undefined}
          />

        )
      }
    }


    // Change style attributes to css
    // if(attribs.style){
    //   const Tag = node.name
    //   const style = attribs.style
    //   delete attribs.style
    //   return (
    //     <Tag
    //       {...attribs}
    //       css={style}
    //     >
    //       {!!node.children && !!node.children.length &&
    //         domToReact(node.children, {
    //           replace: createReplace({ placement, url }),
    //         })
    //       }
    //     </Tag>
    //   )
    // }
  
  
    // Better loading for scripts, but can change the order they're loaded in at
    if(node.name === `script`){

      if(attribs.src){
        if(attribs.src.split(`/`).pop() === `webfont.js`){
          attribs.defer = true
        }
      }
      
      let content = get(node, `children.0.data`)
      if(content && content.trim().indexOf(`WebFont.load(`) === 0){
        content = [
          `;!function(){`,
            `if(window.loadedWebfonts) return;`,
            `window.loadedWebfonts = setInterval(function(){`,
              `if(window.WebFont){`,
                `clearInterval(window.loadedWebfonts);`,
                `window.loadedWebfonts = true;`,
                content,
              `};`,
            `}, 10);`,
          `}();`,
        ].join(``)
        if(config.optimizeJsLoading){
          return (
            <script {...attribs} dangerouslySetInnerHTML={{ __html: content }} defer />
          )
        }
        else{
          console.log(`content`, content)
          return (
            <script {...attribs} dangerouslySetInnerHTML={{ __html: content }} />
          )
        }
      }

      if(config.optimizeJsLoading){
        if(placement === `body`){
          if(attribs.src){
            if(containsAssetDomain(attribs.src)){
              return <div></div>
              // return (
              //   <Script {...attribs} />
              // )
            }
            if(attribs.src.indexOf(`jquery`) > -1 && attribs.src.indexOf(`site=`) > -1){
              return <div></div>
            }
            return (
              <Script {...attribs}></Script>
            )
          }
          return(
            <script {...attribs} dangerouslySetInnerHTML={{__html: content}}></script>
          )
          
        }
      }
      else if(attribs.src){
        if(containsAssetDomain(attribs.src)){
          return (
            <script src='/design-sync.js' />
          )
        }
        else{
          return(
            <script {...attribs}></script>
          )
        }
        // if(attribs.src.indexOf(`jquery`) > -1 && attribs.src.indexOf(`site=`) > -1){
        //   return null
        // }
      }
      else if(content){
        return (
          <script {...attribs} dangerouslySetInnerHTML={{ __html: content }}></script>
        )
      }
    }
  
  }
}

let firstLoad = false
let interval
let mountEvent
let unmountEvent

const progressiveRender = false

export default function WebflowPage(props) {
  const [bodyContent, setBodyContent] = useState(props.bodyContent)

  useEffect(() => {
    // For some reason if, sometimes if the page is rerendered, Webflow's JS removes some HTML
    // Delaying and using static HTML for a frame forces React to re-render everything, so Webflow's JS starts with fresh elements without events attached
    setBodyContent(null)
    if(!mountEvent){
      mountEvent = new Event(`pageMount`)
      unmountEvent = new Event(`pageUnmount`)
    }
    setTimeout(() => {
      setBodyContent(props.bodyContent)

      if(window.Webflow){
        if(firstLoad){
          console.log(`Webflow: Updating...`)
          window.Webflow.destroy();
          window.Webflow.ready();
          window.Webflow.require( 'ix2' ).init();
          document.dispatchEvent( new Event( 'readystatechange' ) );
          document.dispatchEvent(mountEvent)
        }
        else{
          console.log(`Webflow: Initializing...`)
          firstLoad = true
          window.webflowInit()
          window.Webflow.ready();
          document.dispatchEvent( new Event( 'readystatechange' ) );
          document.dispatchEvent(mountEvent)
        }
      }
      else if(!interval){
        interval = setInterval(() => {
          if(window.Webflow){
            clearInterval(interval)
            console.log(`Webflow: Initializing...`)
            firstLoad = true
            window.webflowInit()
            document.dispatchEvent( new Event( 'readystatechange' ) );
            document.dispatchEvent(mountEvent)
          }
        }, 100)
      }
    }, 1)
    return () => {
      document.dispatchEvent(unmountEvent)
    }
  }, [props.bodyContent])

  const headOptions = createReplace({
    placement: `head`,
    url: props.url,
  })
  const bodyOptions = createReplace({
    placement: `body`,
    url: props.url,
  })

  useEffect(() => {
    for(let attr in props.htmlAttributes){
      document.documentElement.setAttribute(attr, props.htmlAttributes[attr])
    }
    for(let attr in props.bodyAttributes){
      document.body.setAttribute(attr, props.bodyAttributes[attr])
    }
  }, [bodyContent])

  // console.log(`props`, JSON.stringify(props, null, 3))

  if(progressiveRender){
    return <>
      <Head>
        {parseHtml(props.headContent, { replace: headOptions })}
      </Head>
      {parseHtml(props.bodyContent, { replace: bodyOptions })}
    </>
  }
  
  return (
    <>
      <Head>
        {parseHtml(bodyContent ? props.headContent : props.noScriptsHead, { replace: headOptions })}
        <link rel="stylesheet" href="/design-sync.css" />
      </Head>
      {bodyContent ?
        parseHtml(bodyContent, { replace: bodyOptions }) :
        <div dangerouslySetInnerHTML={{ __html: props.noScriptsBody }} />
      }
    </>
  )
}

export async function getStaticProps(ctx) {
  // Use path to determine Webflow path
  let url = get(ctx, `params.path`, [`/`])
  url = url.join(`/`)

  const props = await fetchWebflowPage({ url })

  // Send HTML to component via props
  return {
    props,
    revalidate: config.revalidate || false,
  }
}