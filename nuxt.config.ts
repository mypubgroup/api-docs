import { fileURLToPath } from 'node:url'

import openApiDocument from './openapi.json'

const linkColor = '#80cff5'
const webWorkerBrowserShim = fileURLToPath(new URL(
  './node_modules/web-worker/src/browser/index.js',
  import.meta.url,
))
const workerShimPackages = [
  'web-worker',
  'make-asynchronous',
  'super-regex',
  'is-identifier',
  'stringify-object',
  '@scalar/snippetz',
  '@scalar/api-client',
  '@scalar/api-reference',
]

const scalarCustomCss = String.raw`
:root {
  --fmp-link: ${linkColor};
  --fmp-font: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.light-mode,
.dark-mode {
  --scalar-font: var(--fmp-font);
  --scalar-color-accent: var(--fmp-link);
  --scalar-background-accent: rgba(128, 207, 245, 0.16);
  --scalar-text-decoration: none;
  --scalar-text-decoration-hover: underline;
}

.light-mode {
  --scalar-color-blue: #258fc3;
}

.dark-mode {
  --scalar-color-blue: var(--fmp-link);
}

a {
  color: var(--scalar-color-accent);
}
`

export default defineNuxtConfig({
  ssr: true,
  alias: {
    'web-worker': webWorkerBrowserShim,
  },
  modules: ['@scalar/nuxt'],
  css: ['~~/assets/custom.css'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/api-docs/',
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700&display=swap',
        },
      ],
    },
  },
  scalar: {
    content: openApiDocument,
    customCss: scalarCustomCss,
    darkMode: false,
    layout: 'default',
    metaData: {
      title: 'FindMyPub API',
      description: 'The latest documentation for the FindMyPub REST API.',
      ogTitle: 'FindMyPub API',
      ogDescription: 'The latest documentation for the FindMyPub REST API.',
    },
    pathRouting: {
      basePath: '/',
    },
    showSidebar: true,
    theme: 'default',
    withDefaultFonts: false,
  },
  nitro: {
    alias: {
      'web-worker': webWorkerBrowserShim,
    },
    externals: {
      inline: workerShimPackages,
    },
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },
  vite: {
    resolve: {
      alias: {
        'web-worker': webWorkerBrowserShim,
      },
    },
    ssr: {
      noExternal: workerShimPackages,
    },
  },
})
