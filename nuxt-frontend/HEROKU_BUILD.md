# Nuxt Frontend - Build Configuration for Heroku

## Prerendering Issue on Heroku

When deploying to Heroku, the Nuxt build process tries to prerender static pages, which requires fetching data from Strapi. However, during the build phase, the Strapi backend isn't running, causing the build to fail with:

```
ERROR  Strapi API Error (global-setting): connect ECONNREFUSED 127.0.0.1:1337
```

## Solution

The configuration has been updated to handle this gracefully:

### 1. Conditional Prerendering

Routes are now configured to only prerender when `ENABLE_PRERENDER=true` is set:

```typescript
// nuxt.config.ts
routeRules: {
  "/": process.env.ENABLE_PRERENDER === "true" 
    ? { prerender: true } 
    : { isr: 3600 },
  // ...
}
```

### 2. Graceful Failure

Nitro is configured to not fail the build if prerendering fails:

```typescript
nitro: {
  prerender: {
    failOnError: false,      // Don't fail build on prerender errors
    crawlLinks: false,       // Don't crawl links during build
    ignore: ['/checkout', '/cart', '/api'],
  }
}
```

## Deployment Modes

### Mode 1: Without Prerendering (Default for Heroku)

All pages use ISR (Incremental Static Regeneration) - rendered on first request and cached.

**Heroku Config:**
```bash
# Don't set ENABLE_PRERENDER or set it to false
heroku config:set ENABLE_PRERENDER=false --app carafe-frontend
```

**Benefits:**
- Build succeeds without Strapi connection
- Pages are cached after first request
- Content updates automatically after cache expiry

### Mode 2: With Prerendering (for Full Stack Deployments)

Pages are prerendered at build time when Strapi is available.

**Local/Docker Config:**
```bash
# Set in .env
ENABLE_PRERENDER=true
```

**Benefits:**
- Instant page loads (no server processing)
- Better SEO (fully pre-rendered HTML)
- Lower server load

**Requirements:**
- Strapi must be running during build
- Both services must be on same network/machine

## Environment Variables

### Required for Heroku
```bash
NODE_ENV=production
NUXT_PUBLIC_SITE_URL=https://carafe-frontend.herokuapp.com
NUXT_PUBLIC_STRAPI_URL=https://carafe-strapi.herokuapp.com
STRAPI_API_TOKEN=your_token
```

### Optional Build Config
```bash
# Only set to "true" if Strapi is available during build
ENABLE_PRERENDER=false
```

## Build Process

### Heroku Build
1. `yarn install` - Install dependencies
2. `yarn build` - Build Nuxt app
   - Tries to prerender (fails gracefully)
   - Uses ISR mode instead
3. Build succeeds, app is ready to deploy

### Local Build (with Strapi)
1. Start Strapi: `cd strapi-backend && yarn develop`
2. Build Nuxt: `cd nuxt-frontend && ENABLE_PRERENDER=true yarn build`
3. Pages are prerendered with data from Strapi

## Troubleshooting

### Build Fails with Connection Error

**Problem:** Nuxt can't connect to Strapi during build

**Solutions:**
1. Ensure `ENABLE_PRERENDER` is not set (or set to `false`)
2. Check `nuxt.config.ts` has `failOnError: false`
3. Verify routes use conditional prerendering

### Pages Load Slowly on First Request

**Expected Behavior:** With ISR mode, the first request to each page will:
1. Fetch data from Strapi
2. Render the page
3. Cache the result

Subsequent requests serve from cache until expiry (1 hour by default).

### Want Faster First Load

**Options:**
1. **After deployment:** Visit key pages to warm the cache
2. **Use a cache-warming script:** Hit all important routes after deployment
3. **Enable prerendering:** Only if you can run both services during build

## Performance Notes

### ISR Mode (Current Default)
- **First request:** ~500-1000ms (fetches from Strapi)
- **Cached requests:** ~50-100ms (serves from cache)
- **Cache duration:** 1 hour (configurable)

### Prerendered Mode
- **All requests:** ~50-100ms (serves pre-built HTML)
- **No runtime Strapi calls** for static pages
- **Requires rebuild** to update content

## Recommended Setup

For Heroku (separate apps):
```bash
ENABLE_PRERENDER=false  # Use ISR mode
```

For Docker Compose (same network):
```bash
ENABLE_PRERENDER=true   # Use prerendering
```

For VPS (PM2, both services running):
```bash
ENABLE_PRERENDER=true   # Use prerendering
```

## Related Files

- `nuxt.config.ts` - Main configuration
- `.env.heroku.example` - Heroku environment variables
- `nuxt-frontend/README.md` - This file
