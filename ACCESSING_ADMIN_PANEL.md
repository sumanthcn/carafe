# Accessing Strapi Admin Panel on Heroku

## Two Separate Apps

Your deployment uses **two separate Heroku apps**:

### 1. Nuxt Frontend (Public Website)
- **URL:** `https://carafe-82d2cfeaa846.herokuapp.com` (or your custom domain)
- **Purpose:** Public-facing website for customers
- **Access:** Anyone can visit

### 2. Strapi Backend (CMS & Admin)
- **URL:** `https://[your-strapi-app-name].herokuapp.com`
- **Purpose:** Content management system and API
- **Access:** Admin panel at `/admin`

## Finding Your Strapi App URL

### Method 1: Check Git Remotes
```bash
git remote -v | grep heroku
```

You should see:
```
heroku-backend   https://git.heroku.com/[strapi-app-name].git (fetch)
heroku-frontend  https://git.heroku.com/[frontend-app-name].git (fetch)
```

### Method 2: List All Heroku Apps
```bash
heroku apps --all
```

Look for the app with "strapi" or "backend" in the name.

### Method 3: Check Environment Variables
```bash
# From your frontend app, check what Strapi URL is configured
heroku config:get NUXT_PUBLIC_STRAPI_URL --app carafe-82d2cfeaa846
```

## Accessing Admin Panel

### Option 1: Direct URL (Recommended)
Once you know your Strapi app name, access the admin panel at:
```
https://[your-strapi-app-name].herokuapp.com/admin
```

For example:
```
https://carafe-strapi.herokuapp.com/admin
```

### Option 2: Via Frontend Redirect
After deploying the updated config, you can also access it via:
```
https://carafe-82d2cfeaa846.herokuapp.com/admin
```

This will automatically redirect to your Strapi backend admin panel.

## First Time Setup

### 1. Access Admin Panel
Open the Strapi admin URL in your browser

### 2. Create Admin User
On first access, you'll see a registration form:
- Email
- Password (min 8 characters)
- First Name
- Last Name

Fill it out to create your admin account.

### 3. Login
Use your credentials to log in to the admin panel.

### 4. Generate API Token
For your frontend to access the API:

1. Go to **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Name: `Frontend API Token`
4. Token type: **Read Only** (or **Full Access** if needed)
5. Copy the token (you'll only see it once!)

### 5. Set Token in Frontend
```bash
heroku config:set STRAPI_API_TOKEN=your_copied_token --app carafe-82d2cfeaa846
heroku restart --app carafe-82d2cfeaa846
```

## Troubleshooting

### Can't Find Strapi App

If you only deployed the frontend, you need to deploy the backend:

```bash
# Check if backend remote exists
git remote -v | grep heroku-backend

# If not, you need to create and deploy the backend app
./scripts/heroku-deploy.sh backend
```

### 404 on Admin Panel

Check if Strapi app is running:
```bash
heroku ps --app [strapi-app-name]
```

Check logs:
```bash
heroku logs --tail --app [strapi-app-name]
```

### Admin Panel Shows But Can't Login

Check environment variables are set:
```bash
heroku config --app [strapi-app-name] | grep -E "(ADMIN_JWT_SECRET|APP_KEYS)"
```

If missing, set them:
```bash
./scripts/generate-secrets.sh
# Copy and run the output
```

## Quick Reference

### Frontend App Commands
```bash
# View frontend logs
heroku logs --tail --app carafe-82d2cfeaa846

# Restart frontend
heroku restart --app carafe-82d2cfeaa846

# View frontend config
heroku config --app carafe-82d2cfeaa846
```

### Backend App Commands
```bash
# View backend logs
heroku logs --tail --app [strapi-app-name]

# Restart backend
heroku restart --app [strapi-app-name]

# View backend config
heroku config --app [strapi-app-name]

# Access admin panel
open https://[strapi-app-name].herokuapp.com/admin
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Public Users                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  Nuxt Frontend App (carafe-82d2cfeaa846)            │
│  https://carafe-82d2cfeaa846.herokuapp.com          │
│                                                      │
│  - Public website                                    │
│  - Product pages                                     │
│  - Shopping cart                                     │
│  - /admin → redirects to backend                     │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ API Calls
                       ▼
┌──────────────────────────────────────────────────────┐
│  Strapi Backend App ([strapi-app-name])             │
│  https://[strapi-app-name].herokuapp.com            │
│                                                      │
│  - REST API                                          │
│  - /admin → Admin Panel ← YOU ACCESS THIS           │
│  - Content management                                │
│  - Database (Heroku Postgres)                        │
└──────────────────────────────────────────────────────┘
```

## Summary

✅ **Frontend URL:** For customers browsing your shop
```
https://carafe-82d2cfeaa846.herokuapp.com
```

✅ **Backend Admin URL:** For managing content (YOU)
```
https://[strapi-app-name].herokuapp.com/admin
```

❌ **Wrong:** Trying to access admin on frontend URL directly
```
https://carafe-82d2cfeaa846.herokuapp.com/admin
(This was causing the error - now it redirects correctly)
```

---

**Need Help?** 
- Check logs: `heroku logs --tail --app [app-name]`
- Run diagnostic: `./scripts/check-strapi-admin.sh [strapi-app-name]`
- See: `STRAPI_ADMIN_ACCESS.md`
