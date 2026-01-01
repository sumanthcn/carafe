#!/bin/bash

# =============================================================================
# STRAPI DATA TRANSFER - CARAFE COFFEE
# =============================================================================
# This script uses Strapi's data transfer feature to move data to Heroku
# This is the RECOMMENDED method as it's safer and handles all content types

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Strapi Data Transfer to Heroku                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_APP_NAME="carafe-strapi"
BACKEND_URL="https://carafe-strapi-6a5c003b33c5.herokuapp.com"
EXPORT_FILE="strapi-data-export-$(date +%Y%m%d-%H%M%S).tar.gz"
EXPORT_DIR="./data-exports"

# Create export directory
mkdir -p "$EXPORT_DIR"

echo -e "${YELLOW}⚠️  IMPORTANT: Before running this script:${NC}"
echo ""
echo "1. Make sure your Heroku backend is running:"
echo "   heroku ps --app $BACKEND_APP_NAME"
echo ""
echo "2. Make sure you have a transfer token in Heroku:"
echo "   heroku config:get TRANSFER_TOKEN_SALT --app $BACKEND_APP_NAME"
echo ""
echo "3. Your local Strapi should be running (yarn develop)"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Step 1: Export data from local
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 1: Exporting data from local Strapi...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

cd strapi-backend

# Export using Strapi CLI
npx strapi export \
  --file "../$EXPORT_DIR/$EXPORT_FILE" \
  --no-encrypt

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Data exported successfully${NC}"
    echo "  File: $EXPORT_DIR/$EXPORT_FILE"
else
    echo ""
    echo -e "${RED}❌ Failed to export data${NC}"
    exit 1
fi

cd ..

# Step 2: Get transfer token from Heroku
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 2: Getting Heroku credentials...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# We need to create a transfer token in the Heroku instance
echo "To import data to Heroku, you need to:"
echo ""
echo "1. Create a transfer token on Heroku (one-time setup):"
echo "   heroku run 'npx strapi admin:create-token --type=transfer' --app $BACKEND_APP_NAME"
echo ""
echo "2. Upload your export file to a temporary location"
echo "3. Import using the Heroku CLI"
echo ""
echo -e "${YELLOW}Alternative: Use the Admin UI${NC}"
echo ""
echo "1. Open your Heroku admin panel:"
echo "   open $BACKEND_URL/admin"
echo ""
echo "2. Go to Settings → Transfer Tokens"
echo "3. Create a new transfer token"
echo "4. Use the import command with that token"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Automated Import (Recommended)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo "Run this command to import to Heroku:"
echo ""
echo -e "${GREEN}heroku run \"npx strapi import --file /tmp/data.tar.gz\" --app $BACKEND_APP_NAME${NC}"
echo ""
echo "But first, you need to upload the file. Here's how:"
echo ""
echo "1. Install the Heroku CLI plugin:"
echo "   heroku plugins:install heroku-builds"
echo ""
echo "2. Create a simple import script on Heroku"
echo ""
echo -e "${YELLOW}📦 Export file saved to:${NC} $EXPORT_DIR/$EXPORT_FILE"
echo ""
echo -e "${GREEN}✓ Export complete!${NC}"
echo ""
