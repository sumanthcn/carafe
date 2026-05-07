# Carafe Coffee — Deployment Guide

## Overview

The project is split into two Heroku apps:

| App | Heroku Name | URL |
|-----|-------------|-----|
| Strapi CMS (Backend) | `carafe-strapi` | https://carafe-strapi.herokuapp.com |
| Nuxt Frontend | `carafe` | https://carafecoffee.co.uk |

Both apps are deployed via **git subtree push** from the monorepo root.

---

## Prerequisites

### Tools required
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) — `brew install heroku/brew/heroku`
- Git
- Node.js ≥ 18
- Yarn

### One-time setup (already done — skip if remotes exist)
```bash
# Check remotes are configured
git remote -v

# If not present, add them:
heroku git:remote --app carafe-strapi --remote heroku-backend
heroku git:remote --app carafe        --remote heroku-frontend
```

### Login
```bash
heroku login
# verify
heroku auth:whoami
```

---

## Deploying the Backend (Strapi)

### Standard deploy
```bash
# From the monorepo root
git subtree push --prefix strapi-backend heroku-backend master
```

### What happens on Heroku
1. Node.js buildpack detects `package.json`
2. Runs `yarn install`
3. Runs `yarn build` (compiles Strapi TypeScript → `dist/`)
4. Restarts the dyno running `yarn start`

### Check build logs
```bash
heroku logs --tail --app carafe-strapi
```

### After deploying backend — important steps
- If you added or changed a **Strapi content type schema** (e.g. new fields), Strapi auto-migrates the database on first boot.
- Visit https://carafe-strapi.herokuapp.com/admin to confirm the admin panel loads.
- Update any new field values in the admin panel.

---

## Deploying the Frontend (Nuxt)

### Standard deploy
```bash
# From the monorepo root
git subtree push --prefix nuxt-frontend heroku-frontend master
```

### What happens on Heroku
1. Node.js buildpack runs `yarn install`
2. Runs `yarn build` (via `heroku-postbuild` script → `nuxt build`)
3. Restarts the dyno running `node .output/server/index.mjs`

### Check build logs
```bash
heroku logs --tail --app carafe
```

---

## Deploying Both at Once

```bash
# Backend first (so the frontend can connect to it)
git subtree push --prefix strapi-backend heroku-backend master

# Then frontend
git subtree push --prefix nuxt-frontend heroku-frontend master
```

---

## Environment Variables

### Backend — `carafe-strapi`

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `APP_KEYS` | Strapi app encryption keys (comma-separated) |
| `API_TOKEN_SALT` | Salt for API tokens |
| `ADMIN_JWT_SECRET` | JWT secret for admin panel |
| `JWT_SECRET` | JWT secret for user tokens |
| `TRANSFER_TOKEN_SALT` | Salt for data transfer tokens |
| `DATABASE_URL` | PostgreSQL connection string (set by Heroku add-on or manually) |
| `DATABASE_CLIENT` | `postgres` |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | Email SMTP host |
| `SMTP_PORT` | Email SMTP port |
| `SMTP_USER` | Email SMTP username |
| `SMTP_PASS` | Email SMTP password |
| `SMTP_FROM_EMAIL` | From email address |
| `EMAIL_FROM_NAME` | From name |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FRONTEND_URL` | `https://www.carafecoffee.co.uk` |
| `PUBLIC_URL` | `https://carafe-strapi.herokuapp.com` |
| `UPLOAD_PROVIDER` | `cloudinary` |
| `SERVE_ADMIN_PANEL` | `true` |

```bash
# View all current config vars
heroku config --app carafe-strapi

# Set a variable
heroku config:set VARIABLE_NAME=value --app carafe-strapi
```

### Frontend — `carafe`

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `NUXT_PUBLIC_STRAPI_URL` | `https://admin.carafecoffee.co.uk` |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `PUBLIC_URL` | `https://carafecoffee.co.uk` |

```bash
# View all current config vars
heroku config --app carafe

# Set a variable
heroku config:set VARIABLE_NAME=value --app carafe
```

---

## Workflow: Making & Deploying Changes

### 1. Make your changes locally
```bash
# Work in nuxt-frontend/ or strapi-backend/
```

### 2. Test locally
```bash
# Terminal 1 — Strapi
cd strapi-backend
yarn develop

# Terminal 2 — Nuxt
cd nuxt-frontend
yarn dev
```

### 3. Commit everything
```bash
git add .
git commit -m "your message describing the change"
git push origin master   # push to GitHub
```

### 4. Deploy to Heroku

**Backend only** (schema changes, API changes, plugin changes):
```bash
git subtree push --prefix strapi-backend heroku-backend master
```

**Frontend only** (UI, component, page, composable changes):
```bash
git subtree push --prefix nuxt-frontend heroku-frontend master
```

**Both** (when in doubt):
```bash
git subtree push --prefix strapi-backend heroku-backend master
git subtree push --prefix nuxt-frontend heroku-frontend master
```

---

## Strapi Schema Changes

When you modify a content type schema (add/remove/rename fields in `strapi-backend/src/components/` or `strapi-backend/src/api/*/content-types/`):

1. Deploy the backend — Strapi will auto-migrate the database
2. Go to the Strapi admin panel and **fill in the new fields** for existing entries
3. No frontend redeploy is needed unless you also changed frontend code

---

## Troubleshooting

### Backend not starting
```bash
heroku logs --tail --app carafe-strapi
```
Common causes:
- Missing environment variable → set it with `heroku config:set`
- Database connection error → check `DATABASE_URL` is correct
- Build error → check the build log output

### Frontend not starting
```bash
heroku logs --tail --app carafe
```
Common causes:
- `NUXT_PUBLIC_STRAPI_URL` pointing to wrong backend URL
- Build failed due to TypeScript error → fix locally and redeploy

### Heroku push rejected (non-fast-forward)
If a push is rejected because Heroku's history diverged:
```bash
# Force push (use with caution — only if you know why it diverged)
git push heroku-backend master --force
# or for frontend:
git push heroku-frontend master --force
```

### Checking dyno status
```bash
heroku ps --app carafe-strapi
heroku ps --app carafe
```

### Restarting dynos manually
```bash
heroku restart --app carafe-strapi
heroku restart --app carafe
```

### Running one-off commands (e.g. migrations, scripts)
```bash
heroku run yarn strapi migration:run --app carafe-strapi
heroku run node scripts/some-script.js --app carafe-strapi
```

---

## Health Check URLs

| Service | URL |
|---------|-----|
| Frontend | https://carafecoffee.co.uk |
| Strapi Admin | https://carafe-strapi.herokuapp.com/admin |
| Strapi API | https://carafe-strapi.herokuapp.com/api/homepage |

---

## Git Remotes Reference

```
heroku-backend   → https://git.heroku.com/carafe-strapi.git  (deploys strapi-backend/)
heroku-frontend  → https://git.heroku.com/carafe.git          (deploys nuxt-frontend/)
origin           → git@github.com:sumanthcn/carafe.git         (GitHub source of truth)
```

Always push to `origin/master` first, then to Heroku remotes.
