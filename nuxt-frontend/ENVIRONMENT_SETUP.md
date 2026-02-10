# Environment Configuration Guide

This guide explains how to switch between local and production Strapi backend.

## Quick Switch Guide

### Option 1: Use Production Strapi (Current)
Your frontend will connect to: `https://admin.carafecoffee.co.uk`

**Current configuration in `.env`:**
```bash
NUXT_PUBLIC_STRAPI_URL=https://admin.carafecoffee.co.uk
# NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Option 2: Use Local Strapi
Your frontend will connect to: `http://localhost:1337`

**To switch to local Strapi:**

1. Open `nuxt-frontend/.env`
2. Comment the production line and uncomment the localhost line:
```bash
# NUXT_PUBLIC_STRAPI_URL=https://admin.carafecoffee.co.uk
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
```
3. Restart your Nuxt dev server (Ctrl+C and run `npm run dev` again)

## Important Notes

### API Token
- You need to get the API token from your production Strapi admin panel
- Go to: https://admin.carafecoffee.co.uk/admin
- Navigate to: Settings > API Tokens > Create new API token
- Copy the token and update `.env`:
  ```bash
  STRAPI_API_TOKEN=your-actual-token-here
  ```

### After Switching
Always restart your Nuxt dev server after changing `.env`:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### CORS Configuration
If you get CORS errors when connecting to production Strapi from localhost, you need to update the CORS settings in your production Strapi:

1. Log in to production Strapi admin
2. Go to: Settings > Global Settings > Security > CORS
3. Add `http://localhost:3000` to the allowed origins

### Current Setup
- ✅ Frontend: `http://localhost:3000` (local)
- ✅ Backend: `https://admin.carafecoffee.co.uk` (production)
- ⚠️ Make sure your production Strapi allows CORS from localhost

## Environment Variables Overview

| Variable | Production | Local |
|----------|-----------|-------|
| `NUXT_PUBLIC_STRAPI_URL` | `https://admin.carafecoffee.co.uk` | `http://localhost:1337` |
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `http://localhost:3000` |
| `STRAPI_API_TOKEN` | Production token | Local token |
