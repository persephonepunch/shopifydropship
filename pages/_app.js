import { useEffect } from 'react'
import Head from "next/head"
import Script from 'next/script'
import { useRouter } from 'next/router'
import SiteHeader from '../components/ui/SiteHeader'
import SiteFooter from '../components/ui/SiteFooter'
import '../styles/ui.css'

function routeChangeStartHandler(){
  // Close nav buttons
  const els = document.querySelectorAll(`.w-nav-button.w--open`)
  for(let el of els){
    el.click()
  }
}
function routeChangeHandler(){
  if(window.Webflow){
    window.Webflow.ready()
  }
}

function App(props) {
  const { Component, pageProps } = props
  const router = useRouter()

  useEffect(() => {

    router.events.on('routeChangeStart', routeChangeStartHandler)
    router.events.on('routeChangeComplete', routeChangeHandler)
    router.events.on('routeChangeError', routeChangeHandler)

    return () => {
      router.events.off('routeChangeStart', routeChangeStartHandler)
      router.events.off('routeChangeComplete', routeChangeHandler)
      router.events.off('routeChangeError', routeChangeHandler)
  };
  }, [])


  return <>
    <Head>
      <link href="/ui/icons/favicon.png" rel="shortcut icon" type="image/x-icon" />
      <link href="/ui/icons/webclip.png" rel="apple-touch-icon" />
      <meta name="description" content="Polymorph is a CLI tool for converting Webflow projects to UI libraries for various frameworks including React, Svelte, Vue.js, Shopify Liquid, Angular, SolidJS, Web Components, and JavaScript." />
    </Head>

    <SiteHeader />
    <Component {...pageProps} />
    <SiteFooter />
    <Script src='/ui/scripts.js' defer />
  </>
}

export default App
