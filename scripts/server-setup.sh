#!/bin/bash

# =============================================================================
# INITIAL SERVER SETUP SCRIPT
# =============================================================================
# Run on a fresh Ubuntu 22.04 server

set -e

echo "🔧 Setting up Carafe Coffee production server..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p /var/www/carafe
sudo chown -R $USER:$USER /var/www/carafe

# Clone repository (replace with your repo)
echo "📥 Cloning repository..."
cd /var/www/carafe
# git clone git@github.com:your-org/carafe-coffee.git .

# Setup PostgreSQL
echo "🐘 Setting up PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE carafe_strapi;
CREATE USER strapi WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE carafe_strapi TO strapi;
\c carafe_strapi
GRANT ALL ON SCHEMA public TO strapi;
EOF

# Create PM2 log directory
echo "📁 Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Setup SSL certificates
echo "🔐 Setting up SSL certificates..."
# Run this after DNS is configured:
# sudo certbot --nginx -d carafe.coffee -d www.carafe.coffee -d cms.carafe.coffee

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env files with production values"
echo "2. Configure DNS A records for carafe.coffee and cms.carafe.coffee"
echo "3. Run: sudo certbot --nginx -d carafe.coffee -d www.carafe.coffee -d cms.carafe.coffee"
echo "4. Copy nginx/nginx.conf to /etc/nginx/nginx.conf"
echo "5. Run: cd /var/www/carafe && ./scripts/deploy.sh"
echo "6. Run: pm2 startup && pm2 save"
