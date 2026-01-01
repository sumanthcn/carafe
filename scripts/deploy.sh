#!/bin/bash

# =============================================================================
# DEPLOYMENT SCRIPT - CARAFE COFFEE
# =============================================================================
# Run this script on your production server to deploy updates

set -e

# Configuration
DEPLOY_DIR="/var/www/carafe"
REPO_URL="git@github.com:your-org/carafe-coffee.git"
BRANCH="main"

echo "🚀 Starting deployment..."

# Navigate to deployment directory
cd $DEPLOY_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Deploy Strapi
echo "🔧 Building Strapi..."
cd $DEPLOY_DIR/strapi-backend
yarn install --frozen-lockfile
yarn build

# Deploy Nuxt
echo "🔧 Building Nuxt..."
cd $DEPLOY_DIR/nuxt-frontend
yarn install --frozen-lockfile
yarn build

# Restart services with PM2
echo "♻️ Restarting services..."
pm2 reload carafe-strapi
pm2 reload carafe-nuxt

# Clear Nginx cache if needed
# sudo rm -rf /var/cache/nginx/*
# sudo systemctl reload nginx

# Run database migrations if needed
# cd $DEPLOY_DIR/strapi-backend
# yarn strapi migration:run

echo "✅ Deployment complete!"
echo ""
echo "📊 Service status:"
pm2 status

# Health check
echo ""
echo "🏥 Health check:"
curl -s -o /dev/null -w "%{http_code}" https://carafe.coffee
echo " - Frontend"
curl -s -o /dev/null -w "%{http_code}" https://cms.carafe.coffee/api/homepage
echo " - Strapi API"
