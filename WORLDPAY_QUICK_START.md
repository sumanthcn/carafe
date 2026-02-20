# Worldpay Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Worldpay Credentials (2 minutes)

1. **Login to Worldpay Business Gateway**
   - Sandbox: https://secure-test.worldpay.com/sso/public/auth/login.html

2. **Get API Credentials**
   - Navigate: **Integrations → API Credentials**
   - Create new API user if needed
   - Copy: **Username** and **Password**

3. **Get Merchant Entity ID**
   - Navigate: **Account → Merchant Entity**
   - Copy: **Entity ID** (usually `default` or alphanumeric)

### Step 2: Update .env File (1 minute)

```bash
cd nuxt-frontend
nano .env  # or use your editor
```

Update these 4 values:

```bash
WORLDPAY_USERNAME=your-api-username          # From step 1.2
WORLDPAY_PASSWORD=your-api-password          # From step 1.2
WORLDPAY_MERCHANT_ENTITY=default             # From step 1.3
WORLDPAY_BASE_URL=https://try.access.worldpay.com  # Sandbox URL
```

### Step 3: Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test Payment Flow (1.5 minutes)

1. **Add items to cart** on your site
2. **Go to checkout**: http://localhost:3000/checkout
3. **Fill in form** with test data
4. **Click "Pay Now"**
5. **You'll be redirected** to Worldpay test page
6. **Use test card**:
   - **Card Number:** `4444 3333 2222 1111` (Visa - Success)
   - **Expiry:** `12/30` (any future date)
   - **CVV:** `123`
   - **Cardholder Name:** Any name
   
   **Alternative Test Cards:**
   - `5555 5555 5555 4444` (Mastercard - Success)
   - `4111 1111 1111 1111` (Visa - Success)
   - `4917 6100 0000 0000` (Visa Debit - Success)

7. **Complete payment**
8. **Redirected to success page** ✅

---

## ✅ What's Different from Old Integration?

| Feature | Old | New (REST API) |
|---------|-----|---------------|
| **API Endpoint** | `/api/payment/initiate` | `/api/worldpay/create-payment` |
| **Authentication** | No auth (URL params) | Basic Auth (secure) |
| **Credentials** | `MERCHANT_CODE` + `INSTALLATION_ID` | `USERNAME` + `PASSWORD` + `ENTITY` |
| **Method** | Simple redirect | REST API → redirect |
| **Success Page** | `/checkout/success` | `/payment/success` |
| **Error Handling** | Basic | Comprehensive |
| **Webhook** | Not implemented | ✅ Implemented |
| **Type Safety** | None | Full TypeScript |

---

## 📁 New Files Created

```
✅ /types/worldpay.ts                           TypeScript interfaces
✅ /server/api/worldpay/create-payment.post.ts  Payment initiation
✅ /server/api/worldpay/webhook.post.ts         Async notifications
✅ /pages/payment/success.vue                   Success page
✅ /pages/payment/failure.vue                   Failure page
✅ /pages/payment/cancelled.vue                 Cancelled page
✅ /WORLDPAY_INTEGRATION.md                     Full documentation
```

**Updated:**
- ✏️ `/pages/checkout/index.vue` - Uses new API
- ✏️ `/nuxt.config.ts` - New runtime config
- ✏️ `/.env` - New credential structure

---

## 🧪 Test API Directly (curl)

```bash
curl -X POST http://localhost:3000/api/worldpay/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "orderNumber": "TEST-001",
    "amount": 10.00,
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

**Expected Output:**
```json
{
  "success": true,
  "redirectUrl": "https://try.access.worldpay.com/...",
  "orderId": 1,
  "transactionReference": "TEST-001-1708368000000"
}
```

---

## 🐛 Troubleshooting

### Error: "Worldpay credentials not configured"

```bash
# Check .env file
cat .env | grep WORLDPAY

# Should show:
# WORLDPAY_USERNAME=...
# WORLDPAY_PASSWORD=...
# WORLDPAY_MERCHANT_ENTITY=...

# Restart dev server
npm run dev
```

### Error: "401 Unauthorized"

**Cause:** Wrong credentials

**Fix:**
1. Double-check credentials in Worldpay Business Gateway
2. Ensure no extra spaces in `.env`
3. Use **API credentials**, not login credentials

### Error: "No redirect URL received"

**Cause:** Worldpay API error

**Fix:**
1. Check server terminal for detailed error
2. Verify `WORLDPAY_MERCHANT_ENTITY` is correct
3. Ensure using sandbox URL for testing

---

## 🌐 Going Live (Production)

### 1. Get Production Credentials

- Login to **Production** Worldpay (not sandbox)
- Get production API credentials
- Get production merchant entity

### 2. Update .env

```bash
WORLDPAY_USERNAME=prod-api-username
WORLDPAY_PASSWORD=prod-api-password
WORLDPAY_MERCHANT_ENTITY=prod-entity-id
WORLDPAY_BASE_URL=https://access.worldpay.com  # Remove 'try'

NUXT_PUBLIC_SITE_URL=https://carafecoffee.co.uk
```

### 3. Configure Webhook

- Login to Production Worldpay
- Go to: **Account → Webhooks**
- Add: `https://carafecoffee.co.uk/api/worldpay/webhook`
- Select events: `payment.*`
- Save & activate

### 4. Test with Real Payment

- Create £0.01 test order
- Use real card
- Verify full flow works
- Check webhook received

---

## 📚 Documentation

- **Full Guide:** [WORLDPAY_INTEGRATION.md](../WORLDPAY_INTEGRATION.md)
- **Worldpay Docs:** https://developer.worldpay.com/docs/wpg/hostedintegration
- **Support:** support@worldpay.com

---

## ✅ Checklist

- [ ] Got Worldpay API credentials
- [ ] Updated `.env` with 4 required values
- [ ] Restarted dev server
- [ ] Tested payment with test card
- [ ] Saw success page after payment
- [ ] Checked terminal logs (no errors)
- [ ] Ready for production!

---

**Questions?** Check [WORLDPAY_INTEGRATION.md](../WORLDPAY_INTEGRATION.md) for complete documentation.

**Happy Integrating! 🚀**
