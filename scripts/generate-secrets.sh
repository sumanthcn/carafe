#!/bin/bash

# =============================================================================
# GENERATE HEROKU SECRETS - CARAFE COFFEE
# =============================================================================
# This script generates secure random secrets for Heroku deployment

echo "🔐 Generating Heroku Secrets for Carafe Coffee"
echo "================================================"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ openssl is required but not installed."
    exit 1
fi

echo "📝 Copy and paste these into your Heroku config:"
echo ""
echo "# Strapi Backend Secrets"
echo "heroku config:set \\"
echo "  APP_KEYS=\"$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)\" \\"
echo "  API_TOKEN_SALT=\"$(openssl rand -base64 16)\" \\"
echo "  ADMIN_JWT_SECRET=\"$(openssl rand -base64 16)\" \\"
echo "  TRANSFER_TOKEN_SALT=\"$(openssl rand -base64 16)\" \\"
echo "  JWT_SECRET=\"$(openssl rand -base64 16)\" \\"
echo "  --app carafe-strapi"
echo ""
echo "================================================"
echo ""
echo "💡 Tip: Save these secrets securely!"
echo "   You'll need them if you ever migrate to a different platform."
