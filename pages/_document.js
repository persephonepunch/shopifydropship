import Document, { Html, Head, Main, NextScript } from 'next/document'
import meta from '../.design-sync/meta.json'

const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang='en' {...meta.htmlAttributes}>
        <Head>
          {!!gaId && <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>}
          <style dangerouslySetInnerHTML={{ __html: `html{scroll-behavior: smooth}` }} />
        </Head>
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