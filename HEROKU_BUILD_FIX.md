# Heroku Build Error Fix - Summary

## Problem

During Heroku deployment, the Nuxt build was failing with this error:

```
ERROR  Strapi API Error (global-setting): connect ECONNREFUSED 127.0.0.1:1337
ERROR  Failed to fetch global settings: Failed to fetch from Strapi
```

**Root Cause:** Nuxt was attempting to prerender pages at build time, which required connecting to Strapi. Since Strapi wasn't running during the Heroku build process (frontend and backend are separate apps), the build failed.

## Solution Applied

### 1. Made Prerendering Conditional (`nuxt.config.ts`)

Changed routes from always prerendering to conditional based on `ENABLE_PRERENDER` environment variable:

```typescript
// Before:
"/": { prerender: true },

// After:
"/": process.env.ENABLE_PRERENDER === "true" 
  ? { prerender: true } 
  : { isr: 3600 },
```

### 2. Configured Nitro to Fail Gracefully

Added prerender configuration to prevent build failures:

```typescript
nitro: {
  prerender: {
    failOnError: false,      // Don't stop build on errors
    crawlLinks: false,       // Don't crawl links to find more pages
    ignore: ['/checkout', '/cart', '/api'],
  }
}
```

### 3. Updated Environment Variables

Added `ENABLE_PRERENDER` variable to control prerendering:

```bash
# For Heroku (don't set or set to false)
ENABLE_PRERENDER=false

# For local/Docker (when Strapi is available)
ENABLE_PRERENDER=true
```

## How It Works Now

### On Heroku (Separate Apps)
1. Build runs without connecting to Strapi
2. Pages use ISR (Incremental Static Regeneration) mode
3. First request to each page:
   - Fetches data from Strapi runtime
   - Renders the page
   - Caches for 1 hour
4. Subsequent requests serve from cache

### On Docker/VPS (Same Network)
1. Can optionally enable `ENABLE_PRERENDER=true`
2. Pages are fully prerendered at build time
3. All requests serve pre-built static HTML
4. No runtime Strapi calls for static pages

## Files Modified

1. **`nuxt-frontend/nuxt.config.ts`**
   - Made prerendering conditional
   - Added `failOnError: false` to Nitro config
   - Disabled link crawling during build
   - Removed duplicate CSS declaration

2. **`nuxt-frontend/.env.heroku.example`**
   - Added `ENABLE_PRERENDER` variable documentation
   - Added explanation of when to use it

3. **`nuxt-frontend/HEROKU_BUILD.md`** (New)
   - Complete documentation of the issue
   - Explanation of both deployment modes
   - Troubleshooting guide
   - Performance comparison

## Testing

Build now succeeds without Strapi running:

```bash
cd nuxt-frontend
yarn build  # Completes successfully
```

## Deployment Instructions

### For Heroku

No additional configuration needed! Just deploy:

```bash
git push heroku-frontend master
```

The frontend will build successfully and use ISR mode.

### For Docker Compose

Add to docker-compose.yml if you want prerendering:

```yaml
nuxt:
  environment:
    - ENABLE_PRERENDER=true
```

### For PM2/VPS

Add to .env if you want prerendering:

```bash
ENABLE_PRERENDER=true
```

## Performance Impact

### ISR Mode (Heroku Default)
- ✅ Build succeeds without Strapi
- ✅ Dynamic content updates automatically
- ⚠️ First request per page slightly slower (~500ms)
- ✅ Cached requests very fast (~50ms)

### Prerender Mode (Optional)
- ✅ All requests very fast (~50ms)
- ⚠️ Requires Strapi during build
- ⚠️ Need rebuild to update content

## Recommendation

**For Production on Heroku:** Use ISR mode (default)
- Easier deployment
- Automatic content updates
- No build-time dependencies

**For High-Traffic Sites:** Consider prerendering
- Slightly better performance
- Lower server load
- But requires more complex deployment

## Next Steps

1. ✅ Configuration updated
2. ✅ Documentation added
3. ⏳ Test deployment on Heroku
4. ⏳ Monitor first-request performance
5. ⏳ Consider cache warming script if needed

## Support

See `nuxt-frontend/HEROKU_BUILD.md` for detailed documentation.
