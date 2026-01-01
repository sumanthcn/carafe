#!/bin/bash

# =============================================================================
# HEROKU DEPLOYMENT SCRIPT - CARAFE COFFEE
# =============================================================================
# This script helps deploy the application to Heroku
# 
# Usage:
#   ./scripts/heroku-deploy.sh [frontend|backend|both]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STRAPI_APP_NAME="${HEROKU_STRAPI_APP:-carafe-strapi}"
NUXT_APP_NAME="${HEROKU_NUXT_APP:-carafe-frontend}"
DEPLOY_TARGET="${1:-both}"

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}HEROKU DEPLOYMENT - CARAFE COFFEE${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Function to check if Heroku CLI is installed
check_heroku_cli() {
  if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found. Please install it first:${NC}"
    echo "   brew install heroku/brew/heroku"
    exit 1
  fi
  echo -e "${GREEN}✓ Heroku CLI found${NC}"
}

# Function to check if logged into Heroku
check_heroku_auth() {
  if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Heroku. Logging in...${NC}"
    heroku login
  else
    echo -e "${GREEN}✓ Logged into Heroku as $(heroku auth:whoami)${NC}"
  fi
}

# Function to create Heroku app if it doesn't exist
create_app_if_not_exists() {
  local app_name=$1
  if ! heroku apps:info --app "$app_name" &> /dev/null; then
    echo -e "${YELLOW}📦 Creating Heroku app: $app_name${NC}"
    heroku create "$app_name" --region eu
    echo -e "${GREEN}✓ App created${NC}"
  else
    echo -e "${GREEN}✓ App exists: $app_name${NC}"
  fi
}

# Function to set config vars
set_config_vars() {
  local app_name=$1
  local app_type=$2
  
  echo -e "${YELLOW}🔧 Setting configuration variables for $app_name...${NC}"
  
  if [ "$app_type" == "backend" ]; then
    # Strapi configuration
    heroku config:set NODE_ENV=production --app "$app_name"
    heroku config:set HOST=0.0.0.0 --app "$app_name"
    
    echo -e "${BLUE}ℹ️  Please set the following secrets manually:${NC}"
    echo "   heroku config:set APP_KEYS=your_keys --app $app_name"
    echo "   heroku config:set API_TOKEN_SALT=your_salt --app $app_name"
    echo "   heroku config:set ADMIN_JWT_SECRET=your_secret --app $app_name"
    echo "   heroku config:set TRANSFER_TOKEN_SALT=your_salt --app $app_name"
    echo "   heroku config:set JWT_SECRET=your_secret --app $app_name"
    
  elif [ "$app_type" == "frontend" ]; then
    # Nuxt configuration
    heroku config:set NODE_ENV=production --app "$app_name"
    heroku config:set HOST=0.0.0.0 --app "$app_name"
    
    echo -e "${BLUE}ℹ️  Please set the following variables manually:${NC}"
    echo "   heroku config:set NUXT_PUBLIC_SITE_URL=https://$app_name.herokuapp.com --app $app_name"
    echo "   heroku config:set NUXT_PUBLIC_STRAPI_URL=https://$STRAPI_APP_NAME.herokuapp.com --app $app_name"
    echo "   heroku config:set STRAPI_API_TOKEN=your_token --app $app_name"
  fi
}

# Function to add Postgres addon
add_postgres() {
  local app_name=$1
  echo -e "${YELLOW}🐘 Adding PostgreSQL addon...${NC}"
  
  if ! heroku addons --app "$app_name" | grep -q "heroku-postgresql"; then
    heroku addons:create heroku-postgresql:mini --app "$app_name"
    echo -e "${GREEN}✓ PostgreSQL added${NC}"
  else
    echo -e "${GREEN}✓ PostgreSQL already exists${NC}"
  fi
}

# Function to set buildpack/stack
set_stack() {
  local app_name=$1
  local use_container=$2
  
  if [ "$use_container" == "true" ]; then
    echo -e "${YELLOW}🐳 Setting stack to container...${NC}"
    heroku stack:set container --app "$app_name"
  else
    echo -e "${YELLOW}📦 Setting buildpack to Node.js...${NC}"
    heroku buildpacks:set heroku/nodejs --app "$app_name"
  fi
}

# Function to deploy app
deploy_app() {
  local app_name=$1
  local app_type=$2
  local subdirectory=$3
  
  echo -e "${YELLOW}🚀 Deploying $app_type to $app_name...${NC}"
  
  # Add Heroku remote if it doesn't exist
  if ! git remote | grep -q "heroku-$app_type"; then
    heroku git:remote --app "$app_name" --remote "heroku-$app_type"
  fi
  
  # Deploy using git subtree
  if [ -n "$subdirectory" ]; then
    echo -e "${BLUE}Deploying from subdirectory: $subdirectory${NC}"
    git subtree push --prefix "$subdirectory" "heroku-$app_type" master
  else
    git push "heroku-$app_type" master
  fi
  
  echo -e "${GREEN}✓ Deployment complete${NC}"
}

# Main deployment logic
main() {
  echo ""
  check_heroku_cli
  check_heroku_auth
  echo ""
  
  if [ "$DEPLOY_TARGET" == "backend" ] || [ "$DEPLOY_TARGET" == "both" ]; then
    echo -e "${BLUE}======== DEPLOYING STRAPI BACKEND ========${NC}"
    create_app_if_not_exists "$STRAPI_APP_NAME"
    add_postgres "$STRAPI_APP_NAME"
    set_stack "$STRAPI_APP_NAME" "false"
    set_config_vars "$STRAPI_APP_NAME" "backend"
    
    echo -e "${YELLOW}⏳ Ready to deploy backend. Continue? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
      deploy_app "$STRAPI_APP_NAME" "backend" "strapi-backend"
    else
      echo -e "${YELLOW}⏭️  Skipping backend deployment${NC}"
    fi
    echo ""
  fi
  
  if [ "$DEPLOY_TARGET" == "frontend" ] || [ "$DEPLOY_TARGET" == "both" ]; then
    echo -e "${BLUE}======== DEPLOYING NUXT FRONTEND ========${NC}"
    create_app_if_not_exists "$NUXT_APP_NAME"
    set_stack "$NUXT_APP_NAME" "false"
    set_config_vars "$NUXT_APP_NAME" "frontend"
    
    echo -e "${YELLOW}⏳ Ready to deploy frontend. Continue? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
      deploy_app "$NUXT_APP_NAME" "frontend" "nuxt-frontend"
    else
      echo -e "${YELLOW}⏭️  Skipping frontend deployment${NC}"
    fi
    echo ""
  fi
  
  echo -e "${GREEN}======================================================================${NC}"
  echo -e "${GREEN}✅ DEPLOYMENT SCRIPT COMPLETE${NC}"
  echo -e "${GREEN}======================================================================${NC}"
  echo ""
  echo -e "${BLUE}📝 Next steps:${NC}"
  echo "1. Set all required environment variables (see output above)"
  echo "2. Run database migrations if needed:"
  echo "   heroku run npm run strapi -- migration:run --app $STRAPI_APP_NAME"
  echo "3. Visit your apps:"
  echo "   - Backend:  https://$STRAPI_APP_NAME.herokuapp.com"
  echo "   - Frontend: https://$NUXT_APP_NAME.herokuapp.com"
  echo "4. Check logs:"
  echo "   heroku logs --tail --app $STRAPI_APP_NAME"
  echo "   heroku logs --tail --app $NUXT_APP_NAME"
}

# Run main function
main
