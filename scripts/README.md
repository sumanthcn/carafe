# Deployment Scripts

This directory contains scripts for deploying and managing the Carafe Coffee application.

## Scripts Overview

### 1. `heroku-deploy.sh`
Main Heroku deployment script that automates the deployment process.

**Usage:**
```bash
./scripts/heroku-deploy.sh [frontend|backend|both]
```

**Features:**
- Creates Heroku apps if they don't exist
- Configures PostgreSQL addon for Strapi
- Sets up environment variables
- Deploys using git subtrees
- Interactive prompts for safety

**Example:**
```bash
# Deploy both apps
./scripts/heroku-deploy.sh both

# Deploy only backend
./scripts/heroku-deploy.sh backend

# Deploy only frontend
./scripts/heroku-deploy.sh frontend
```

### 2. `generate-secrets.sh`
Generates secure random secrets for Heroku configuration.

**Usage:**
```bash
./scripts/generate-secrets.sh
```

**Output:**
Provides a ready-to-use `heroku config:set` command with generated secrets.

### 3. `start-heroku.js`
Node.js startup script for managing services on Heroku.

**Usage:**
This script is called automatically by Heroku via the Procfile.

**Environment Variables:**
- `HEROKU_SERVICE` - Set to "frontend" or "backend" to specify which service to run

### 4. `deploy.sh`
Original deployment script for VPS/server deployments using PM2.

**Usage:**
```bash
./scripts/deploy.sh
```

**Note:** This is for non-Heroku deployments.

### 5. `server-setup.sh`
Initial server setup script for VPS deployments.

**Usage:**
```bash
./scripts/server-setup.sh
```

**Note:** Run once on a fresh server.

## Quick Start - Heroku Deployment

### Prerequisites
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login to Heroku
heroku login
```

### Deployment Steps

1. **Generate Secrets**
   ```bash
   ./scripts/generate-secrets.sh
   ```

2. **Deploy Applications**
   ```bash
   ./scripts/heroku-deploy.sh both
   ```

3. **Configure Environment Variables**
   Follow the prompts and set all required variables.

4. **Verify Deployment**
   ```bash
   heroku logs --tail --app carafe-strapi
   heroku logs --tail --app carafe-frontend
   ```

## Manual Deployment

If you prefer manual control:

### Backend
```bash
# Create app and add Postgres
heroku create carafe-strapi
heroku addons:create heroku-postgresql:mini --app carafe-strapi

# Set config vars (use generate-secrets.sh output)
heroku config:set NODE_ENV=production --app carafe-strapi
# ... (other vars)

# Deploy
git remote add heroku-backend https://git.heroku.com/carafe-strapi.git
git subtree push --prefix strapi-backend heroku-backend master
```

### Frontend
```bash
# Create app
heroku create carafe-frontend

# Set config vars
heroku config:set NODE_ENV=production --app carafe-frontend
heroku config:set NUXT_PUBLIC_STRAPI_URL=https://carafe-strapi.herokuapp.com --app carafe-frontend
# ... (other vars)

# Deploy
git remote add heroku-frontend https://git.heroku.com/carafe-frontend.git
git subtree push --prefix nuxt-frontend heroku-frontend master
```

## Troubleshooting

### Build Failures
```bash
# Check logs
heroku logs --tail --app carafe-strapi

# Check build logs
heroku builds --app carafe-strapi

# Retry build
git commit --allow-empty -m "Trigger rebuild"
git push heroku-backend master
```

### Database Issues
```bash
# Check Postgres status
heroku pg:info --app carafe-strapi

# View credentials
heroku config:get DATABASE_URL --app carafe-strapi

# Reset database (CAUTION!)
heroku pg:reset DATABASE_URL --app carafe-strapi --confirm carafe-strapi
```

### Environment Variables
```bash
# View all config
heroku config --app carafe-strapi

# Set a variable
heroku config:set KEY=value --app carafe-strapi

# Unset a variable
heroku config:unset KEY --app carafe-strapi
```

## Environment Variables Reference

### Strapi Backend
- `NODE_ENV` - Production environment
- `APP_KEYS` - Strapi app keys (4 keys, comma-separated)
- `API_TOKEN_SALT` - API token salt
- `ADMIN_JWT_SECRET` - Admin JWT secret
- `TRANSFER_TOKEN_SALT` - Transfer token salt
- `JWT_SECRET` - JWT secret
- `DATABASE_URL` - Postgres connection (auto-set by addon)
- `FRONTEND_URL` - Frontend URL for CORS
- `PUBLIC_URL` - Backend public URL

### Nuxt Frontend
- `NODE_ENV` - Production environment
- `NUXT_PUBLIC_SITE_URL` - Public site URL
- `NUXT_PUBLIC_STRAPI_URL` - Strapi API URL
- `STRAPI_API_TOKEN` - API token from Strapi
- `WORLDPAY_*` - Payment gateway credentials (optional)

## CI/CD Integration

For automatic deployments, consider:

1. **GitHub Actions** - Deploy on push to main
2. **Heroku GitHub Integration** - Auto-deploy from GitHub
3. **Heroku Pipelines** - Staging → Production flow

Example GitHub Action:
```yaml
name: Deploy to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "carafe-frontend"
          heroku_email: "your-email@example.com"
```

## Support

For detailed documentation, see:
- [HEROKU_DEPLOYMENT.md](../HEROKU_DEPLOYMENT.md) - Complete deployment guide
- [README.md](../README.md) - Project overview

For issues:
- Check [Heroku Status](https://status.heroku.com)
- Review [Heroku Dev Center](https://devcenter.heroku.com)
- Contact support: support@carafe.coffee
