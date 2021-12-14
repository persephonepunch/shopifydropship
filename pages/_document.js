import Document, { Html, Head, Main, NextScript } from 'next/document'
import meta from '../helpers/ui-meta.json' // Contains HTML attributes necessary for Webflow JS to run

export default class MyDocument extends Document {
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
        </body>
      </Html>
    )
  }
}