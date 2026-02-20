# Worldpay Hosted Payment Pages Integration
## Production-Ready REST API Implementation for Nuxt 3

**Integration Type:** Worldpay Hosted Payment Pages (REST API)  
**API Version:** Worldpay HPP API v1  
**Endpoint:** `POST /payment_pages`  
**Last Updated:** February 20, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security & PCI Compliance](#security--pci-compliance)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

This integration implements Worldpay's **Hosted Payment Pages (HPP) API v1** using the official REST API. The customer is redirected to Worldpay's secure payment page and then redirected back to your site.

### ✅ Benefits

- **PCI SAQ-A Compliant** - Worldpay handles all card data
- **Secure** - Credentials never exposed to frontend
- **Production-Ready** - Comprehensive error handling and logging
- **TypeScript** - Full type safety across the integration
- **Webhook Support** - Async payment status notifications
- **Test & Production** - Easy environment switching

### 🔄 Payment Flow

```
1. Customer fills checkout form
   ↓
2. Frontend calls /api/worldpay/create-payment
   ↓
3. Server authenticates with Worldpay (Basic Auth)
   ↓
4. Server creates payment session via REST API
   ↓
5. Server returns redirect URL
   ↓
6. Frontend redirects customer to Worldpay
   ↓
7. Customer completes payment on Worldpay
   ↓
8. Worldpay redirects to success/failure URL
   ↓
9. Webhook receives async notification (server-side)
   ↓
10. Order status updated in Strapi
```

---

## Architecture

### 🗂️ File Structure

```
nuxt-frontend/
├── server/
│   └── api/
│       └── worldpay/
│           ├── create-payment.post.ts  ✅ Payment initiation
│           └── webhook.post.ts         ✅ Async notifications
├── pages/
│   ├── checkout/
│   │   └── index.vue                   ✅ Updated to use new API
│   └── payment/
│       ├── success.vue                 ✅ Success page
│       ├── failure.vue                 ✅ Failure page
│       └── cancelled.vue               ✅ Cancelled page
├── types/
│   └── worldpay.ts                     ✅ TypeScript interfaces
├── .env                                ✅ Environment variables
└── nuxt.config.ts                      ✅ Runtime config
```

### 🔐 Security Layers

1. **Server-Side Only Credentials**
   - All Worldpay credentials stored in `runtimeConfig` (server-side)
   - Never exposed to frontend/client
   - Basic Auth credentials base64 encoded in memory only

2. **HTTPS Only**
   - All API calls to Worldpay use HTTPS
   - Redirect URLs should use HTTPS in production

3. **Webhook Validation**
   - Idempotency check (prevent duplicate processing)
   - Event ID tracking
   - Signature validation (optional, can be enabled)

---

## Security & PCI Compliance

### 🔒 PCI SAQ-A Scope

This integration qualifies for **PCI SAQ-A** (Self-Assessment Questionnaire A), the simplest level of PCI compliance:

#### Why SAQ-A?

- ✅ **No card data touches your server**
- ✅ **Customer enters card details on Worldpay's hosted page**
- ✅ **You never store, process, or transmit card data**
- ✅ **All payment processing is outsourced to Worldpay**

#### Your Responsibilities (SAQ-A)

1. ✅ Use HTTPS for all pages that redirect to payment page
2. ✅ Don't store any card data (we don't)
3. ✅ Use iframe/redirect to Worldpay (we use redirect)
4. ✅ Validate PCI DSS compliance of service provider (Worldpay is PCI DSS Level 1)

### 🛡️ Why Credentials MUST Be Server-Side

**❌ NEVER expose these to frontend:**

```javascript
// ❌ BAD - NEVER DO THIS
const credentials = {
  username: 'my-username',  // Exposed in browser!
  password: 'my-password'   // Exposed in browser!
}
```

**✅ CORRECT - Server-side only:**

```typescript
// ✅ GOOD - Server-side route
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const username = config.worldpayUsername; // Server-side only
  const password = config.worldpayPassword; // Server-side only
  
  // Create Basic Auth header server-side
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  
  // Call Worldpay API with credentials
  const response = await $fetch('https://try.access.worldpay.com/...', {
    headers: { Authorization: authHeader }
  });
  
  return response;
});
```

**Why?**
- Browser DevTools can inspect all frontend code
- Anyone can see API credentials in frontend code
- Attackers could use your credentials to process fraudulent payments
- You'd be liable for unauthorized charges

### 🔐 Webhook Security

Webhooks MUST be server-side because:

1. **Authentication** - Requires Worldpay credentials
2. **Database Access** - Updates order status in Strapi
3. **Idempotency** - Prevents duplicate processing
4. **Business Logic** - Triggers fulfillment, emails, etc.

---

## Prerequisites

### Required Accounts

1. **Worldpay Account**
   - Sandbox: https://developer.worldpay.com/
   - Production: https://secure.worldpay.com/

2. **Strapi Backend** (optional, for order management)
   - Running at `http://localhost:1337` or production URL

### Required Credentials

Get these from Worldpay Business Gateway:

1. **API Username** - Your API user credentials
2. **API Password** - Your API password
3. **Merchant Entity ID** - Your merchant entity identifier

#### 📖 How to Get Credentials

**Step 1: Login to Worldpay Business Gateway**

- **Sandbox:** https://secure-test.worldpay.com/sso/public/auth/login.html
- **Production:** https://secure.worldpay.com/sso/public/auth/login.html

**Step 2: Navigate to API Credentials**

1. Click **"Integrations"** in left menu
2. Click **"API Credentials"**
3. Create new API user or view existing credentials
4. Copy **Username** and **Password**

**Step 3: Get Merchant Entity ID**

1. Click **"Account"** in left menu
2. Find **"Merchant Entity"** or **"Entity ID"**
3. Copy the value (e.g., `default` or alphanumeric ID)

---

## Installation

### 1. Files Already Created ✅

All files have been created in your project:

```
✅ /types/worldpay.ts
✅ /server/api/worldpay/create-payment.post.ts
✅ /server/api/worldpay/webhook.post.ts
✅ /pages/payment/success.vue
✅ /pages/payment/failure.vue
✅ /pages/payment/cancelled.vue
✅ /pages/checkout/index.vue (updated)
✅ /nuxt.config.ts (updated)
✅ /.env (updated structure)
```

### 2. Install Dependencies

No additional npm packages required! Uses Nuxt 3 built-in `$fetch`.

---

## Configuration

### 1. Update .env File

```bash
# ========================================
# WORLDPAY PAYMENT GATEWAY - REST API
# ========================================

# API Credentials (from Worldpay Business Gateway)
WORLDPAY_USERNAME=your-api-username
WORLDPAY_PASSWORD=your-api-password
WORLDPAY_MERCHANT_ENTITY=your-merchant-entity-id

# Base URL
# Sandbox
WORLDPAY_BASE_URL=https://try.access.worldpay.com
# Production (uncomment when going live)
# WORLDPAY_BASE_URL=https://access.worldpay.com

# ========================================
# STRAPI BACKEND CONFIGURATION
# ========================================
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token

# ========================================
# APP CONFIGURATION
# ========================================
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Verify nuxt.config.ts

Already configured! No changes needed.

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Start fresh
cd nuxt-frontend
npm run dev
```

---

## Testing

### Test Workflow

#### 1. Test Payment Initiation

```bash
# Test the create-payment endpoint directly
curl -X POST http://localhost:3000/api/worldpay/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "orderNumber": "TEST-001",
    "amount": 45.99,
    "currency": "GBP",
    "customer": {
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "07700900000",
      "address": {
        "line1": "123 Test Street",
        "city": "London",
        "postcode": "SW1A 1AA",
        "country": "GB"
      }
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "redirectUrl": "https://try.access.worldpay.com/...",
  "orderId": 1,
  "transactionReference": "TEST-001-1708368000000"
}
```

#### 2. Test Full Checkout Flow

1. Add items to cart
2. Go to `/checkout`
3. Fill in checkout form
4. Click "Pay Now"
5. You'll be redirected to Worldpay test environment
6. Use test card details (see below)
7. Complete payment
8. Check redirect to success page
9. Verify webhook received in terminal logs

### Worldpay Test Cards

#### ✅ Successful Payment

```
Card Number: 4444 3333 2222 1111
Expiry: 12/25 (any future date)
CVV: 123
Name: Test User
```

#### ❌ Declined Payment

```
Card Number: 4444 3333 2222 0000
Expiry: 12/25
CVV: 123
Name: Test User
```

#### 🔒 3D Secure Test

```
Card Number: 4444 3333 2222 1111
3DS Password: 123456
```

### Test Webhook Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Configure in Worldpay Business Gateway:
# Webhooks > Add Webhook
# URL: https://abc123.ngrok.io/api/worldpay/webhook
```

---

## Production Deployment

### 1. Get Production Credentials

1. Login to **Production** Worldpay Business Gateway
2. Get production API username, password, merchant entity
3. Update production environment variables

### 2. Update Environment Variables

```bash
# Production .env
WORLDPAY_USERNAME=prod-api-username
WORLDPAY_PASSWORD=prod-api-password
WORLDPAY_MERCHANT_ENTITY=prod-merchant-entity
WORLDPAY_BASE_URL=https://access.worldpay.com

NUXT_PUBLIC_SITE_URL=https://carafecoffee.co.uk
NUXT_PUBLIC_STRAPI_URL=https://admin.carafecoffee.co.uk
```

### 3. Configure Webhook in Production

1. Login to Worldpay Production Business Gateway
2. Go to **Account > Webhooks**
3. Add webhook URL: `https://carafecoffee.co.uk/api/worldpay/webhook`
4. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `payment.cancelled`
   - `payment.refunded`
5. Save and activate

### 4. Test in Production

1. Create test order with small amount (£0.01)
2. Use real card (or test card if available in production mode)
3. Verify payment flow works end-to-end
4. Check webhook notifications received
5. Verify order status updated in Strapi

### 5. SSL/HTTPS Required

Ensure:
- ✅ Your domain has valid SSL certificate
- ✅ All URLs use `https://`
- ✅ Redirect URLs in Worldpay config use `https://`

---

## Troubleshooting

### Issue: "Worldpay credentials not configured"

**Cause:** Environment variables not set or not loaded

**Solution:**
```bash
# Check .env file exists and has values
cat nuxt-frontend/.env

# Restart dev server to load new env vars
npm run dev
```

### Issue: "401 Unauthorized" from Worldpay

**Cause:** Incorrect API username or password

**Solution:**
1. Verify credentials in Worldpay Business Gateway
2. Make sure you're using **API credentials**, not login credentials
3. Check for typos in `.env` file
4. Ensure no extra spaces in credentials

### Issue: "No redirect URL received"

**Cause:** Worldpay API returned error or unexpected response

**Solution:**
1. Check server terminal logs for detailed error
2. Look for Worldpay error response in logs
3. Common issues:
   - Invalid merchant entity ID
   - Wrong base URL (sandbox vs production)
   - Missing required fields in request

### Issue: "Webhook not receiving events"

**Cause:** Webhook URL not accessible or not configured

**Solution:**
1. Verify webhook URL is publicly accessible
2. Check Worldpay webhook configuration
3. Use ngrok for local testing
4. Check server logs for incoming webhook requests

### Issue: "Order status not updating"

**Cause:** Strapi token missing or insufficient permissions

**Solution:**
1. Verify `STRAPI_API_TOKEN` is set in `.env`
2. Check token has permissions to update orders
3. Look for errors in webhook handler logs

---

## API Reference

### POST /api/worldpay/create-payment

Create a payment session and get redirect URL.

**Request Body:**

```typescript
{
  orderId: number;
  orderNumber: string;
  amount: number;  // Major units (e.g., 45.99)
  currency: string;  // ISO 4217 (e.g., "GBP")
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
      country: string;  // ISO 3166-1 alpha-2
    };
  };
}
```

**Success Response (200):**

```typescript
{
  success: true;
  redirectUrl: string;  // URL to redirect customer to
  orderId: number;
  transactionReference: string;
}
```

**Error Response (400/500):**

```typescript
{
  statusCode: number;
  message: string;
  data?: {
    errorName: string;
    description: string;
    customCode: string;
  };
}
```

### POST /api/worldpay/webhook

Receive async payment notifications from Worldpay.

**Request Body:** (Sent by Worldpay)

```typescript
{
  eventId: string;
  eventTimestamp: string;
  eventType: string;
  merchantId: string;
  paymentStatus: string;
  _links: {
    "payments:events": {
      href: string;
    };
  };
}
```

**Response (200):**

```typescript
{
  received: true;
  eventId: string;
  eventType: string;
  processedAt: string;
}
```

---

## Environment Switching

### Sandbox → Production

```bash
# .env - Change these two lines:
WORLDPAY_BASE_URL=https://access.worldpay.com  # Change from try.access
# Update credentials to production values
```

### Local → Production Strapi

```bash
# .env
NUXT_PUBLIC_STRAPI_URL=https://admin.carafecoffee.co.uk
```

---

## Example curl Commands

### Test Payment Creation

```bash
curl -X POST http://localhost:3000/api/worldpay/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 123,
    "orderNumber": "ORD-123",
    "amount": 45.99,
    "currency": "GBP",
    "customer": {
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "07700900000",
      "address": {
        "line1": "123 Test St",
        "city": "London",
        "postcode": "SW1A 1AA",
        "country": "GB"
      }
    }
  }'
```

### Test Webhook (Simulate Worldpay)

```bash
curl -X POST http://localhost:3000/api/worldpay/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-event-123",
    "eventType": "payment.authorized",
    "eventTimestamp": "2026-02-19T12:00:00Z",
    "merchantId": "test-merchant",
    "paymentStatus": "SUCCESS"
  }'
```

---

## Migration from Old Integration

### What Changed?

| Old (URL Redirect) | New (REST API) |
|-------------------|----------------|
| `/api/payment/initiate` | `/api/worldpay/create-payment` |
| Query parameters | JSON POST body |
| No authentication | Basic Auth (base64) |
| `WORLDPAY_INSTALLATION_ID` | `WORLDPAY_MERCHANT_ENTITY` |
| `WORLDPAY_MERCHANT_CODE` | `WORLDPAY_USERNAME` + `WORLDPAY_PASSWORD` |
| Simple URL redirect | REST API + redirect URL |
| `/checkout/success` | `/payment/success` |

### Migration Steps

1. ✅ Keep old `.env` credentials as backup
2. ✅ Get new REST API credentials from Worldpay
3. ✅ Update `.env` with new credentials
4. ✅ Checkout page automatically updated
5. ✅ Test thoroughly in sandbox
6. ✅ Deploy to production

---

## Support & Resources

### Official Documentation

- **Worldpay Docs:** https://developer.worldpay.com/docs/wpg/hostedintegration
- **Worldpay Support:** support@worldpay.com
- **Developer Portal:** https://developer.worldpay.com/

### Your Integration Files

- **Server Routes:** `/server/api/worldpay/`
- **Types:** `/types/worldpay.ts`
- **Result Pages:** `/pages/payment/`
- **Config:** `/nuxt.config.ts`

### Need Help?

1. Check server terminal logs for detailed errors
2. Review Worldpay Business Gateway transaction logs
3. Test with curl commands to isolate issues
4. Check webhook delivery status in Worldpay dashboard
5. Contact Worldpay support with transaction references

---

## Summary

✅ **Complete REST API integration**  
✅ **Production-ready with error handling**  
✅ **PCI SAQ-A compliant**  
✅ **TypeScript type safety**  
✅ **Webhook support**  
✅ **Test & Production environments**  
✅ **Comprehensive documentation**  

**Next Steps:**

1. Get your Worldpay API credentials
2. Update `.env` file with credentials
3. Restart dev server
4. Test payment flow with test cards
5. Configure webhook URL
6. Deploy to production

Happy integrating! 🚀
