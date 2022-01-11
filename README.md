<p align="center">
	<img src="https://res.cloudinary.com/smarterlabs/image/upload/v1641926311/design-sync/logo.svg#gh-light-mode-only" alt="DesignSync.js" width="400" />
	<img src="https://res.cloudinary.com/smarterlabs/image/upload/v1641928102/design-sync/logo-white.svg#gh-dark-mode-only" alt="DesignSync.js" width="400" />
</p>
<p align="center">
	<img src="https://res.cloudinary.com/smarterlabs/image/upload/v1641926314/design-sync/next-webflow.svg#gh-light-mode-only" alt="Next.js Webflow" width="300" />
	<img src="https://res.cloudinary.com/smarterlabs/image/upload/v1641928102/design-sync/next-webflow-white.svg#gh-dark-mode-only" alt="Next.js Webflow" width="300" />
</p>

DesignSync.js is a Next.js template that instantly imports and converts any Webflow site to React. You can use DesignSync.js to give your designers full control of your Next.js site. Skip weeks of frontend development time on every Next.js project.

## Requirements
- A live Webflow site
- Node.js 16.x or higher

## Quickstart

First, add your site to the `/design-sync/config.js` file. It should look something like this:

```js
module.exports = {
  site: `https://your-site.webflow.io/`,
  removeBranding: true,
  clientRouting: true,
  optimizeImages: true,
  optimizeJsLoading: true,
  staticPageLimit: 200,
  revalidate: false,
}
```

Then run the `bootstrap` npm script to import your site.

```bash
npm run bootstrap
# or
yarn bootstrap
```

After your site is done importing, start up a live development server with:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If your Webflow site changes, you can run the `bootstrap` npm script again to re-sync the Webflow content with your Next.js project.

You can add Next.js [pages](https://nextjs.org/docs/basic-features/pages) or [API routes](https://nextjs.org/docs/api-routes/introduction) as you normally would with any other Next.js project. DesignSync.js will only display the Webflow page if there's not already a Next.js page for that route.

## Deploy to Vercel

The easiest way to deploy your Next.js app is to deploy to [Vercel](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Configuration

Your DesignSync.js project can be configured in the `/design-sync/config.js` file.

| Name                | Description                                                                                                                 | Default     |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------|-------------|
| `site`              | The base URL of your Webflow site.                                                                                          | `undefined` |
| `clientRouting`     | Converts links to use [next/link](https://nextjs.org/docs/api-reference/next/link) for faster, client-side routing.                                                          | `true`      |
| `optimizeImages`    | Converts images to use [next/image](https://nextjs.org/docs/api-reference/next/image) for image optimizations.                                                                | `true`      |
| `optimizeJsLoading` | Converts scripts to defer loading, and use [next/script](https://nextjs.org/docs/basic-features/script) for load optimization.                                             | `true`      |
| `removeBranding`    | Removes Webflow branding.                                                                                                   | `true`      |
| `staticPageLimit`   | Sets how many pages will be staticly prerendered before using [ISR](https://vercel.com/docs/concepts/next.js/incremental-static-regeneration).                                                          | `200`         |
| `revalidate`        | How many seconds before fetching the Webflow page again on load. Set to `false` to keep the page cached until next rebuild. | `false`     |