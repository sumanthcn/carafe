# =============================================================================
# HEROKU DEPLOYMENT GUIDE - CARAFE COFFEE
# =============================================================================

## Overview

This guide covers deploying Carafe Coffee to Heroku. The application consists
of two main components:
- **Strapi Backend** (CMS/API)
- **Nuxt Frontend** (User-facing website)

## Deployment Architecture

For Heroku, we recommend deploying as **two separate apps**:
1. `carafe-strapi` - Strapi backend with PostgreSQL addon
2. `carafe-frontend` - Nuxt 3 frontend SSR application

## Prerequisites

1. **Heroku CLI** installed
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Heroku Account** with credit card (required for addons)

3. **Git** repository with all code committed

## Quick Start

### Option 1: Automated Deployment Script

```bash
# Make the script executable
chmod +x scripts/heroku-deploy.sh

# Deploy both apps
./scripts/heroku-deploy.sh both

# Or deploy individually
./scripts/heroku-deploy.sh backend
./scripts/heroku-deploy.sh frontend
```

### Option 2: Manual Deployment

#### Step 1: Deploy Strapi Backend

```bash
# Create Heroku app
heroku create carafe-strapi --region eu

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini --app carafe-strapi

# Set environment variables
heroku config:set \
  NODE_ENV=production \
  HOST=0.0.0.0 \
  APP_KEYS="$(openssl rand -base64 32),$(openssl rand -base64 32)" \
  API_TOKEN_SALT="$(openssl rand -base64 16)" \
  ADMIN_JWT_SECRET="$(openssl rand -base64 16)" \
  TRANSFER_TOKEN_SALT="$(openssl rand -base64 16)" \
  JWT_SECRET="$(openssl rand -base64 16)" \
  --app carafe-strapi

# Get database credentials (automatically set by Postgres addon)
heroku config --app carafe-strapi | grep DATABASE_URL

# Deploy using git subtree
git remote add heroku-backend https://git.heroku.com/carafe-strapi.git
git subtree push --prefix strapi-backend heroku-backend master

# Check logs
heroku logs --tail --app carafe-strapi

# Open app
heroku open --app carafe-strapi
```

#### Step 2: Deploy Nuxt Frontend

```bash
# Create Heroku app
heroku create carafe-frontend --region eu

# Set environment variables
heroku config:set \
  NODE_ENV=production \
  HOST=0.0.0.0 \
  NUXT_PUBLIC_SITE_URL="https://carafe-frontend.herokuapp.com" \
  NUXT_PUBLIC_STRAPI_URL="https://carafe-strapi.herokuapp.com" \
  STRAPI_API_TOKEN="your-api-token-from-strapi" \
  --app carafe-frontend

# Deploy using git subtree
git remote add heroku-frontend https://git.heroku.com/carafe-frontend.git
git subtree push --prefix nuxt-frontend heroku-frontend master

# Check logs
heroku logs --tail --app carafe-frontend

# Open app
heroku open --app carafe-frontend
```

## Environment Variables

### Strapi Backend Required

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337  # Heroku will override this
APP_KEYS=<generated>
API_TOKEN_SALT=<generated>
ADMIN_JWT_SECRET=<generated>
TRANSFER_TOKEN_SALT=<generated>
JWT_SECRET=<generated>
DATABASE_CLIENT=postgres
DATABASE_URL=<automatically set by Heroku Postgres>
FRONTEND_URL=https://carafe-frontend.herokuapp.com
PUBLIC_URL=https://carafe-strapi.herokuapp.com
```

### Nuxt Frontend Required

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=3000  # Heroku will override this
NUXT_PUBLIC_SITE_URL=https://carafe-frontend.herokuapp.com
NUXT_PUBLIC_STRAPI_URL=https://carafe-strapi.herokuapp.com
STRAPI_API_TOKEN=<from strapi admin panel>
WORLDPAY_MERCHANT_CODE=<optional>
WORLDPAY_XML_PASSWORD=<optional>
WORLDPAY_MAC_SECRET=<optional>
WORLDPAY_ENV=live
```

## Buildpack Configuration

The project includes both `Procfile` and `heroku.yml` for flexibility:

### Using Procfile (Default - Recommended)

Standard Heroku buildpack deployment:
```bash
# This is automatic - no action needed
```

### Using Container (Docker)

If you prefer Docker containers:
```bash
heroku stack:set container --app carafe-strapi
heroku stack:set container --app carafe-frontend
```

## Database Configuration

### Strapi Database Setup

1. Heroku Postgres automatically sets `DATABASE_URL`
2. Strapi config extracts connection details from this URL
3. Update `strapi-backend/config/database.ts` to parse `DATABASE_URL`:

```typescript
export default ({ env }) => {
  if (env('DATABASE_URL')) {
    const url = new URL(env('DATABASE_URL'));
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: url.hostname,
          port: parseInt(url.port),
          database: url.pathname.slice(1),
          user: url.username,
          password: url.password,
          ssl: { rejectUnauthorized: false }
        }
      }
    };
  }
  // ... existing config
};
```

## Post-Deployment Steps

### 1. Create Strapi Admin User

```bash
# Access the admin panel
open https://carafe-strapi.herokuapp.com/admin
```

### 2. Generate API Token

1. Go to Settings → API Tokens
2. Create new token with full access
3. Copy token and set in frontend:

```bash
heroku config:set STRAPI_API_TOKEN=<token> --app carafe-frontend
```

### 3. Configure CORS

Update `strapi-backend/config/middlewares.ts`:
```typescript
{
  name: 'strapi::cors',
  config: {
    origin: ['https://carafe-frontend.herokuapp.com'],
    credentials: true
  }
}
```

### 4. Run Migrations (if any)

```bash
heroku run npm run strapi -- migration:run --app carafe-strapi
```

## Monitoring & Maintenance

### View Logs

```bash
# Strapi logs
heroku logs --tail --app carafe-strapi

# Nuxt logs
heroku logs --tail --app carafe-frontend
```

### Restart Apps

```bash
heroku restart --app carafe-strapi
heroku restart --app carafe-frontend
```

### Scale Dynos

```bash
# Scale up
heroku ps:scale web=2 --app carafe-frontend

# Scale down
heroku ps:scale web=1 --app carafe-frontend
```

### Database Backups

```bash
# Create backup
heroku pg:backups:capture --app carafe-strapi

# List backups
heroku pg:backups --app carafe-strapi

# Download backup
heroku pg:backups:download --app carafe-strapi
```

## Troubleshooting

### Build Fails

```bash
# Check build logs
heroku logs --tail --app carafe-strapi

# Common issues:
# 1. Node version mismatch - check engines in package.json
# 2. Missing dependencies - check package.json
# 3. Build timeout - upgrade to larger dyno temporarily
```

### Database Connection Issues

```bash
# Check database credentials
heroku config --app carafe-strapi | grep DATABASE

# Check database status
heroku pg:info --app carafe-strapi

# Reset database (CAUTION!)
heroku pg:reset DATABASE_URL --app carafe-strapi
```

### Memory Issues

```bash
# Check memory usage
heroku ps --app carafe-frontend

# Upgrade dyno type
heroku ps:type standard-1x --app carafe-frontend
```

## Custom Domain Setup

```bash
# Add domain to frontend
heroku domains:add www.carafe.coffee --app carafe-frontend
heroku domains:add carafe.coffee --app carafe-frontend

# Add domain to backend
heroku domains:add cms.carafe.coffee --app carafe-strapi

# Get DNS targets
heroku domains --app carafe-frontend
```

Update your DNS:
```
A     @     <IP from Heroku>
CNAME www   <DNS target from Heroku>
CNAME cms   <DNS target from Heroku>
```

## Cost Estimation (as of 2026)

- **Eco Dynos**: $5/month per app = $10/month
- **Standard-1X**: $25/month per app = $50/month
- **PostgreSQL Mini**: $5/month
- **Total Basic Setup**: ~$15-55/month

## Useful Commands

```bash
# Check app info
heroku apps:info --app carafe-strapi

# Open shell
heroku run bash --app carafe-strapi

# Check config
heroku config --app carafe-strapi

# Check releases
heroku releases --app carafe-strapi

# Rollback
heroku rollback --app carafe-strapi
```

## CI/CD Integration

Consider setting up automatic deployments:

1. Connect GitHub repo to Heroku
2. Enable automatic deploys on push
3. Enable review apps for pull requests

```bash
# Enable GitHub integration via Heroku Dashboard
# Or use Heroku Pipelines CLI
heroku pipelines:create carafe-pipeline --team=your-team
heroku pipelines:add carafe-pipeline --app carafe-strapi
```

## Support

For issues:
1. Check Heroku status: https://status.heroku.com
2. Review logs: `heroku logs --tail`
3. Consult Heroku docs: https://devcenter.heroku.com

---

**Last Updated**: January 2026
**Heroku Stack**: heroku-22
**Node Version**: 20.x
