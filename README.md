<p align="center">
	<img src="https://res.cloudinary.com/smarterlabs/image/upload/v1641926311/design-sync/logo.svg" alt="DesignSync.js" width="400" />
</p>
<p align="center">
	<img src="https://res.cloudinary.com/smarterlabs/image/upload/v1641926314/design-sync/next-webflow.svg" alt="Next.js Webflow" width="300" />
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

## Troubleshooting

### Image Styles

Since [next/image](https://nextjs.org/docs/api-reference/next/image) needs to edit the image element, it may sometimes cause issues with image styles set up in Webflow. If you're experiencing issues with images, try disabling the `optimizeImages` option.

If you would just like to disable image optimization for one or a few images, you can add a custom attribute of `data-next-ignore="true"` to the image in Webflow, and DesignSync.js will not convert it to a next/image.

### Custom JavaScript

Since the Next.js router essentially operates like a single page application, it's important to make sure that your custom JavaScript is only loaded whenever the page renders. If you have JS that needs to be loaded on every page, you can wrap it in `pageMount` and `pageUnmount` events, depending on when you want it to run. For example:

```html
<script>
	// Runs every time a new page content is fully loaded in, after navigation
	document.addEventListener('pageMount', function(){
		// Your custom JS
		console.log('New page has fully loaded in!')
	})

	// Runs right before page content is going to be destroyed, on navigation
	document.addEventListener('pageUnmount', function(){
		// Your custom JS
		console.log('Old page is about to be removed...')
	})
</script>
```