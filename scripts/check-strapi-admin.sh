#!/bin/bash

# =============================================================================
# STRAPI ADMIN PANEL DIAGNOSTIC - HEROKU
# =============================================================================
# This script checks if the Strapi admin panel is accessible on Heroku

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

HEROKU_APP="${1:-carafe-82d2cfeaa846}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Strapi Admin Panel Diagnostic - Heroku              ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}App: ${HEROKU_APP}${NC}"
echo ""

# Check if heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Heroku CLI found${NC}"
echo ""

# Check app status
echo -e "${YELLOW}Checking app status...${NC}"
if heroku ps --app "$HEROKU_APP" | grep -q "up"; then
    echo -e "${GREEN}✓ App is running${NC}"
else
    echo -e "${RED}❌ App is not running${NC}"
    echo ""
    echo "Starting app..."
    heroku ps:restart --app "$HEROKU_APP"
    echo "Waiting 30 seconds for app to start..."
    sleep 30
fi
echo ""

# Check required environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"

REQUIRED_VARS=("APP_KEYS" "ADMIN_JWT_SECRET" "API_TOKEN_SALT" "TRANSFER_TOKEN_SALT" "JWT_SECRET" "DATABASE_URL" "PUBLIC_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if heroku config:get "$var" --app "$HEROKU_APP" > /dev/null 2>&1; then
        value=$(heroku config:get "$var" --app "$HEROKU_APP" 2>/dev/null)
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓ $var is set${NC}"
        else
            echo -e "${RED}✗ $var is empty${NC}"
            MISSING_VARS+=("$var")
        fi
    else
        echo -e "${RED}✗ $var is not set${NC}"
        MISSING_VARS+=("$var")
    fi
done
echo ""

# Check SERVE_ADMIN_PANEL
SERVE_ADMIN=$(heroku config:get SERVE_ADMIN_PANEL --app "$HEROKU_APP" 2>/dev/null || echo "")
if [ "$SERVE_ADMIN" = "true" ]; then
    echo -e "${GREEN}✓ SERVE_ADMIN_PANEL is true${NC}"
elif [ -z "$SERVE_ADMIN" ]; then
    echo -e "${YELLOW}⚠ SERVE_ADMIN_PANEL not set (will default to true)${NC}"
else
    echo -e "${RED}✗ SERVE_ADMIN_PANEL is set to: $SERVE_ADMIN${NC}"
fi
echo ""

# Get PUBLIC_URL
PUBLIC_URL=$(heroku config:get PUBLIC_URL --app "$HEROKU_APP" 2>/dev/null || echo "https://$HEROKU_APP.herokuapp.com")
echo -e "${BLUE}Using PUBLIC_URL: $PUBLIC_URL${NC}"
echo ""

# Test API endpoint
echo -e "${YELLOW}Testing API endpoint...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL/api" || echo "000")
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ API endpoint responds (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ API endpoint error (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test admin endpoint
echo -e "${YELLOW}Testing admin endpoint...${NC}"
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PUBLIC_URL/admin" || echo "000")
if [ "$ADMIN_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Admin panel is accessible (HTTP $ADMIN_CODE)${NC}"
else
    echo -e "${RED}✗ Admin panel not accessible (HTTP $ADMIN_CODE)${NC}"
fi
echo ""

# Check recent logs for errors
echo -e "${YELLOW}Checking recent logs for errors...${NC}"
if heroku logs --tail=100 --app "$HEROKU_APP" 2>&1 | grep -i "error" > /tmp/heroku-errors.txt; then
    echo -e "${RED}✗ Found errors in logs:${NC}"
    head -5 /tmp/heroku-errors.txt
    echo ""
    echo "View full logs with: heroku logs --tail --app $HEROKU_APP"
else
    echo -e "${GREEN}✓ No obvious errors in recent logs${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Summary                                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$ADMIN_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin panel is accessible!${NC}"
    echo ""
    echo "Access it at: $PUBLIC_URL/admin"
    echo ""
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠ However, some environment variables are missing:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Set them with: heroku config:set VAR=value --app $HEROKU_APP"
    fi
else
    echo -e "${RED}❌ Admin panel is NOT accessible${NC}"
    echo ""
    echo -e "${YELLOW}Possible fixes:${NC}"
    echo ""
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo "1. Set missing environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "   heroku config:set $var=your_value --app $HEROKU_APP"
        done
        echo ""
    fi
    
    echo "2. Ensure admin panel is built:"
    echo "   Check build logs: heroku logs --tail --app $HEROKU_APP | grep 'Building admin'"
    echo ""
    
    echo "3. Restart the app:"
    echo "   heroku restart --app $HEROKU_APP"
    echo ""
    
    echo "4. Check if SERVE_ADMIN_PANEL is true:"
    echo "   heroku config:set SERVE_ADMIN_PANEL=true --app $HEROKU_APP"
    echo ""
    
    echo "5. View detailed logs:"
    echo "   heroku logs --tail --app $HEROKU_APP"
    echo ""
    
    echo "6. Trigger rebuild:"
    echo "   git commit --allow-empty -m 'Rebuild admin panel'"
    echo "   git push heroku-backend master"
fi

echo ""
echo -e "${BLUE}For more help, see: STRAPI_ADMIN_ACCESS.md${NC}"
