#!/usr/bin/env node
/**
 * =============================================================================
 * HEROKU STARTUP SCRIPT - CARAFE COFFEE
 * =============================================================================
 * This script manages both Strapi and Nuxt processes on Heroku
 * Note: For production, it's recommended to deploy as separate apps
 */

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const STRAPI_PORT = 1337;

console.log('🚀 Starting Carafe Coffee services...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${PORT}`);

// Determine which service to run based on environment variable
const SERVICE = process.env.HEROKU_SERVICE || 'frontend';

if (SERVICE === 'backend') {
  // Start Strapi only
  console.log('\n📦 Starting Strapi Backend...');
  const strapi = spawn('yarn', ['start'], {
    cwd: path.join(__dirname, '..', 'strapi-backend'),
    env: { ...process.env, PORT: PORT, HOST: '0.0.0.0' },
    stdio: 'inherit'
  });

  strapi.on('error', (err) => {
    console.error('❌ Strapi failed to start:', err);
    process.exit(1);
  });

  strapi.on('close', (code) => {
    console.log(`Strapi exited with code ${code}`);
    process.exit(code);
  });

} else if (SERVICE === 'frontend') {
  // Start Nuxt only
  console.log('\n🎨 Starting Nuxt Frontend...');
  const nuxt = spawn('node', ['.output/server/index.mjs'], {
    cwd: path.join(__dirname, '..', 'nuxt-frontend'),
    env: { ...process.env, PORT: PORT, HOST: '0.0.0.0' },
    stdio: 'inherit'
  });

  nuxt.on('error', (err) => {
    console.error('❌ Nuxt failed to start:', err);
    process.exit(1);
  });

  nuxt.on('close', (code) => {
    console.log(`Nuxt exited with code ${code}`);
    process.exit(code);
  });

} else {
  console.error('❌ Invalid HEROKU_SERVICE value. Must be "frontend" or "backend"');
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
