import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as ga from '../helpers/google-analytics'
import '../.design-sync/styles.css'

const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS

function App(props) {
  const { Component, pageProps } = props
  const router = useRouter()

  useEffect(() => {
    if(!gaId) return
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on('routeChangeComplete', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <Component {...pageProps} />
  )
}

export default App
