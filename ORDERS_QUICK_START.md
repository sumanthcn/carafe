# Quick Guide: Adding Sample Orders to Strapi

## 🚀 Fastest Method (Recommended)

### Step 1: Make sure Strapi is running
```bash
cd strapi-backend
npm run develop
```

Wait for Strapi to start (should show: "✔ Server started on http://localhost:1337")

### Step 2: Run the seed script (in a new terminal)
```bash
cd strapi-backend
npm run seed:orders
```

That's it! The script will:
- ✅ Create a test user account
- ✅ Generate 4 sample orders (Delivered, Shipped, Processing, Pending)
- ✅ Link all orders to the test user

### Step 3: Login and view orders

1. Start the Nuxt frontend (if not running):
```bash
cd nuxt-frontend
npm run dev
```

2. Visit: http://localhost:3000/login

3. Login with:
   - **Email**: `john@example.com`
   - **Password**: `Test123!`

4. Click on your profile icon → **My Orders**

---

## 📦 Sample Orders Created

The seed script creates 4 orders:

| Order Number | Status | Total | Items | Tracking |
|-------------|--------|-------|-------|----------|
| ORD-2024-1001 | Delivered | €40.95 | 2 items | RL123456789IE |
| ORD-2024-1002 | Shipped | €67.50 | 3 items | DPD123456789IE |
| ORD-2024-1003 | Processing | €46.95 | 1 item | - |
| ORD-2024-1004 | Delivered | €54.50 | 2 items | RL987654321IE |

---

## 🔧 Troubleshooting

### "Strapi is not running"
**Solution**: Make sure Strapi is started with `npm run develop` before running the seed script.

### "No orders to display" in frontend
**Solutions**:
1. Make sure you're logged in with `john@example.com`
2. Clear browser cache and try again
3. Check browser console for errors (F12 → Console tab)
4. Verify API is accessible: http://localhost:1337/api/orders (should require auth)

### Seed script fails
**Try**:
1. Delete the database and restart: `rm -rf .tmp` (in strapi-backend)
2. Restart Strapi: Stop it (Ctrl+C) and run `npm run develop` again
3. Run seed script again

---

## 📚 Full Documentation

For more detailed instructions including:
- Manual entry via Strapi admin panel
- Creating orders via API
- Custom order data
- Field definitions

See: [strapi-backend/ORDERS_SETUP_GUIDE.md](strapi-backend/ORDERS_SETUP_GUIDE.md)

---

## 🎯 Order Data Structure

When creating orders manually or via API, use this structure:

```json
{
  "orderNumber": "ORD-2024-XXXX",
  "status": "order_received|packed|shipped|in_transit|delivered|cancelled|refunded",
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name",
  "shippingAddress": {
    "fullName": "Full Name",
    "addressLine1": "Street Address",
    "city": "City",
    "postalCode": "Postal Code",
    "country": "Country"
  },
  "items": [
    {
      "productName": "Product Name",
      "quantity": 1,
      "unitPrice": 12.50,
      "totalPrice": 12.50,
      "weight": "250g"
    }
  ],
  "subtotal": 12.50,
  "shippingCost": 4.95,
  "total": 17.45,
  "currency": "EUR",
  "paymentStatus": "captured",
  "paymentMethod": "Worldpay",
  "shippingMethod": "Standard Shipping"
}
```

---

## ✨ Features

The order management system now includes:
- 🎯 **Modern Filter UI**: Dropdown menu with checkboxes for multi-status selection
- 📊 **Active Filter Chips**: See what filters are applied with removable tags
- 📅 **Date Filters**: Filter by Last 3 Orders, Last Month, Last Year
- 🔍 **Results Count**: Shows how many orders match your filters
- 📱 **Accordion Cards**: Click to expand/collapse order details
- 🚀 **Smooth Animations**: Professional transitions and hover effects

---

## 🔄 Re-seeding Orders

To clear old test orders and create fresh ones:

```bash
cd strapi-backend
npm run seed:orders
```

The script automatically:
1. Deletes existing orders for the test user
2. Creates fresh sample orders
3. Updates tracking tokens

---

## 🎨 Testing the New Filter UI

Try these interactions after seeding orders:

1. **Click "Filters" button** → Opens dropdown menu
2. **Select multiple statuses** → Check "Delivered" and "Shipped"
3. **Choose date range** → Try "Last Month"
4. **Click "Apply Filters"** → See filtered results
5. **Remove filter chips** → Click the ✕ on any chip
6. **Clear all** → Click "Clear all" button
7. **Expand orders** → Click on any order card to see details

---

Happy testing! 🎉
