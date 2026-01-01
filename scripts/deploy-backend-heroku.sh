#!/bin/bash

# =============================================================================
# DEPLOY STRAPI BACKEND TO HEROKU - CARAFE COFFEE
# =============================================================================
# This script deploys the Strapi backend as a separate Heroku app

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Deploy Strapi Backend to Heroku                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_APP_NAME="carafe-strapi"
FRONTEND_APP_NAME="carafe"
REGION="eu"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found. Please install it first:${NC}"
    echo "   brew install heroku/brew/heroku"
    exit 1
fi

echo -e "${GREEN}✓ Heroku CLI found${NC}"
echo ""

# Login check
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Heroku. Logging in...${NC}"
    heroku login
fi

echo -e "${GREEN}✓ Logged into Heroku as $(heroku auth:whoami)${NC}"
echo ""

# Step 1: Create backend app
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 1: Creating Heroku app for Strapi backend...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

if heroku apps:info --app "$BACKEND_APP_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  App $BACKEND_APP_NAME already exists${NC}"
else
    heroku create "$BACKEND_APP_NAME" --region "$REGION"
    echo -e "${GREEN}✓ Created app: $BACKEND_APP_NAME${NC}"
fi
echo ""

# Step 2: Add PostgreSQL
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 2: Adding PostgreSQL database...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

if heroku addons --app "$BACKEND_APP_NAME" | grep -q "heroku-postgresql"; then
    echo -e "${YELLOW}⚠️  PostgreSQL already exists${NC}"
else
    heroku addons:create heroku-postgresql:essential-0 --app "$BACKEND_APP_NAME"
    echo -e "${GREEN}✓ PostgreSQL addon added (Essential-0 plan: ~$5/month)${NC}"
    echo "Waiting 10 seconds for database to provision..."
    sleep 10
fi
echo ""

# Step 3: Generate secrets
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 3: Generating secure secrets...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

APP_KEYS="$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
API_TOKEN_SALT="$(openssl rand -base64 16)"
ADMIN_JWT_SECRET="$(openssl rand -base64 16)"
TRANSFER_TOKEN_SALT="$(openssl rand -base64 16)"
JWT_SECRET="$(openssl rand -base64 16)"

echo -e "${GREEN}✓ Secrets generated${NC}"
echo ""

# Step 4: Set environment variables
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 4: Setting environment variables...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

heroku config:set \
  APP_KEYS="$APP_KEYS" \
  API_TOKEN_SALT="$API_TOKEN_SALT" \
  ADMIN_JWT_SECRET="$ADMIN_JWT_SECRET" \
  TRANSFER_TOKEN_SALT="$TRANSFER_TOKEN_SALT" \
  JWT_SECRET="$JWT_SECRET" \
  NODE_ENV=production \
  HOST=0.0.0.0 \
  DATABASE_CLIENT=postgres \
  PUBLIC_URL="https://$BACKEND_APP_NAME.herokuapp.com" \
  FRONTEND_URL="https://$FRONTEND_APP_NAME.herokuapp.com" \
  SERVE_ADMIN_PANEL=true \
  --app "$BACKEND_APP_NAME"

echo -e "${GREEN}✓ Environment variables set${NC}"
echo ""

# Step 5: Add git remote
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 5: Adding git remote...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Remove existing remote if it exists
if git remote | grep -q "heroku-backend"; then
    git remote remove heroku-backend
    echo -e "${YELLOW}⚠️  Removed existing heroku-backend remote${NC}"
fi

heroku git:remote --app "$BACKEND_APP_NAME" --remote heroku-backend
echo -e "${GREEN}✓ Git remote added: heroku-backend${NC}"
echo ""

# Step 6: Deploy backend
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 6: Deploying Strapi backend...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}This may take several minutes...${NC}"
echo ""

git subtree push --prefix strapi-backend heroku-backend master

echo ""
echo -e "${GREEN}✓ Backend deployed successfully${NC}"
echo ""

# Step 7: Update frontend configuration
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 7: Updating frontend configuration...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

heroku config:set \
  NUXT_PUBLIC_STRAPI_URL="https://$BACKEND_APP_NAME.herokuapp.com" \
  --app "$FRONTEND_APP_NAME"

echo -e "${GREEN}✓ Frontend configuration updated${NC}"
echo ""

# Step 8: Restart frontend
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 8: Restarting frontend app...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

heroku restart --app "$FRONTEND_APP_NAME"
echo -e "${GREEN}✓ Frontend restarted${NC}"
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT COMPLETE!                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo ""
echo -e "${GREEN}Backend (Strapi):${NC}"
echo "  🌐 URL: https://$BACKEND_APP_NAME.herokuapp.com"
echo "  🔐 Admin: https://$BACKEND_APP_NAME.herokuapp.com/admin"
echo "  📊 Status: heroku ps --app $BACKEND_APP_NAME"
echo "  📝 Logs: heroku logs --tail --app $BACKEND_APP_NAME"
echo ""
echo -e "${GREEN}Frontend (Nuxt):${NC}"
echo "  🌐 URL: https://$FRONTEND_APP_NAME.herokuapp.com"
echo "  📊 Status: heroku ps --app $FRONTEND_APP_NAME"
echo "  📝 Logs: heroku logs --tail --app $FRONTEND_APP_NAME"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Access admin panel:"
echo "   open https://$BACKEND_APP_NAME.herokuapp.com/admin"
echo ""
echo "2. Create your first admin user"
echo ""
echo "3. Generate API token in Strapi:"
echo "   Settings → API Tokens → Create new token"
echo ""
echo "4. Set the API token in frontend:"
echo "   heroku config:set STRAPI_API_TOKEN=your_token --app $FRONTEND_APP_NAME"
echo "   heroku restart --app $FRONTEND_APP_NAME"
echo ""
echo "5. Test the connection:"
echo "   curl https://$BACKEND_APP_NAME.herokuapp.com/api"
echo "   curl https://$FRONTEND_APP_NAME.herokuapp.com"
echo ""
echo -e "${GREEN}🎉 All done! Your apps are now live!${NC}"
echo ""

# Save secrets to file
SECRETS_FILE=".heroku-secrets-$(date +%Y%m%d-%H%M%S).txt"
cat > "$SECRETS_FILE" <<EOF
# Heroku Secrets - Carafe Coffee
# Generated: $(date)
# KEEP THIS FILE SECURE!

Backend App: $BACKEND_APP_NAME
Frontend App: $FRONTEND_APP_NAME

APP_KEYS=$APP_KEYS
API_TOKEN_SALT=$API_TOKEN_SALT
ADMIN_JWT_SECRET=$ADMIN_JWT_SECRET
TRANSFER_TOKEN_SALT=$TRANSFER_TOKEN_SALT
JWT_SECRET=$JWT_SECRET

Backend URL: https://$BACKEND_APP_NAME.herokuapp.com
Admin Panel: https://$BACKEND_APP_NAME.herokuapp.com/admin
Frontend URL: https://$FRONTEND_APP_NAME.herokuapp.com

To retrieve these later:
  heroku config --app $BACKEND_APP_NAME
EOF

echo -e "${YELLOW}💾 Secrets saved to: $SECRETS_FILE${NC}"
echo -e "${RED}⚠️  Keep this file secure and add it to .gitignore!${NC}"
echo ""
