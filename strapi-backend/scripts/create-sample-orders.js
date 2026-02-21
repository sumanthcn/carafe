#!/usr/bin/env node

/**
 * Creates sample orders in Strapi via the REST API
 * 
 * BEFORE RUNNING:
 * 1. Update PASSWORD below with your actual account password
 * 2. Make sure Strapi is running: cd strapi-backend && npm run develop
 * 3. Run: node scripts/create-sample-orders.js
 */

const EMAIL = 'shruthisumanth25@gmail.com';
const PASSWORD = '12345678'; // <-- UPDATE THIS
const STRAPI_URL = 'http://localhost:1337';

const ORDERS = [
  {
    orderNumber: 'ORD-2024-1001',
    status: 'delivered',
    customerEmail: EMAIL,
    customerName: 'Shruthi Sumanth',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      { productId: 1, productName: 'Ethiopian Yirgacheffe', sku: 'ETH-YIRG-250', quantity: 2, unitPrice: 12.50, totalPrice: 25.00, weight: '250g' },
      { productId: 2, productName: 'Colombian Supremo', sku: 'COL-SUPR-250', quantity: 1, unitPrice: 11.00, totalPrice: 11.00, weight: '250g' }
    ],
    subtotal: 36.00,
    shippingCost: 4.95,
    tax: 0,
    discount: 0,
    total: 40.95,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_demo_001',
    worldpayOrderCode: 'WP-00000001',
    shippingMethod: 'Royal Mail - Tracked 24',
    carrier: 'An Post',
    trackingNumber: 'RL123456789IE',
    isGuestOrder: false
  },
  {
    orderNumber: 'ORD-2024-1002',
    status: 'shipped',
    customerEmail: EMAIL,
    customerName: 'Shruthi Sumanth',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      { productId: 3, productName: 'Brazilian Santos', sku: 'BRA-SANT-500', quantity: 1, unitPrice: 18.50, totalPrice: 18.50, weight: '500g' },
      { productId: 4, productName: 'Costa Rican Tarrazu', sku: 'CRI-TARR-250', quantity: 2, unitPrice: 13.00, totalPrice: 26.00, weight: '250g' }
    ],
    subtotal: 44.50,
    shippingCost: 4.95,
    tax: 0,
    discount: 0,
    total: 49.45,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_demo_002',
    worldpayOrderCode: 'WP-00000002',
    shippingMethod: 'DPD - DPD Next Day (Standard)',
    carrier: 'DPD',
    trackingNumber: 'DPD123456789',
    isGuestOrder: false
  },
  {
    orderNumber: 'ORD-2024-1003',
    status: 'order_received',
    customerEmail: EMAIL,
    customerName: 'Shruthi Sumanth',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      { productId: 1, productName: 'Ethiopian Yirgacheffe', sku: 'ETH-YIRG-1KG', quantity: 1, unitPrice: 42.00, totalPrice: 42.00, weight: '1kg' }
    ],
    subtotal: 42.00,
    shippingCost: 4.95,
    tax: 0,
    discount: 0,
    total: 46.95,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_demo_003',
    worldpayOrderCode: 'WP-00000003',
    shippingMethod: 'Royal Mail - Tracked 24',
    isGuestOrder: false
  },
  {
    orderNumber: 'ORD-2024-1004',
    status: 'delivered',
    customerEmail: EMAIL,
    customerName: 'Shruthi Sumanth',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      city: 'Dublin',
      
      postcode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      { productId: 2, productName: 'Colombian Supremo', sku: 'COL-SUPR-500', quantity: 2, unitPrice: 20.00, totalPrice: 40.00, weight: '500g' },
      { productId: 5, productName: 'Decaf Swiss Water Process', sku: 'DECAF-250', quantity: 1, unitPrice: 14.50, totalPrice: 14.50, weight: '250g' }
    ],
    subtotal: 54.50,
    shippingCost: 0,
    tax: 0,
    discount: 0,
    total: 54.50,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_demo_004',
    worldpayOrderCode: 'WP-00000004',
    shippingMethod: 'Royal Mail - Tracked 24',
    carrier: 'An Post',
    trackingNumber: 'RL987654321IE',
    isGuestOrder: false
  }
];

async function run() {
  console.log('\n🌱 Creating sample orders for', EMAIL);
  console.log('='.repeat(50));

  // Step 1: Check Strapi is running
  console.log('\n📡 Checking Strapi...');
  try {
    const health = await fetch(`${STRAPI_URL}/_health`);
    if (!health.ok) throw new Error('Not healthy');
    console.log('✅ Strapi is running');
  } catch {
    console.error('❌ Strapi is not running. Start it with: npm run develop');
    process.exit(1);
  }

  // Step 2: Login
  console.log('\n🔐 Logging in...');
  let jwt, userId;
  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: EMAIL, password: PASSWORD })
    });

    if (!res.ok) {
      const err = await res.json();
      if (PASSWORD === 'YOUR_PASSWORD_HERE') {
        console.error('\n❌ Please update PASSWORD in this script with your actual password!');
      } else {
        console.error('\n❌ Login failed:', err.error?.message || 'Invalid credentials');
      }
      process.exit(1);
    }

    const data = await res.json();
    jwt = data.jwt;
    userId = data.user.id;
    console.log(`✅ Logged in (User ID: ${userId})`);
  } catch (e) {
    console.error('❌ Login error:', e.message);
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  };

  // Step 3: Delete existing sample orders
  console.log('\n🗑️  Removing old sample orders...');
  try {
    const existing = await fetch(`${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}&pagination[pageSize]=100`, {
      headers
    });
    const existingData = await existing.json();
    const existingOrders = existingData?.data || [];
    
    for (const order of existingOrders) {
      await fetch(`${STRAPI_URL}/api/orders/${order.id}`, { method: 'DELETE', headers });
      console.log(`   ✓ Removed ${order.orderNumber || order.id}`);
    }
    
    if (existingOrders.length === 0) console.log('   No existing orders found');
  } catch (e) {
    console.log('   Could not check existing orders (continuing)');
  }

  // Step 4: Create orders
  console.log('\n📦 Creating sample orders...\n');
  let created = 0;
  const createdOrders = []; // track { id, status }

  for (const order of ORDERS) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: { ...order, user: userId } })
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error(`   ✗ Failed to create ${order.orderNumber}`);
        console.error(`     → ${errData.error?.message || res.statusText}`);
        if (errData.error?.message?.includes('unique')) {
          console.log(`     → Order number already exists, skipping`);
        }
        continue;
      }

      const data = await res.json();
      const createdId = data?.data?.id;
      if (createdId) createdOrders.push({ id: createdId, status: order.status });
      console.log(`   ✅ ${order.orderNumber} — ${order.status.toUpperCase()} — €${order.total}`);
      created++;
    } catch (e) {
      console.error(`   ✗ Error creating ${order.orderNumber}:`, e.message);
    }
  }

  // Step 5: Fix statuses & ensure user links via direct DB (controller forces order_received)
  if (createdOrders.length > 0) {
    console.log('\n🔧 Fixing order statuses & user links via DB...');
    try {
      const { Client } = require('pg');
      const client = new Client({
        host: '127.0.0.1', port: 5432,
        database: 'carafe_strapi', user: 'strapi', password: 'strapi'
      });
      await client.connect();

      for (const { id, status } of createdOrders) {
        await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        await client.query(
          'INSERT INTO orders_user_lnk (order_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, userId]
        );
        console.log(`   ✓ Order #${id} → status: ${status}, user: ${userId}`);
      }

      await client.end();
      console.log('   ✅ Done');
    } catch (e) {
      console.warn(`   ⚠️  DB step skipped: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Done! Created ${created}/${ORDERS.length} orders`);
  
  if (created > 0) {
    console.log('\n📱 Visit your orders page:');
    console.log('   http://localhost:3000/account/orders\n');
  }
}

run();
