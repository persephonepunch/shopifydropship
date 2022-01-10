import { useEffect } from 'react'
import { useRouter } from 'next/router'
import '../.design-sync/styles.css'

function routeChangeStartHandler(){
  // Close nav buttons
  const els = document.querySelectorAll(`.w-nav-button.w--open`)
  for(let el of els){
    el.click()
  }
}

function App(props) {
  const { Component, pageProps } = props
  const router = useRouter()
  useEffect(() => {
    router.events.on('routeChangeStart', routeChangeStartHandler)
    return () => {
      router.events.off('routeChangeStart', routeChangeStartHandler)
  }
  }, [])

  return (
    <Component {...pageProps} />
  )
}

export default App
