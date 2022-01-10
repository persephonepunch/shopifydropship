import Document, { Html, Head, Main, NextScript } from 'next/document'
import meta from '../.exolayer/meta.json'
// import Script from 'next/script'
// import config from '../exolayer.config.json'

// console.log(`config.optimizeJsLoading`, config.optimizeJsLoading)

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang='en' {...meta.htmlAttributes}>
        <Head />
        <body {...meta.bodyAttributes}>
          <Main />
          <NextScript />
          <script src='/exolayer.js' defer></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument