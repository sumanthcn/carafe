#!/usr/bin/env node

/**
 * Quick Order Seeding Script
 * Run this to quickly add test orders to Strapi
 * 
 * Usage: npm run seed:orders
 */

const { sampleOrders } = require('../database/seeds/sample-orders');

async function checkStrapiRunning() {
  try {
    const response = await fetch('http://localhost:1337/_health');
    return response.ok;
  } catch {
    return false;
  }
}

async function seedOrders() {
  console.log('\n🌱 Carafe Coffee - Order Seeding Script\n');
  console.log('=' .repeat(50));

  // Check if Strapi is running
  console.log('\n📡 Checking Strapi connection...');
  const isRunning = await checkStrapiRunning();
  
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
    // Import Strapi
    const strapi = require('@strapi/strapi');
    
    // Bootstrap Strapi
    console.log('📦 Loading Strapi instance...');
    const app = await strapi.createStrapi().load();
    
    console.log('✅ Strapi loaded successfully\n');

    // Find or create a test user
    console.log('👤 Setting up test user...');
    let testUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: 'shruthisumanth25@gmail.com' }
    });

    if (!testUser) {
      console.log('   ❌ User not found: shruthisumanth25@gmail.com');
      console.log('   💡 Please make sure this user exists in Strapi');
      console.log('   You can create it via signup or Strapi admin panel\n');
      await app.destroy();
      process.exit(1);
    } else {
      console.log('   ✅ Found existing user');
    }
    
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}\n`);

    // Clear existing orders for this user
    console.log('🗑️  Clearing existing test orders...');
    const existingOrders = await strapi.db.query('api::order.order').findMany({
      where: { user: testUser.id }
    });
    
    for (const order of existingOrders) {
      await strapi.db.query('api::order.order').delete({
        where: { id: order.id }
      });
    }
    console.log(`   Deleted ${existingOrders.length} existing orders\n`);

    // Create sample orders
    console.log('📦 Creating sample orders...\n');
    let createdCount = 0;

    for (const orderData of sampleOrders) {
      try {
        // Add user relation and tracking token
        const orderWithUser = {
          ...orderData,
          user: testUser.id,
          orderTrackingToken: `track_${Date.now()}_${Math.random().toString(36).substring(7)}`
        };

        const order = await strapi.db.query('api::order.order').create({
          data: orderWithUser
        });

        const statusEmoji = {
          delivered: '✅',
          shipped: '🚚',
          processing: '⚙️',
          order_received: '📋'
        };

        console.log(`   ${statusEmoji[order.status] || '📦'} ${order.orderNumber}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Total: €${order.total}`);
        console.log(`      Items: ${order.items?.length || 0}\n`);
        
        createdCount++;
      } catch (error) {
        console.error(`   ❌ Failed to create ${orderData.orderNumber}:`, error.message);
      }
    }

    console.log('=' .repeat(50));
    console.log(`\n🎉 Success! Created ${createdCount}/${sampleOrders.length} orders\n`);
    
    console.log('📝 Test Account Credentials:');
    console.log('   Email:    john@example.com');
    console.log('   Password: Test123!');
    console.log('   User ID:  ' + testUser.id);
    
    console.log('\n✨ Next Steps:');
    console.log('   1. Start the Nuxt frontend:');
    console.log('      cd nuxt-frontend && npm run dev');
    console.log('   2. Visit: http://localhost:3000/login');
    console.log('   3. Login with the test account');
    console.log('   4. Navigate to "My Orders" to see your orders!\n');

    // Destroy Strapi instance
    await app.destroy();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\nFull error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure Strapi is running: npm run develop');
    console.log('   2. Check database is accessible');
    console.log('   3. Verify order schema is up to date');
    console.log('   4. Check the error message above for details\n');
    process.exit(1);
  }
}

// Run the seeding
seedOrders();
