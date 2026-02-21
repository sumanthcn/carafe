#!/usr/bin/env node

/**
 * Seed Orders Script
 * Run this script to populate sample orders in Strapi
 * 
 * Usage:
 *   cd strapi-backend
 *   node scripts/seed-orders.js
 */

const { sampleOrders } = require('../database/seeds/sample-orders');

async function seedOrders() {
  console.log('🌱 Starting order seeding...\n');

  try {
    // Import Strapi
    const strapi = require('@strapi/strapi');
    
    // Bootstrap Strapi
    console.log('📦 Bootstrapping Strapi...');
    const app = await strapi.createStrapi().load();
    
    console.log('✅ Strapi loaded successfully\n');

    // Find or create a test user
    console.log('👤 Finding/creating test user...');
    let testUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email: 'john@example.com' }
    });

    if (!testUser) {
      console.log('   Creating new test user...');
      testUser = await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: 'johndoe',
          email: 'john@example.com',
          password: await strapi.plugins['users-permissions'].services.user.hashPassword('Test123!'),
          confirmed: true,
          blocked: false,
          provider: 'local',
          role: 1 // Authenticated role
        }
      });
      console.log('   ✅ Created test user');
    } else {
      console.log('   ✅ Found existing test user');
    }
    console.log(`   User ID: ${testUser.id}\n`);

    // Clear existing orders for this user (optional - comment out if you want to keep existing)
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

        console.log(`   ✅ Created order: ${order.orderNumber} (Status: ${order.status})`);
        createdCount++;
      } catch (error) {
        console.error(`   ❌ Failed to create order ${orderData.orderNumber}:`, error.message);
      }
    }

    console.log(`\n🎉 Seeding complete! Created ${createdCount}/${sampleOrders.length} orders`);
    console.log('\n📝 Test Account Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: Test123!');
    console.log('   User ID:', testUser.id);
    console.log('\n✨ You can now log in and view the orders!\n');

    // Destroy Strapi instance
    await app.destroy();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedOrders();
