#!/usr/bin/env node

/**
 * API-Based Order Seeding Script
 * Creates sample orders via Strapi REST API
 * 
 * Prerequisites:
 * 1. Strapi must be running (npm run develop)
 * 2. User shruthisumanth25@gmail.com must exist
 * 
 * Usage: npm run seed:orders:api
 */

const { sampleOrders } = require('../database/seeds/sample-orders');

// Strapi API configuration
const STRAPI_URL = 'http://localhost:1337';
const USER_EMAIL = 'shruthisumanth25@gmail.com';
const USER_PASSWORD = 'Test@123'; // Update this to match your actual password

async function checkStrapiHealth() {
  try {
    const response = await fetch(`${STRAPI_URL}/_health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function authenticateUser() {
  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: USER_EMAIL,
      password: USER_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    jwt: data.jwt,
    userId: data.user.id,
  };
}

async function getUserOrders(jwt, userId) {
  const response = await fetch(`${STRAPI_URL}/api/orders?filters[user][id][$eq]=${userId}`, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

async function deleteOrder(jwt, orderId) {
  const response = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete order ${orderId}: ${response.statusText}`);
  }
}

async function createOrder(jwt, userId, orderData) {
  const response = await fetch(`${STRAPI_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      data: {
        ...orderData,
        user: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to create order: ${response.statusText}\n${errorData}`);
  }

  const data = await response.json();
  return data.data;
}

async function seedOrders() {
  console.log('\n🌱 Carafe Coffee - API Order Seeding Script\n');
  console.log('=' .repeat(50));

  // Check if Strapi is running
  console.log('\n📡 Checking Strapi connection...');
  const isRunning = await checkStrapiHealth();
  
  if (!isRunning) {
    console.error('\n❌ ERROR: Strapi is not running!');
    console.log('\n💡 Please start Strapi first:');
    console.log('   cd strapi-backend');
    console.log('   npm run develop');
    console.log('\n   Then run this script again.\n');
    process.exit(1);
  }
  
  console.log('✅ Strapi is running\n');

  try {
    // Authenticate user
    console.log(`👤 Authenticating user: ${USER_EMAIL}...`);
    const { jwt, userId } = await authenticateUser();
    console.log(`✅ Authenticated successfully`);
    console.log(`   User ID: ${userId}\n`);

    // Get existing orders
    console.log('🔍 Checking for existing orders...');
    const existingOrders = await getUserOrders(jwt, userId);
    console.log(`   Found ${existingOrders.length} existing orders\n`);

    // Delete existing orders
    if (existingOrders.length > 0) {
      console.log('🗑️  Deleting existing orders...');
      for (const order of existingOrders) {
        await deleteOrder(jwt, order.id);
        console.log(`   ✓ Deleted order ${order.attributes.orderNumber || order.id}`);
      }
      console.log('');
    }

    // Create sample orders
    console.log('📦 Creating sample orders...\n');
    let createdCount = 0;

    for (const orderData of sampleOrders) {
      try {
        const order = await createOrder(jwt, userId, orderData);
        console.log(`   ✓ Created order ${orderData.orderNumber}`);
        console.log(`     Status: ${orderData.status.toUpperCase()}`);
        console.log(`     Total: €${orderData.total.toFixed(2)}`);
        console.log(`     Items: ${orderData.items.length} product(s)\n`);
        createdCount++;
      } catch (error) {
        console.error(`   ✗ Failed to create order ${orderData.orderNumber}`);
        console.error(`     Error: ${error.message}\n`);
      }
    }

    console.log('=' .repeat(50));
    console.log(`\n✅ Successfully seeded ${createdCount}/${sampleOrders.length} orders!\n`);
    
    console.log('🎉 Next Steps:');
    console.log('   1. Visit: http://localhost:3000/account/orders');
    console.log('   2. Login with: shruthisumanth25@gmail.com');
    console.log('   3. Test the new filter UI with your orders\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure user exists: shruthisumanth25@gmail.com');
    console.log('   2. Update USER_PASSWORD in this script');
    console.log('   3. Ensure Order content type exists in Strapi');
    console.log('   4. Check Strapi logs for errors\n');
    process.exit(1);
  }
}

// Run the script
seedOrders();
