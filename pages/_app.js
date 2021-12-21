import { useEffect } from 'react'
import { useRouter } from 'next/router'
import '../.exolayer/styles.css'

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


  return (
    <Component {...pageProps} />
  )
}

export default App
