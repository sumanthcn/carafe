# Stripe + Email Integration — Heroku Deployment Guide

> **Branch:** `cns-prepare-hosting-part2`  
> **Updated:** April 18, 2026  
> **Apps:**
> - Backend (Strapi): `carafe-strapi` → `https://carafe-strapi.herokuapp.com`
> - Frontend (Nuxt): `carafe` → `https://carafe.herokuapp.com`
> **Git remotes already configured:**
> - `heroku-backend` → `https://git.heroku.com/carafe-strapi.git`
> - `heroku-frontend` → `https://git.heroku.com/carafe.git`

---

## Part 0 — Heroku CLI Login & Connection

### 0.1 Verify Heroku CLI is installed

```bash
heroku --version
# Expected: heroku/10.x.x darwin-arm64 ...
```

If missing, install it:
```bash
brew tap heroku/brew && brew install heroku
```

### 0.2 Log in to Heroku

```bash
heroku login
```

This opens a browser window. Click **Log In** and it will authenticate your terminal session.

If you prefer not to open a browser (e.g. inside a CI shell):
```bash
heroku login -i
# Enter your Heroku email and password (or API key as password)
```

### 0.3 Verify you are authenticated

```bash
heroku auth:whoami
# Expected: your-email@example.com
```

### 0.4 Confirm git remotes are set (already done in this repo)

```bash
git remote -v
```

Expected output:
```
heroku-backend   https://git.heroku.com/carafe-strapi.git (fetch)
heroku-backend   https://git.heroku.com/carafe-strapi.git (push)
heroku-frontend  https://git.heroku.com/carafe.git (fetch)
heroku-frontend  https://git.heroku.com/carafe.git (push)
origin           git@github.com:sumanthcn/carafe.git (fetch)
origin           git@github.com:sumanthcn/carafe.git (push)
```

If remotes are missing, re-add them:
```bash
heroku git:remote -a carafe-strapi --remote heroku-backend
heroku git:remote -a carafe        --remote heroku-frontend
```

### 0.5 Verify you can reach both apps

```bash
heroku apps:info --app carafe-strapi
heroku apps:info --app carafe
```

Both should return app details without errors.

---

## What Changed Since Last Deployment

| Area | Change |
|---|---|
| **Payment** | Migrated from Worldpay → **Stripe Checkout** |
| **Backend API** | New `api::stripe` routes (`create-checkout-session`, `webhook`, `order-confirmation`, `auth/me`) |
| **Middleware** | `global::stripe-raw-body` added — captures raw body for webhook HMAC verification |
| **Order schema** | Added `stripeSessionId`, `paymentMethod`, `paymentId` fields |
| **Email** | Nodemailer SMTP service with template engine, email-log collection |
| **Frontend env** | `STRIPE_PUBLIC_KEY` replaces all Worldpay vars |
| **Pages** | `/payment/success`, `/payment/cancelled`, `/payment/failure` |

---

## Part 1 — Pre-flight Checks (local)

### 1.1 Switch to the deployment branch

```bash
git checkout cns-prepare-hosting-part2
git status          # should be clean
```

### 1.2 Verify new migration files exist

```bash
ls strapi-backend/database/migrations/
```

Expected output (in order):
```
2026-01-01-enable-visit-cafe-permissions.js
2026-04-11-rename-order-status-to-order-status.js
2026-04-18-add-stripe-fields-to-orders.js
2026-04-18-add-order-tracking-token.js
2026-04-18-set-stripe-api-permissions.js
```

### 1.3 Confirm stripe package is installed

```bash
cd strapi-backend && grep '"stripe"' package.json && grep '"nodemailer"' package.json
```

Both lines must be present. If missing: `yarn add stripe nodemailer`.

---

## Part 2 — Stripe Dashboard Setup

Before deploying, complete these steps in the Stripe Dashboard.

### 2.1 Get API keys

1. Log in at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers → API Keys**
3. Copy:
   - **Secret key** → starts with `sk_live_…` (production) or `sk_test_…` (sandbox)
   - **Publishable key** → starts with `pk_live_…` (production) or `pk_test_…` (sandbox)

> Start with test keys while validating, switch to live keys only when ready.

### 2.2 Register the Webhook endpoint

1. Go to **Developers → Webhooks → Add endpoint**
2. **Endpoint URL:**
   ```
   https://carafe-strapi.herokuapp.com/api/stripe/webhook
   ```
3. **Events to listen to:**
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Click **Add endpoint**
5. On the endpoint detail page, click **Reveal** next to *Signing secret*
6. Copy the value — starts with `whsec_…`

---

## Part 3 — Set Heroku Config Vars

### 3.1 Strapi backend app

Run these one-by-one. Replace placeholder values with your real credentials.

```bash
# ── Stripe ─────────────────────────────────────────────────────────────────
heroku config:set \
  STRIPE_SECRET_KEY="sk_live_REPLACE_ME" \
  STRIPE_WEBHOOK_SECRET="whsec_REPLACE_ME" \
  --app carafe-strapi

# ── Email / SMTP ────────────────────────────────────────────────────────────
heroku config:set \
  SMTP_HOST="smtpout.secureserver.net" \
  SMTP_PORT="587" \
  SMTP_USER="info@immfoods.com" \
  SMTP_PASS="REPLACE_WITH_REAL_PASSWORD" \
  SMTP_FROM_EMAIL="info@immfoods.com" \
  EMAIL_FROM_NAME="Carafe Coffee" \
  --app carafe-strapi

# ── URLs (verify these are already correct) ─────────────────────────────────
heroku config:get FRONTEND_URL --app carafe-strapi
heroku config:get PUBLIC_URL   --app carafe-strapi
```

Expected values:
- `FRONTEND_URL` → `https://carafe.herokuapp.com` (or your custom domain)
- `PUBLIC_URL` → `https://carafe-strapi.herokuapp.com`

### 3.2 Nuxt frontend app

```bash
heroku config:set \
  STRIPE_PUBLIC_KEY="pk_live_REPLACE_ME" \
  --app carafe
```

Remove any stale Worldpay vars:
```bash
heroku config:unset \
  WORLDPAY_MERCHANT_CODE \
  WORLDPAY_XML_PASSWORD \
  WORLDPAY_MAC_SECRET \
  WORLDPAY_ENV \
  WORLDPAY_USERNAME \
  WORLDPAY_PASSWORD \
  WORLDPAY_MERCHANT_ENTITY \
  WORLDPAY_BASE_URL \
  --app carafe
```

### 3.3 Verify all required vars are set

```bash
# Backend
heroku config --app carafe-strapi | grep -E "STRIPE|SMTP|EMAIL|DATABASE|APP_KEYS|JWT"

# Frontend
heroku config --app carafe | grep -E "STRIPE|STRAPI|NUXT"
```

---

## Part 4 — Deploy the Code

### 4.1 Commit everything

Run from the repo root:

```bash
cd /path/to/carafe_website   # your repo root

git add strapi-backend/database/migrations/ \
        strapi-backend/app.json \
        nuxt-frontend/app.json \
        nuxt-frontend/.env.heroku.example

git commit -m "feat: add Stripe + email migrations and updated Heroku config"
```

### 4.2 Deploy Strapi backend

This repo uses a monorepo layout. Push only the `strapi-backend/` subfolder to the backend app using `git subtree`:

```bash
# From the repo root:
git subtree push --prefix strapi-backend heroku-backend main
```

> **If the subtree push is rejected** (non-fast-forward), force it:
> ```bash
> git push heroku-backend `git subtree split --prefix strapi-backend main`:main --force
> ```

Watch the build and startup logs:

```bash
heroku logs --tail --app carafe-strapi
```

Look for these migration lines near the end of startup:
```
✓ Added orders.stripe_session_id
✓ Added orders.payment_method
✓ Added orders.payment_id
✓ Added orders.order_tracking_token
✓ Created & enabled public permission: api::stripe.stripe.createCheckoutSession
[emailService] ✅ SMTP connection verified successfully
```

### 4.3 Deploy Nuxt frontend

```bash
# From the repo root:
git subtree push --prefix nuxt-frontend heroku-frontend main
```

Watch frontend build logs:
```bash
heroku logs --tail --app carafe
```

---

## Part 5 — Post-Deployment Verification

### 5.1 Health checks

```bash
# Backend health
curl -s https://carafe-strapi.herokuapp.com/_health

# Stripe endpoint accessible
curl -s -o /dev/null -w "%{http_code}" \
  "https://carafe-strapi.herokuapp.com/api/stripe/order-confirmation?session_id=cs_test_dummy"
# → 400 (expected — invalid session ID, but route is reachable)
```

### 5.2 Test a Stripe payment (sandbox)

1. Browse to `https://carafe.herokuapp.com`
2. Add a product to cart and proceed to checkout
3. Complete the checkout form and click **Pay**
4. Use [Stripe test card](https://docs.stripe.com/testing#cards): `4242 4242 4242 4242` / any future date / any CVC
5. Verify redirect to `/payment/success` with the order number displayed
6. Confirm in **Stripe Dashboard → Payments** the charge appears as `Succeeded`
7. Confirm in **Strapi Admin → Orders** the order shows `paymentStatus: captured`

### 5.3 Test webhook delivery

In Stripe Dashboard → Developers → Webhooks → select your endpoint:
- Check **Recent deliveries** tab
- `checkout.session.completed` should show `200 OK`

### 5.4 Test confirmation email

After payment, the buyer email should receive an order confirmation. Check spam folder if not received within 2 minutes.

---

## Part 6 — Switch to Live Stripe Keys

Once sandbox testing passes:

```bash
heroku config:set \
  STRIPE_SECRET_KEY="sk_live_REPLACE_ME" \
  --app carafe-strapi

heroku config:set \
  STRIPE_PUBLIC_KEY="pk_live_REPLACE_ME" \
  --app carafe
```

> **Important:** Update the Stripe webhook endpoint signing secret too — live and test endpoints have different `whsec_` values.

```bash
heroku config:set \
  STRIPE_WEBHOOK_SECRET="whsec_LIVE_REPLACE_ME" \
  --app carafe-strapi
```

Restart both dynos to pick up new keys:

```bash
heroku restart --app carafe-strapi
heroku restart --app carafe
```

---

## Part 7 — Rollback Plan

If the deployment fails:

```bash
# Roll back to the previous release
heroku rollback --app carafe-strapi
heroku rollback --app carafe
```

To view release history before rolling back:
```bash
heroku releases --app carafe-strapi
heroku releases --app carafe
```

The migration files are idempotent (`hasColumn` guards) — if re-run on an existing schema they will skip gracefully without errors.

---

## Environment Variable Reference

### Strapi backend (`carafe-strapi`)

| Variable | Required | Description |
|---|---|---|
| `APP_KEYS` | ✅ | Comma-separated app keys |
| `API_TOKEN_SALT` | ✅ | Salt for API tokens |
| `ADMIN_JWT_SECRET` | ✅ | Admin panel JWT secret |
| `TRANSFER_TOKEN_SALT` | ✅ | Data-transfer token salt |
| `JWT_SECRET` | ✅ | Users-permissions JWT secret |
| `DATABASE_URL` | ✅ | Set automatically by Heroku Postgres add-on |
| `DATABASE_CLIENT` | ✅ | `postgres` |
| `DATABASE_SSL` | ✅ | `true` |
| `FRONTEND_URL` | ✅ | Nuxt frontend URL (for CORS) |
| `PUBLIC_URL` | ✅ | This Strapi instance URL |
| `STRIPE_SECRET_KEY` | ✅ | `sk_live_…` or `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_…` from Stripe Dashboard |
| `SMTP_HOST` | ✅ | SMTP server hostname |
| `SMTP_PORT` | ✅ | `587` (STARTTLS) or `465` (SSL) |
| `SMTP_USER` | ✅ | SMTP username / sender address |
| `SMTP_PASS` | ✅ | SMTP password |
| `SMTP_FROM_EMAIL` | ➖ | From address alias (defaults to `SMTP_USER`) |
| `EMAIL_FROM_NAME` | ➖ | Display name in From header |

### Nuxt frontend (`carafe`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `NUXT_PUBLIC_SITE_URL` | ✅ | Public URL of this frontend |
| `NUXT_PUBLIC_STRAPI_URL` | ✅ | Strapi backend URL |
| `STRAPI_API_TOKEN` | ✅ | Strapi API token (server-side) |
| `STRIPE_PUBLIC_KEY` | ✅ | `pk_live_…` or `pk_test_…` |
