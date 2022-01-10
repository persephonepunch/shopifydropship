import Document, { Html, Head, Main, NextScript } from 'next/document'
import meta from '../.design-sync/meta.json'

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
          <script src='/design-sync.js' defer></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument