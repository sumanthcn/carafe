# Worldpay Integration - Folder Structure

## 📂 Complete Project Structure

```
carafe_website/
├── nuxt-frontend/
│   ├── server/
│   │   └── api/
│   │       ├── worldpay/                    🆕 NEW FOLDER
│   │       │   ├── create-payment.post.ts   ✅ Payment initiation endpoint
│   │       │   └── webhook.post.ts          ✅ Webhook handler
│   │       └── payment/                     📦 OLD (can be removed)
│   │           └── initiate.post.ts         ❌ Legacy endpoint
│   │
│   ├── pages/
│   │   ├── checkout/
│   │   │   ├── index.vue                    ✏️ UPDATED (uses new API)
│   │   │   └── success.vue                  📦 OLD success page
│   │   │
│   │   └── payment/                         🆕 NEW FOLDER
│   │       ├── success.vue                  ✅ New success page
│   │       ├── failure.vue                  ✅ Failure page
│   │       └── cancelled.vue                ✅ Cancelled page
│   │
│   ├── types/
│   │   ├── strapi.ts                        (existing)
│   │   └── worldpay.ts                      ✅ NEW - TypeScript interfaces
│   │
│   ├── components/                          (no changes needed)
│   ├── composables/                         (no changes needed)
│   ├── assets/                              (no changes needed)
│   ├── plugins/                             (no changes needed)
│   │
│   ├── .env                                 ✏️ UPDATED (new structure)
│   ├── .env.example                         ✏️ UPDATED (new structure)
│   ├── nuxt.config.ts                       ✏️ UPDATED (new runtime config)
│   ├── package.json                         (no changes needed)
│   └── tsconfig.json                        (no changes needed)
│
├── docs/
│   └── ... (existing docs)
│
├── WORLDPAY_INTEGRATION.md                  ✅ NEW - Complete guide
├── WORLDPAY_QUICK_START.md                  ✅ NEW - Quick setup
├── WORLDPAY_CREDENTIALS_GUIDE.md            📦 OLD (legacy guide)
└── README.md                                (existing)
```

---

## 🗂️ File Responsibilities

### Server Routes (`/server/api/worldpay/`)

#### `create-payment.post.ts`
**Purpose:** Payment initiation endpoint  
**Responsibilities:**
- Accepts order details from frontend
- Authenticates with Worldpay (Basic Auth)
- Creates payment session via REST API
- Returns redirect URL to frontend
- Updates order in Strapi (optional)

**Called by:** Checkout page when "Pay Now" clicked  
**Returns:** `{ success, redirectUrl, orderId, transactionReference }`

#### `webhook.post.ts`
**Purpose:** Async payment notifications  
**Responsibilities:**
- Receives POST from Worldpay when payment status changes
- Validates webhook structure
- Prevents duplicate processing (idempotency)
- Fetches payment details from Worldpay
- Updates order status in Strapi
- Triggers fulfillment/emails

**Called by:** Worldpay (server-to-server)  
**Returns:** `{ received: true, eventId, eventType }`

---

### Frontend Pages (`/pages/`)

#### `checkout/index.vue`
**Updated:** Now calls `/api/worldpay/create-payment` instead of `/api/payment/initiate`  
**Purpose:** Checkout form and payment initiation  
**Flow:**
1. Customer fills form
2. Creates order in Strapi
3. Calls `/api/worldpay/create-payment`
4. Redirects to Worldpay hosted page

#### `payment/success.vue`
**Purpose:** Payment success confirmation  
**Query Params:** `?orderId=123&ref=ORDER-123-456`  
**Displays:**
- Success icon (green checkmark)
- Order number
- Transaction reference
- Order total
- Next steps (track order, continue shopping)

#### `payment/failure.vue`
**Purpose:** Payment failure notification  
**Query Params:** `?orderId=123&ref=ORDER-123-456`  
**Displays:**
- Error icon (red X)
- Common failure reasons
- "Try Again" button
- Contact support link

#### `payment/cancelled.vue`
**Purpose:** Payment cancellation notification  
**Query Params:** `?orderId=123`  
**Displays:**
- Warning icon (yellow)
- Cancellation message
- "Complete Payment" button
- Continue shopping link

---

### TypeScript Types (`/types/worldpay.ts`)

**Purpose:** Type safety for Worldpay API  
**Exports:**
- `WorldpayPaymentRequest` - Request to Worldpay API
- `WorldpayPaymentResponse` - Response from Worldpay API
- `CreatePaymentRequest` - Frontend to backend request
- `PaymentInitiationResponse` - Backend to frontend response
- `WorldpayWebhookEvent` - Webhook payload structure
- `WebhookPaymentDetails` - Payment details from webhook
- `WorldpayError` - Error response structure
- `WorldpayConfig` - Configuration interface

---

### Configuration Files

#### `.env`
**Purpose:** Environment variables (NOT committed to git)  
**Contains:**
- `WORLDPAY_USERNAME` - API username (secret)
- `WORLDPAY_PASSWORD` - API password (secret)
- `WORLDPAY_MERCHANT_ENTITY` - Merchant entity ID
- `WORLDPAY_BASE_URL` - API base URL (sandbox/production)
- `STRAPI_API_TOKEN` - Strapi authentication token
- `NUXT_PUBLIC_SITE_URL` - Your site URL
- `NUXT_PUBLIC_STRAPI_URL` - Strapi URL

#### `.env.example`
**Purpose:** Template for .env (committed to git)  
**Contains:** Same structure as .env with placeholder values

#### `nuxt.config.ts`
**Purpose:** Nuxt configuration  
**Updated Section:** `runtimeConfig`  
**New Properties:**
- `worldpayUsername` (server-side only)
- `worldpayPassword` (server-side only)
- `worldpayMerchantEntity` (server-side only)
- `worldpayBaseUrl` (server-side only)

---

## 🔒 Security Architecture

### Server-Side Only (Never Exposed)
```
nuxt-frontend/
└── server/
    └── api/
        └── worldpay/
            ├── create-payment.post.ts   🔐 Has access to secrets
            └── webhook.post.ts          🔐 Has access to secrets
```

**These files:**
- ✅ Run on server only
- ✅ Can access `runtimeConfig` secrets
- ✅ Handle authentication
- ✅ Make API calls to Worldpay
- ❌ Never sent to browser

### Client-Side (Public)
```
nuxt-frontend/
└── pages/
    ├── checkout/
    └── payment/
```

**These files:**
- ✅ Run in browser
- ❌ Cannot access secrets
- ✅ Only know redirect URL (public)
- ✅ Display UI to customer

---

## 📊 Data Flow

### Payment Initiation Flow

```
1. Customer
   ↓ (fills form)
2. pages/checkout/index.vue
   ↓ (submits form)
3. server/api/worldpay/create-payment.post.ts
   ↓ (authenticates with Worldpay)
4. Worldpay REST API
   ↓ (returns redirect URL)
5. server/api/worldpay/create-payment.post.ts
   ↓ (returns to frontend)
6. pages/checkout/index.vue
   ↓ (redirects customer)
7. Worldpay Hosted Payment Page
   ↓ (customer completes payment)
8. pages/payment/success.vue
```

### Webhook Notification Flow

```
1. Customer completes payment on Worldpay
   ↓
2. Worldpay processes payment
   ↓
3. Worldpay sends webhook
   ↓
4. server/api/worldpay/webhook.post.ts
   ↓
5. Fetch payment details from Worldpay
   ↓
6. Update order in Strapi
   ↓
7. Trigger fulfillment (TODO)
   ↓
8. Send confirmation email (TODO)
```

---

## 🧹 Migration Cleanup

### Can Be Removed (After Testing)

```
nuxt-frontend/
└── server/
    └── api/
        └── payment/
            └── initiate.post.ts         ❌ Old endpoint
```

**When:** After confirming new integration works  
**Why:** No longer used, replaced by `/api/worldpay/create-payment`

### Can Be Archived

```
WORLDPAY_CREDENTIALS_GUIDE.md            📦 Old guide (URL redirect method)
```

**When:** After production deployment  
**Action:** Move to `docs/legacy/` folder

---

## 📝 File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| `create-payment.post.ts` | ~280 | Payment initiation |
| `webhook.post.ts` | ~310 | Webhook handler |
| `worldpay.ts` (types) | ~150 | TypeScript interfaces |
| `success.vue` | ~220 | Success page |
| `failure.vue` | ~250 | Failure page |
| `cancelled.vue` | ~180 | Cancelled page |

**Total New Code:** ~1,390 lines  
**Production-Ready:** ✅ Yes  
**Test Coverage:** Manual testing required  
**Documentation:** Complete

---

## 🎯 Key Files for Debugging

### When Payment Fails:

1. **Check:** `server/api/worldpay/create-payment.post.ts`
   - Line ~70: Credentials validation
   - Line ~140: Worldpay API call
   - Line ~220: Error handling

2. **Check:** Terminal logs
   - Look for "Worldpay API Error"
   - Check HTTP status codes
   - Review request/response payloads

3. **Check:** `.env` file
   - Verify credentials are correct
   - No extra spaces
   - Correct base URL

### When Webhook Doesn't Fire:

1. **Check:** Worldpay Business Gateway
   - Webhooks section
   - Verify URL is correct
   - Check delivery status

2. **Check:** `server/api/worldpay/webhook.post.ts`
   - Line ~40: Payload parsing
   - Line ~100: Order update logic
   - Terminal logs for incoming webhooks

3. **Check:** Network accessibility
   - Is webhook URL publicly accessible?
   - Use ngrok for local testing

---

## 🔍 Quick Reference

### Import Paths

```typescript
// Types
import type { WorldpayPaymentRequest } from '~/types/worldpay';

// Runtime Config
const config = useRuntimeConfig();
const username = config.worldpayUsername;

// Fetch API
const response = await $fetch('/api/worldpay/create-payment', {
  method: 'POST',
  body: { /* ... */ }
});
```

### Environment Variables Access

```typescript
// Server-side only
const config = useRuntimeConfig();
config.worldpayUsername      // ✅ Works
config.worldpayPassword      // ✅ Works

// Client-side
const config = useRuntimeConfig();
config.public.siteUrl        // ✅ Works
config.worldpayUsername      // ❌ undefined (security)
```

---

## 📦 Dependencies

### No Additional Packages Required!

The integration uses:
- ✅ Nuxt 3 built-in `$fetch` (for API calls)
- ✅ Node.js `Buffer` (for base64 encoding)
- ✅ TypeScript (already in project)

**Zero new dependencies** = Less maintenance, faster builds! 🚀

---

**For complete documentation, see:** [WORLDPAY_INTEGRATION.md](../WORLDPAY_INTEGRATION.md)
