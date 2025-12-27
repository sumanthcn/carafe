// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    strapiApiToken: process.env.STRAPI_API_TOKEN,
    worldpayMerchantCode: process.env.WORLDPAY_MERCHANT_CODE,
    worldpayXmlPassword: process.env.WORLDPAY_XML_PASSWORD,
    worldpayMacSecret: process.env.WORLDPAY_MAC_SECRET,

    // Public keys (exposed to client)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://carafe.coffee",
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
      siteName: "Carafe Coffee House & Roasters",
      siteDescription:
        "Artisan coffee roasted in the heart of Lewes. Shop our small-batch beans online or visit our café to experience the craft in person.",
    },
  },

  // Modules
  modules: [
    "@nuxt/image",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/ui",
  ],

  // Sitemap configuration
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
    defaults: {
      changefreq: "weekly",
      priority: 0.8,
    },
  },

  // Robots.txt configuration
  robots: {
    groups: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout/processing", "/_nuxt"],
      },
    ],
    sitemap: "/sitemap.xml",
  },

  // Image optimization
  image: {
    strapi: {
      baseURL: process.env.NUXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      productCard: {
        modifiers: {
          format: "webp",
          width: 400,
          height: 400,
          fit: "cover",
        },
      },
      productDetail: {
        modifiers: {
          format: "webp",
          width: 800,
          height: 800,
          fit: "contain",
        },
      },
      hero: {
        modifiers: {
          format: "webp",
          width: 1920,
          height: 1080,
          fit: "cover",
        },
      },
    },
  },

  // App configuration
  app: {
    head: {
      htmlAttrs: {
        lang: "en-GB",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap",
        },
      ],
    },
  },

  // Add Font Awesome CSS
  css: ['@fortawesome/fontawesome-svg-core/styles.css', '~/assets/scss/main.scss'],

  // Build configuration
  build: {
    transpile: [
      '@fortawesome/vue-fontawesome',
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-brands-svg-icons',
    ],
  },

  // SSR configuration
  ssr: true,

  // Route rules for SSG/ISR/SSR
  routeRules: {
    // Homepage - prerender at build time
    "/": { prerender: true },

    // Static pages - prerender
    "/about": { prerender: true },
    "/visit-cafe": { prerender: true },
    "/art-culture": { prerender: true },
    "/wholesale": { prerender: true },

    // Shop pages - ISR with revalidation
    "/shop/**": { isr: 3600 }, // 1 hour
    "/shop-coffee/**": { isr: 3600 },
    "/subscriptions/**": { isr: 3600 },

    // Checkout - SSR only, no caching
    "/checkout/**": { ssr: true, cache: false },
    "/cart": { ssr: true, cache: false },

    // API routes
    "/api/**": { cors: true },
  },

  // Nitro server configuration
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    },
    // Enable caching
    storage: {
      cache: {
        driver: "lruCache",
        max: 500,
      },
    },
  },

  // CSS
  css: ["~/assets/scss/main.scss"],

  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "~/assets/scss/_variables.scss";
            @import "~/assets/scss/_mixins.scss";
          `,
          quietDeps: true,
          logger: {
            warn: () => {},
          },
        },
      },
    },
  },

  // TypeScript - disable typeCheck since vue-tsc is not installed
  typescript: {
    strict: true,
    typeCheck: false,
  },

  compatibilityDate: "2024-12-23",
});
