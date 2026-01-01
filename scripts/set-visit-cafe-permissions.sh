#!/bin/bash

# =============================================================================
# SET VISIT CAFE API PERMISSIONS - CARAFE COFFEE
# =============================================================================
# This script sets public permissions for the visit-cafe API endpoint

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Set Visit Cafe API Permissions                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_APP_NAME="carafe-strapi"
BACKEND_URL="https://carafe-strapi-6a5c003b33c5.herokuapp.com"

echo -e "${YELLOW}This script will enable public access to the Visit Cafe API${NC}"
echo ""
echo "You need to do this manually through the Strapi admin panel:"
echo ""
echo "1. Open admin panel:"
echo "   ${GREEN}$BACKEND_URL/admin${NC}"
echo ""
echo "2. Navigate to:"
echo "   Settings → Users & Permissions plugin → Roles → Public"
echo ""
echo "3. Find 'Visit-cafe' in the permissions list"
echo ""
echo "4. Check these permissions:"
echo "   ✓ find"
echo "   ✓ findOne"
echo ""
echo "5. Click 'Save' at the top right"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Press Enter after you've set the permissions..."

echo ""
echo -e "${YELLOW}Testing the API endpoint...${NC}"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/visit-cafe")

if [ "$RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✓ API is accessible!${NC}"
    echo ""
    echo "Testing with data:"
    curl -s "$BACKEND_URL/api/visit-cafe" | head -100
elif [ "$RESPONSE" -eq 404 ]; then
    echo -e "${YELLOW}⚠️  API returned 404 - No content found${NC}"
    echo ""
    echo "You need to add content to the Visit Cafe page:"
    echo "1. Go to Content Manager → Visit Cafe (Single Type)"
    echo "2. Add content for all sections"
    echo "3. Click Save"
elif [ "$RESPONSE" -eq 403 ]; then
    echo -e "${RED}❌ API returned 403 - Permissions not set correctly${NC}"
    echo ""
    echo "Please follow the steps above to set permissions."
else
    echo -e "${RED}❌ API returned status code: $RESPONSE${NC}"
    echo ""
    echo "Please check:"
    echo "- Strapi is running"
    echo "- The visit-cafe content type exists"
    echo "- Permissions are set correctly"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
