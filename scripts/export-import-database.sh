#!/bin/bash

# =============================================================================
# EXPORT & IMPORT DATABASE - CARAFE COFFEE
# =============================================================================
# This script exports your local Strapi database and imports it to Heroku

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Export Local DB & Import to Heroku                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_APP_NAME="carafe-strapi"
LOCAL_DB_NAME="carafe_strapi"
EXPORT_FILE="carafe-db-export-$(date +%Y%m%d-%H%M%S).sql"
EXPORT_DIR="./database-exports"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ pg_dump not found. Please install PostgreSQL:${NC}"
    echo "   brew install postgresql@15"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL tools found${NC}"
echo ""

# Create export directory
mkdir -p "$EXPORT_DIR"

# Step 1: Export local database
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 1: Exporting local database...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo "Database: $LOCAL_DB_NAME"
echo "Export file: $EXPORT_DIR/$EXPORT_FILE"
echo ""

# Export the database
pg_dump -Fc --no-acl --no-owner -d "$LOCAL_DB_NAME" -f "$EXPORT_DIR/$EXPORT_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database exported successfully${NC}"
    echo ""
else
    echo -e "${RED}❌ Failed to export database${NC}"
    exit 1
fi

# Step 2: Upload to Heroku
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 2: Uploading database to Heroku...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  WARNING: This will replace ALL data in production!${NC}"
echo -e "${YELLOW}    Make sure you want to continue.${NC}"
echo ""
read -p "Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}❌ Import cancelled${NC}"
    exit 1
fi

echo ""
echo "Getting Heroku database credentials..."

# Get the Heroku database URL
DATABASE_URL=$(heroku config:get DATABASE_URL --app "$BACKEND_APP_NAME")

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Could not get DATABASE_URL from Heroku${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Got database credentials${NC}"
echo ""

# Step 3: Reset and import
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 3: Importing to Heroku database...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo "Resetting Heroku database..."
heroku pg:reset DATABASE --app "$BACKEND_APP_NAME" --confirm "$BACKEND_APP_NAME"

echo ""
echo "Importing database..."
heroku pg:push "$LOCAL_DB_NAME" DATABASE --app "$BACKEND_APP_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Database imported successfully${NC}"
else
    echo ""
    echo -e "${RED}❌ Failed to import database${NC}"
    echo ""
    echo "You can try manual restore:"
    echo "  heroku pg:psql --app $BACKEND_APP_NAME < $EXPORT_DIR/$EXPORT_FILE"
    exit 1
fi

# Step 4: Restart the app
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 4: Restarting Heroku app...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

heroku restart --app "$BACKEND_APP_NAME"
echo -e "${GREEN}✓ App restarted${NC}"
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ DATABASE MIGRATION COMPLETE!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo ""
echo "  📦 Export saved: $EXPORT_DIR/$EXPORT_FILE"
echo "  🚀 Imported to: $BACKEND_APP_NAME"
echo "  🌐 Admin URL: https://carafe-strapi-6a5c003b33c5.herokuapp.com/admin"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Test the admin panel:"
echo "   open https://carafe-strapi-6a5c003b33c5.herokuapp.com/admin"
echo ""
echo "2. Verify your content is there"
echo ""
echo "3. Test the API endpoints:"
echo "   curl https://carafe-strapi-6a5c003b33c5.herokuapp.com/api/products"
echo ""
echo -e "${GREEN}🎉 Your production database is now synced with local!${NC}"
echo ""
