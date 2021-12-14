import { useEffect } from 'react'
import Head from "next/head"
import Script from 'next/script'
import { useRouter } from 'next/router'
import '../styles/ui.css' // Webflow CSS

// Close nav buttons when route change starts
function routeChangeStartHandler(){
  const els = document.querySelectorAll(`.w-nav-button.w--open`)
  for(let el of els){
    el.click()
  }
}

// Attach Webflow events when route has changed
function routeChangeHandler(){
  if(window.Webflow){
    window.Webflow.ready()
  }
}

export default function App(props) {
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
    </Head>

    <Component {...pageProps} />

    {/* Webflow JS */}
    <Script src='/ui/scripts.js' defer />
  </>
}