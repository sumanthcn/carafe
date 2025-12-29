# Worldpay Payment Integration Setup Guide

This guide will walk you through configuring the Worldpay payment gateway for the Carafe Coffee e-commerce platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Worldpay Configuration](#worldpay-configuration)
3. [Environment Variables](#environment-variables)
4. [Strapi API Token](#strapi-api-token)
5. [Testing Payment Flow](#testing-payment-flow)
6. [Webhook Configuration](#webhook-configuration)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Worldpay merchant account (test or production)
- ✅ Access to Worldpay Merchant Interface
- ✅ Strapi backend running on port 1337
- ✅ Nuxt frontend running on port 3001
- ✅ PostgreSQL database configured

---

## Worldpay Configuration

### Step 1: Log into Worldpay Merchant Interface

1. Go to [Worldpay Merchant Interface](https://secure.worldpay.com/sso/public/auth/login.html)
2. Log in with your merchant credentials

### Step 2: Get Your Merchant Code

1. Navigate to **Settings** → **Account Details**
2. Find your **Merchant Code** (e.g., `YOURMERCHANT`)
3. Copy this value - you'll need it for `WORLDPAY_MERCHANT_CODE`

### Step 3: Get Installation ID

1. Navigate to **Integration** → **Installations**
2. Select or create an installation
3. Copy the **Installation ID** - you'll need it for `WORLDPAY_INSTALLATION_ID`

### Step 4: Set Up XML Direct Credentials

1. Navigate to **Integration** → **XML Direct**
2. Enable **XML Direct** if not already enabled
3. Create or view your **XML Username** and **XML Password**
4. Copy these values for `WORLDPAY_XML_USERNAME` and `WORLDPAY_XML_PASSWORD`

⚠️ **Important**: Keep XML credentials secure - never commit them to version control.

### Step 5: Get MAC Secret

1. Navigate to **Integration** → **Payment Response Settings**
2. Find **Payment Response MAC Secret**
3. Copy this value for `WORLDPAY_MAC_SECRET`

This is used to verify the authenticity of payment responses.

### Step 6: Configure Payment Response URLs

In the Worldpay Merchant Interface, set the following URLs:

**For Local Testing:**
```
Success URL: http://localhost:3001/checkout/success
Cancel URL:  http://localhost:3001/checkout
Pending URL: http://localhost:3001/checkout/success
Failure URL: http://localhost:3001/checkout
```

**For Production:**
```
Success URL: https://yourdomain.com/checkout/success
Cancel URL:  https://yourdomain.com/checkout
Pending URL: https://yourdomain.com/checkout/success
Failure URL: https://yourdomain.com/checkout
```

---

## Environment Variables

### Step 1: Create `.env` File

```bash
cd nuxt-frontend
cp .env.example .env
```

### Step 2: Fill in Worldpay Credentials

Edit `nuxt-frontend/.env` and add your credentials:

```env
# Worldpay Payment Gateway Configuration
WORLDPAY_MERCHANT_CODE=YOUR_MERCHANT_CODE
WORLDPAY_INSTALLATION_ID=YOUR_INSTALLATION_ID
WORLDPAY_XML_USERNAME=YOUR_XML_USERNAME
WORLDPAY_XML_PASSWORD=YOUR_XML_PASSWORD
WORLDPAY_MAC_SECRET=YOUR_MAC_SECRET

# Test Mode (set to 'false' for production)
WORLDPAY_TEST_MODE=true

# Payment Response URLs
WORLDPAY_SUCCESS_URL=http://localhost:3001/checkout/success
WORLDPAY_CANCEL_URL=http://localhost:3001/checkout
WORLDPAY_PENDING_URL=http://localhost:3001/checkout/success
WORLDPAY_FAILURE_URL=http://localhost:3001/checkout

# Strapi API Configuration
STRAPI_API_TOKEN=YOUR_STRAPI_API_TOKEN_HERE
```

### Step 3: Environment Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `WORLDPAY_MERCHANT_CODE` | Your Worldpay merchant identifier | `YOURMERCHANT` |
| `WORLDPAY_INSTALLATION_ID` | Installation ID for payment pages | `1234567` |
| `WORLDPAY_XML_USERNAME` | XML Direct API username | `xml_user` |
| `WORLDPAY_XML_PASSWORD` | XML Direct API password | `secret123` |
| `WORLDPAY_MAC_SECRET` | MAC secret for response verification | `abc123xyz` |
| `WORLDPAY_TEST_MODE` | Enable test mode (`true`/`false`) | `true` |
| `WORLDPAY_SUCCESS_URL` | Redirect URL after successful payment | Full URL |
| `WORLDPAY_CANCEL_URL` | Redirect URL if payment cancelled | Full URL |
| `WORLDPAY_PENDING_URL` | Redirect URL for pending payments | Full URL |
| `WORLDPAY_FAILURE_URL` | Redirect URL if payment fails | Full URL |

---

## Strapi API Token

The Nuxt frontend needs a Strapi API token to create and update orders.

### Step 1: Generate API Token in Strapi

1. Start your Strapi backend:
   ```bash
   cd strapi-backend
   npm run develop
   ```

2. Open [http://localhost:1337/admin](http://localhost:1337/admin)

3. Log in to Strapi admin panel

4. Navigate to **Settings** → **API Tokens** → **Create new API Token**

5. Configure the token:
   - **Name**: `Frontend Payment API`
   - **Description**: `Token for frontend to manage orders and payments`
   - **Token duration**: `Unlimited`
   - **Token type**: `Custom`

6. Set the following permissions:

   **Order**:
   - ✅ `find` - List orders
   - ✅ `findOne` - Get single order
   - ✅ `create` - Create new order
   - ✅ `update` - Update order status

   **Product** (if review endpoints need it):
   - ✅ `find` - List products
   - ✅ `findOne` - Get single product

7. Click **Save** and copy the generated token

⚠️ **Important**: The token is shown only once. Copy it immediately!

### Step 2: Add Token to Environment

Add the token to `nuxt-frontend/.env`:

```env
STRAPI_API_TOKEN=your_generated_token_here
```

---

## Testing Payment Flow

### Test Card Numbers

Use these test card numbers in Worldpay test mode:

| Card Type | Card Number | CVV | Expiry |
|-----------|-------------|-----|--------|
| Visa | 4444333322221111 | 123 | Any future date |
| Mastercard | 5555555555554444 | 123 | Any future date |
| Amex | 34343434343434 | 1234 | Any future date |

### Test Payment Flow

1. **Start both servers**:
   ```bash
   # Terminal 1 - Strapi Backend
   cd strapi-backend
   npm run develop

   # Terminal 2 - Nuxt Frontend
   cd nuxt-frontend
   npm run dev
   ```

2. **Complete a test purchase**:
   - Go to [http://localhost:3001](http://localhost:3001)
   - Browse products and add to cart
   - Create account or log in
   - Go to checkout
   - Fill in shipping details
   - Click "Proceed to Payment"
   - Use test card number `4444333322221111`
   - Complete payment

3. **Verify order creation**:
   - Check Strapi admin: [http://localhost:1337/admin/content-manager/collection-types/api::order.order](http://localhost:1337/admin/content-manager/collection-types/api::order.order)
   - Order should appear with status `order_received`

4. **Check order tracking**:
   - Go to [http://localhost:3001/account/orders](http://localhost:3001/account/orders)
   - Your order should appear in the list
   - Click "View Details" to see order timeline

---

## Webhook Configuration

Webhooks allow Worldpay to notify your server when payment status changes.

### Step 1: Configure Webhook URL

1. In Worldpay Merchant Interface, go to **Integration** → **Webhooks**

2. Add webhook URL:
   ```
   Development: http://localhost:3001/api/payment/webhook
   Production:  https://yourdomain.com/api/payment/webhook
   ```

3. Select events to subscribe to:
   - ✅ `AUTHORISED` - Payment authorized
   - ✅ `CAPTURED` - Payment captured
   - ✅ `REFUSED` - Payment declined
   - ✅ `ERROR` - Payment error

### Step 2: Test Webhook Locally

For local testing, use **ngrok** to expose your local server:

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this URL in Worldpay webhook configuration:
# https://abc123.ngrok.io/api/payment/webhook
```

### Step 3: Verify Webhook

The webhook endpoint at `/api/payment/webhook` will:
- Receive payment notifications from Worldpay
- Update order status in Strapi
- Update payment status (pending → captured)

Check Strapi logs to verify webhook calls:
```bash
cd strapi-backend
npm run develop
# Watch for webhook logs when payment is completed
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set `WORLDPAY_TEST_MODE=false` in production `.env`
- [ ] Use production Worldpay credentials (not test credentials)
- [ ] Update payment response URLs to production domain
- [ ] Configure production webhook URL
- [ ] Test payment flow with real (small amount) transaction
- [ ] Verify order creation in production Strapi
- [ ] Test order tracking and email notifications
- [ ] Set up SSL certificate for production domain
- [ ] Configure CORS in Strapi for production frontend domain

### Production Environment Variables

```env
# Production values
WORLDPAY_MERCHANT_CODE=YOUR_PROD_MERCHANT_CODE
WORLDPAY_INSTALLATION_ID=YOUR_PROD_INSTALLATION_ID
WORLDPAY_XML_USERNAME=YOUR_PROD_XML_USERNAME
WORLDPAY_XML_PASSWORD=YOUR_PROD_XML_PASSWORD
WORLDPAY_MAC_SECRET=YOUR_PROD_MAC_SECRET
WORLDPAY_TEST_MODE=false

WORLDPAY_SUCCESS_URL=https://yourdomain.com/checkout/success
WORLDPAY_CANCEL_URL=https://yourdomain.com/checkout
WORLDPAY_PENDING_URL=https://yourdomain.com/checkout/success
WORLDPAY_FAILURE_URL=https://yourdomain.com/checkout

STRAPI_API_TOKEN=your_production_strapi_token
```

### Security Best Practices

1. **Never commit credentials to Git**:
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use environment-specific tokens**:
   - Separate test and production Strapi API tokens
   - Rotate tokens periodically

3. **Enable HTTPS**:
   - Production must use HTTPS for payment pages
   - Configure SSL certificate for your domain

4. **Monitor webhook security**:
   - Webhook endpoint verifies MAC signature
   - Log all webhook attempts for audit

---

## Troubleshooting

### Payment Initialization Fails

**Error**: "Failed to initialize payment"

**Solution**:
1. Check all Worldpay credentials in `.env`
2. Verify `WORLDPAY_TEST_MODE=true` for test environment
3. Check Strapi API token has Order create/update permissions
4. Review server logs: `cd nuxt-frontend && npm run dev`

### Redirect After Payment Not Working

**Error**: User stuck on Worldpay payment page

**Solution**:
1. Verify payment response URLs in Worldpay Merchant Interface
2. Check URLs match your frontend domain
3. Ensure URLs are accessible (not blocked by firewall)

### Order Not Created in Strapi

**Error**: Payment successful but no order in Strapi

**Solution**:
1. Check `STRAPI_API_TOKEN` is set correctly
2. Verify token has `order:create` permission
3. Check Strapi is running and accessible
4. Review Nuxt server logs for API errors

### Webhook Not Receiving Notifications

**Error**: Payment status not updating after completion

**Solution**:
1. Verify webhook URL is correct in Worldpay
2. For local testing, ensure ngrok tunnel is active
3. Check webhook endpoint is not blocked by CORS
4. Review webhook logs in Strapi backend

### Test Card Declined

**Error**: Test card number rejected

**Solution**:
1. Use correct test card: `4444333322221111`
2. Ensure `WORLDPAY_TEST_MODE=true`
3. Use any future expiry date (e.g., 12/25)
4. Use CVV `123`

---

## Support Resources

- **Worldpay Documentation**: [https://developer.worldpay.com/docs](https://developer.worldpay.com/docs)
- **Strapi Documentation**: [https://docs.strapi.io](https://docs.strapi.io)
- **Nuxt Documentation**: [https://nuxt.com/docs](https://nuxt.com/docs)

---

## Next Steps

Once Worldpay is configured:

1. ✅ **Phase 8 Complete**: Order tracking dashboard is now functional
2. **Phase 9**: Enable product reviews for delivered orders
3. **Phase 10**: Final testing and production deployment

---

**Last Updated**: January 2025  
**Version**: 1.0.0
