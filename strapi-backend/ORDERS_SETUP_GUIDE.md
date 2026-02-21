# Orders Setup Guide

This guide will help you add sample orders to Strapi so you can test the order management system.

## Method 1: Using the Seed Script (Recommended)

### Prerequisites
- Strapi backend must be running on `http://localhost:1337`
- Node.js installed

### Steps

1. **Navigate to Strapi backend directory:**
```bash
cd strapi-backend
```

2. **Run the seed script:**
```bash
node scripts/seed-orders.js
```

3. **What the script does:**
   - Creates a test user account (`john@example.com`)
   - Generates 4 sample orders with different statuses
   - Links orders to the test user
   - Includes complete order data (items, addresses, payments, tracking)

4. **Test account credentials:**
   - Email: `john@example.com`
   - Password: `Test123!`

5. **Login and view orders:**
   - Start the Nuxt frontend: `cd nuxt-frontend && npm run dev`
   - Visit: `http://localhost:3000/login`
   - Login with the test account
   - Navigate to "My Orders" to see the orders

---

## Method 2: Manual Entry via Strapi Admin Panel

### Step 1: Create a Test User

1. Go to Strapi admin: `http://localhost:1337/admin`
2. Navigate to: **Content Manager → Users (users-permissions plugin)**
3. Click **"Create new entry"**
4. Fill in:
   - **Username**: `johndoe`
   - **Email**: `john@example.com`
   - **Password**: `Test123!` (you'll need to set this via database later)
   - **Confirmed**: ✅ checked
   - **Blocked**: ❌ unchecked
5. Click **Save**
6. Note the user ID (you'll see it in the URL)

### Step 2: Create an Order

1. Navigate to: **Content Manager → Orders**
2. Click **"Create new entry"**
3. Fill in the following fields:

#### Basic Information
```
Order Number: ORD-2024-1001
Status: delivered
Customer Email: john@example.com
Customer Name: John Doe
Customer Phone: +353 1 234 5678
```

#### Shipping Address (Component)
Click "Add component" for Shipping Address:
```
Full Name: John Doe
Address Line 1: 123 Main Street
Address Line 2: Apartment 4B
City: Dublin
County: Dublin
Postal Code: D02 X285
Country: Ireland
Phone: +353 1 234 5678
```

#### Billing Address (Component)
Same as shipping address above.

#### Order Items (Component - Repeatable)
Click "Add component" for each item:

**Item 1:**
```
Product ID: 1
Product Name: Ethiopian Yirgacheffe
Product Slug: ethiopian-yirgacheffe
SKU: ETH-YIRG-250
Quantity: 2
Unit Price: 12.50
Total Price: 25.00
Weight: 250g
```

**Item 2:**
```
Product ID: 2
Product Name: Colombian Supremo
Product Slug: colombian-supremo
SKU: COL-SUPR-250
Quantity: 1
Unit Price: 11.00
Total Price: 11.00
Weight: 250g
```

#### Financial Details
```
Subtotal: 36.00
Shipping Cost: 4.95
Tax: 0
Discount: 0
Total: 40.95
Currency: EUR
```

#### Payment Information
```
Payment Method: Worldpay
Payment ID: pay_abc123def456
Payment Status: captured
Worldpay Order Code: WP-12345678
```

#### Shipping Details
```
Shipping Method: Standard Shipping
Carrier: An Post
Tracking Number: RL123456789IE
Dispatched At: 2024-02-18 10:30:00
Delivered At: 2024-02-20 14:15:00
```

#### Additional Fields
```
Notes: Please leave at the front door if not home
User: [Select the user you created - johndoe]
Order Tracking Token: track_1234567890_abc123
Is Guest Order: ❌ unchecked
```

4. Click **Save** to create the order

### Step 3: Create More Sample Orders

Repeat Step 2 with these variations:

#### Order 2 - Shipped Status
```json
{
  "orderNumber": "ORD-2024-1002",
  "status": "shipped",
  "customerEmail": "john@example.com",
  "customerName": "John Doe",
  "items": [
    {
      "productName": "Brazilian Santos",
      "quantity": 1,
      "unitPrice": 18.50,
      "totalPrice": 18.50,
      "weight": "500g"
    }
  ],
  "subtotal": 18.50,
  "shippingCost": 0,
  "total": 18.50,
  "trackingNumber": "DPD123456789IE"
}
```

#### Order 3 - Processing Status
```json
{
  "orderNumber": "ORD-2024-1003",
  "status": "processing",
  "customerEmail": "john@example.com",
  "customerName": "John Doe",
  "items": [
    {
      "productName": "House Blend",
      "quantity": 2,
      "unitPrice": 14.00,
      "totalPrice": 28.00,
      "weight": "250g"
    }
  ],
  "subtotal": 28.00,
  "shippingCost": 4.95,
  "total": 32.95,
  "trackingNumber": null
}
```

#### Order 4 - Pending Status
```json
{
  "orderNumber": "ORD-2024-1004",
  "status": "order_received",
  "customerEmail": "john@example.com",
  "customerName": "John Doe",
  "items": [
    {
      "productName": "Decaf Swiss Water",
      "quantity": 1,
      "unitPrice": 13.50,
      "totalPrice": 13.50,
      "weight": "250g"
    }
  ],
  "subtotal": 13.50,
  "shippingCost": 4.95,
  "total": 18.45,
  "paymentStatus": "pending"
}
```

---

## Method 3: Using Strapi API (Advanced)

You can also create orders via API calls using curl or Postman:

### 1. Get an authentication token

```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "Test123!"
  }'
```

Save the JWT token from the response.

### 2. Create an order

```bash
curl -X POST http://localhost:1337/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "data": {
      "orderNumber": "ORD-2024-1005",
      "status": "order_received",
      "customerEmail": "john@example.com",
      "customerName": "John Doe",
      "customerPhone": "+353 1 234 5678",
      "shippingAddress": {
        "fullName": "John Doe",
        "addressLine1": "123 Main Street",
        "addressLine2": "Apartment 4B",
        "city": "Dublin",
        "county": "Dublin",
        "postalCode": "D02 X285",
        "country": "Ireland",
        "phone": "+353 1 234 5678"
      },
      "billingAddress": {
        "fullName": "John Doe",
        "addressLine1": "123 Main Street",
        "addressLine2": "Apartment 4B",
        "city": "Dublin",
        "county": "Dublin",
        "postalCode": "D02 X285",
        "country": "Ireland",
        "phone": "+353 1 234 5678"
      },
      "items": [
        {
          "productId": 1,
          "productName": "Ethiopian Yirgacheffe",
          "productSlug": "ethiopian-yirgacheffe",
          "sku": "ETH-YIRG-250",
          "quantity": 2,
          "unitPrice": 12.50,
          "totalPrice": 25.00,
          "weight": "250g"
        }
      ],
      "subtotal": 25.00,
      "shippingCost": 4.95,
      "tax": 0,
      "discount": 0,
      "total": 29.95,
      "currency": "EUR",
      "paymentMethod": "Worldpay",
      "paymentStatus": "captured",
      "paymentId": "pay_test123",
      "worldpayOrderCode": "WP-TEST001",
      "shippingMethod": "Standard Shipping",
      "orderTrackingToken": "track_' + Date.now() + '_abc"
    }
  }'
```

---

## Order Status Values

Use these exact values when creating orders:

| Strapi Status | Display Name | Description |
|--------------|--------------|-------------|
| `order_received` | Pending | Order just placed |
| `packed` | Processing | Order being prepared |
| `shipped` | Shipped | Out for delivery |
| `in_transit` | In Transit | On the way |
| `delivered` | Delivered | Successfully delivered |
| `cancelled` | Cancelled | Order cancelled |
| `refunded` | Refunded | Payment refunded |

## Payment Status Values

| Value | Description |
|-------|-------------|
| `pending` | Awaiting payment |
| `authorized` | Payment authorized |
| `captured` | Payment successful |
| `failed` | Payment failed |
| `refunded` | Payment refunded |

---

## Troubleshooting

### Issue: "No orders to display" in frontend

**Possible causes:**
1. User not logged in
2. Orders not linked to the logged-in user
3. API endpoint not accessible

**Solutions:**
1. Make sure you're logged in with `john@example.com`
2. Check that orders have the correct user relation in Strapi
3. Check browser console for API errors
4. Verify Strapi is running on port 1337

### Issue: Seed script fails

**Check:**
1. Strapi is running: `curl http://localhost:1337/_health`
2. No port conflicts
3. Database is accessible
4. Run `npm install` in strapi-backend directory

### Issue: Cannot create orders in admin panel

**Solutions:**
1. Make sure you're logged in as admin
2. Check user has correct permissions
3. Verify all required fields are filled
4. Check Strapi logs for errors

---

## Quick Test Commands

### Check if Strapi is running:
```bash
curl http://localhost:1337/_health
```

### Check if orders exist:
```bash
curl http://localhost:1337/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Count orders:
```bash
curl http://localhost:1337/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data | length'
```

---

## Need Help?

If you're still having issues:
1. Check Strapi logs in terminal
2. Check browser console for frontend errors
3. Verify database contains the orders
4. Try the seed script method first - it's the most reliable
