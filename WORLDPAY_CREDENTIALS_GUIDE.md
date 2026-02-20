# Worldpay Hosted Payment Pages - Complete Setup Guide

## Overview

Your integration now uses **Worldpay Hosted Payment Pages** - a redirect-based payment flow where customers are sent to Worldpay's secure payment page and then redirected back to your site.

### Payment Flow:
1. ✅ Customer fills checkout form on your site
2. ✅ Your backend creates order in Strapi
3. ✅ Your backend generates Worldpay payment URL
4. ✅ Customer is redirected to Worldpay's payment page
5. ✅ Customer completes payment on Worldpay
6. ✅ Worldpay redirects back to your success/failure page
7. ✅ Order status is updated

## Required Credentials (Only 2 things!)

For Worldpay Hosted Payment Pages, you only need:
1. **Merchant Code** (e.g., `PO4086818161`)
2. **Installation ID** (e.g., `511e3dd8-0bba-430f-af56-917b0d8999d2`)

❌ **You DON'T need XML Username or XML Password for Hosted Payment Pages!**

## Getting Your Credentials

### Step 1: Login to Worldpay Business Gateway

**For Testing:**
- URL: https://secure-test.worldpay.com/sso/public/auth/login.html
- Use your test account credentials
- If you don't have one, sign up at: https://developer.worldpay.com/

**For Production:**
- URL: https://secure.worldpay.com/sso/public/auth/login.html
- Use your production account credentials

### Step 2: Find Your Merchant Code

1. After logging in, look at the top of the page
2. You'll see **"Merchant Code: XXXXXXXXX"**
3. Copy this value (e.g., `PO4086818161`)

### Step 3: Get Installation ID

1. In the left menu, click **"Installations"**
2. You'll see a list of installations
3. Click on the installation you want to use (usually called "Production" or "Test")
4. On the installation details page, find the **Installation ID**
   - It's usually displayed at the top: `Installation ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
5. Copy this UUID value

### Step 4: Enable Hosted Payment Pages (If Not Already Enabled)

1. In your Installation details page
2. Click **"Edit Installation"**
3. Scroll to **"Payment Methods"** section
4. Make sure **"Hosted Payment Pages"** is enabled/checked
5. Configure the payment methods you want to accept:
   - ✅ Credit/Debit Cards
   - ✅ Visa
   - ✅ Mastercard
   - ✅ American Express
   - etc.
6. Click **"Save"**

### Step 5: Configure Callback URLs (Important!)

1. In your Installation settings, find **"Payment Response"** section
2. Set the following URLs:

**For Local Development:**
```
Success URL: http://localhost:3000/checkout/success
Cancel URL: http://localhost:3000/checkout?error=payment_cancelled
Error URL: http://localhost:3000/checkout?error=payment_failed
```

**For Production:**
```
Success URL: https://yourdomain.com/checkout/success
Cancel URL: https://yourdomain.com/checkout?error=payment_cancelled
Error URL: https://yourdomain.com/checkout?error=payment_failed
```

3. Enable **"Pass payment parameters to callback URL"**
4. Save the changes

### Step 6: Update Your .env File

Only 2 values needed!

### Step 6: Update Your .env File

Only 2 values needed!

```bash
# Worldpay Hosted Payment Pages Credentials
WORLDPAY_MERCHANT_CODE=PO4086818161
WORLDPAY_INSTALLATION_ID=511e3dd8-0bba-430f-af56-917b0d8999d2

# You can remove or ignore these (not needed for Hosted Payment Pages):
# WORLDPAY_XML_USERNAME=...
# WORLDPAY_XML_PASSWORD=...
```

### Step 7: Test the Integration

1. **Restart your Nuxt dev server** (Ctrl+C and run `npm run dev`)
2. Go to your website and add items to cart
3. Click "Proceed to Checkout"
4. Fill in the checkout form
5. Click **"Pay Now"**
6. You should be redirected to Worldpay's test payment page
7. Use Worldpay test card numbers to complete payment
8. You'll be redirected back to your success page

## Worldpay Test Card Numbers

For testing in test mode, use these card numbers:

### Successful Payments:
```
Card Number: 4444 3333 2222 1111
Expiry: Any future date (e.g., 12/25)
CVV: 123
Name: Test User
```

### Declined Payment (to test failure):
```
Card Number: 4444 3333 2222 0000
Expiry: Any future date
CVV: 123
Name: Test User
```

### 3D Secure Test:
```
Card Number: 4444 3333 2222 1111
When prompted for 3D Secure, enter: 123456
```

## Troubleshooting

### "Transaction not found" or "Invalid Installation"

**Problem:** Installation ID doesn't match or isn't configured correctly

**Solution:**
1. Go to Worldpay Business Gateway
2. Navigate to **Installations**
3. Make sure you're using the correct Installation ID
4. Verify that Hosted Payment Pages is enabled
5. Update your `.env` file with the correct Installation ID
6. Restart dev server

### "Payment parameters not received"

**Problem:** Callback URLs not configured

**Solution:**
1. In Worldpay Installation settings
2. Go to **Payment Response** section
3. Add your callback URLs (success, cancel, error)
4. Enable "Pass payment parameters to callback URL"
5. Save changes

### Payment succeeds but order status doesn't update

**Problem:** Success callback might not be hitting your server

**Solution:**
1. Check your success page URL is correct in Worldpay settings
2. Verify the `orderId` parameter is being passed in the callback URL
3. Check server logs for any errors when processing the callback
4. Make sure STRAPI_API_TOKEN is configured in your `.env` file

### Still seeing 401 Unauthorized

**Problem:** This shouldn't happen with Hosted Payment Pages since there's no authentication required

**Solution:**
1. Make sure you restarted the dev server after code changes
2. Clear browser cache
3. Check that you're using the correct Worldpay URL:
   - Test: `https://secure-test.worldpay.com/wcc/purchase`
   - Production: `https://secure.worldpay.com/wcc/purchase`

## Production Deployment

When going live:

1. **Get Production Credentials:**
   - Login to production Worldpay account
   - Get production Merchant Code
   - Get production Installation ID

2. **Update Environment Variables:**
   ```bash
   WORLDPAY_MERCHANT_CODE=YOUR_PROD_MERCHANT_CODE
   WORLDPAY_INSTALLATION_ID=YOUR_PROD_INSTALLATION_ID
   WORLDPAY_ENV=live
   ```

3. **Update Callback URLs:**
   - In production Worldpay Installation settings
   - Set callback URLs to your production domain
   - Example: `https://carafecoffee.co.uk/checkout/success`

4. **Enable Production Mode:**
   - Set `WORLDPAY_ENV=live` in production environment variables
   - This will use the production Worldpay URL

## What Changed in Your Integration?

✅ **Before:** XML Direct API (complex, required XML username/password, got 401 errors)  
✅ **Now:** Hosted Payment Pages (simple, only needs merchant code + installation ID)

### Benefits of Hosted Payment Pages:
- ✨ **Simpler** - Only 2 credentials needed
- 🔒 **More Secure** - PCI compliance handled by Worldpay
- 💳 **Better UX** - Professional payment page
- 🌍 **Multiple Payment Methods** - Cards, Apple Pay, Google Pay, etc.
- 🔧 **Easier Maintenance** - No complex XML handling

## Need Help?

### Worldpay Support:
- **Email:** support@worldpay.com  
- **Documentation:** https://developer.worldpay.com/docs/wpg/hostedintegration
- **Test Account:** https://developer.worldpay.com/

### Check Your Integration:
1. Terminal logs will show exactly what URL is being generated
2. You can copy the URL and paste it in a browser to see the payment page directly
3. Check browser console for any JavaScript errors
4. Check Worldpay Business Gateway for transaction logs

## Current Configuration Status

Your `.env` file currently has:
```
WORLDPAY_MERCHANT_CODE=PO4086818161
WORLDPAY_INSTALLATION_ID=511e3dd8-0bba-430f-af56-917b0d8999d2
```

This should work! If you're still having issues:
1. Verify these credentials in your Worldpay account
2. Make sure Hosted Payment Pages is enabled
3. Configure callback URLs
4. Restart your dev server
5. Try a test payment

