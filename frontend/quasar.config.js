// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'

export default defineConfig((/* ctx */) => {
  return {
    boot: [],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'hash',

      env: {
        API_URL: process.env.VITE_API_URL || 'https://quit-smoking-api-zr94.onrender.com/api',
      },
      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {},
      plugins: [
        'Dialog',
        'Notify',
        'LocalStorage',
      ],
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: [
        'render',
      ],
      pwa: false,
    },

    // ✅ PWA Configuration
    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,

      workboxOptions: {
        skipWaiting: true,             // ← auto-update service worker
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/quit-smoking-api-zr94\.onrender\.com\/api/,
            handler: 'NetworkFirst',   // ← try network first, fallback to cache
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,    // ← cache API responses for 5 mins
              },
            },
          },
        ],
      },

      manifest: {
        name: 'Quit Smoking App',
        short_name: 'QuitSmoke',
        description: 'Your quit smoking companion',
        display: 'standalone',         // ← feels like a real app, no browser UI
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1976D2',        // ← Quasar default blue, change if needed
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'quit-smoking-app',
      },
    },

    bex: {
      extraScripts: [],
    },
  }
})