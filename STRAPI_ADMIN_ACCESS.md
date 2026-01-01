# Strapi Admin Panel Access on Heroku - Troubleshooting Guide

## Problem
Admin panel not accessible at `/admin` endpoint after Heroku deployment.

## Common Causes & Solutions

### 1. Admin Panel Not Built

**Symptom:** 404 error when accessing `/admin`

**Solution:** Ensure the admin panel is built during deployment.

Check your Heroku build logs:
```bash
heroku logs --tail --app carafe-82d2cfeaa846
```

Look for this line during build:
```
✔ Building admin panel (27282ms)
```

If you don't see this, the admin panel wasn't built. This could be because:

**Fix:** Ensure `yarn build` runs during deployment (it should by default with the Procfile).

### 2. Missing Environment Variables

**Required Variables:**
```bash
heroku config:set \
  ADMIN_JWT_SECRET=your_secret \
  APP_KEYS=key1,key2,key3,key4 \
  API_TOKEN_SALT=your_salt \
  TRANSFER_TOKEN_SALT=your_salt \
  JWT_SECRET=your_secret \
  --app carafe-82d2cfeaa846
```

**Check current config:**
```bash
heroku config --app carafe-82d2cfeaa846
```

### 3. Wrong Admin URL Configuration

**Check your admin.ts config:**

The `config/admin.ts` should have:
```typescript
export default ({ env }) => ({
  // ... other config
  url: env('PUBLIC_URL', '/admin'),
  serveAdminPanel: env.bool('SERVE_ADMIN_PANEL', true),
});
```

### 4. Double Slash in URL

**Issue:** You mentioned accessing `https://carafe-82d2cfeaa846.herokuapp.com//admin` (double slash)

**Fix:** Use single slash:
```
https://carafe-82d2cfeaa846.herokuapp.com/admin
```

### 5. Port Binding Issue

**Symptom:** App crashes or doesn't respond

**Check:** Ensure Strapi is listening on Heroku's assigned PORT:

```bash
heroku config:get PORT --app carafe-82d2cfeaa846
```

Your `config/server.ts` should have:
```typescript
port: env.int('PORT', 1337),
```

### 6. Database Connection Issue

**Symptom:** App starts but admin panel shows errors

**Check database:**
```bash
heroku pg:info --app carafe-82d2cfeaa846
```

**Check connection:**
```bash
heroku config:get DATABASE_URL --app carafe-82d2cfeaa846
```

## Step-by-Step Verification

### Step 1: Check App Status
```bash
heroku ps --app carafe-82d2cfeaa846
```

Should show:
```
=== web (Eco): yarn start
web.1: up 2024/01/01 12:00:00 +0000 (~ 5m ago)
```

### Step 2: Check Logs
```bash
heroku logs --tail --app carafe-82d2cfeaa846
```

Look for:
- ✅ `Server started on port [PORT]`
- ✅ `Admin panel is accessible`
- ❌ Any error messages

### Step 3: Test API Endpoint
```bash
curl https://carafe-82d2cfeaa846.herokuapp.com/api
```

Should return:
```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError"
  }
}
```

### Step 4: Test Admin Endpoint
```bash
curl -I https://carafe-82d2cfeaa846.herokuapp.com/admin
```

Should return:
```
HTTP/2 200
content-type: text/html; charset=utf-8
```

### Step 5: Access Admin Panel

Open in browser:
```
https://carafe-82d2cfeaa846.herokuapp.com/admin
```

You should see the Strapi login page.

## If Still Not Working

### Check Build Was Successful

```bash
heroku releases --app carafe-82d2cfeaa846
```

If the latest release failed, rollback and redeploy:
```bash
heroku rollback --app carafe-82d2cfeaa846
```

### Trigger Manual Build

```bash
# Force rebuild
git commit --allow-empty -m "Rebuild admin panel"
git push heroku-backend master
```

### Check if Admin Files Exist

```bash
heroku run ls -la /app/dist/build --app carafe-82d2cfeaa846
```

Should show admin build files.

### Enable Debug Logging

```bash
heroku config:set NODE_ENV=development --app carafe-82d2cfeaa846
heroku restart --app carafe-82d2cfeaa846
heroku logs --tail --app carafe-82d2cfeaa846
```

Then switch back to production:
```bash
heroku config:set NODE_ENV=production --app carafe-82d2cfeaa846
heroku restart --app carafe-82d2cfeaa846
```

## Quick Fix Commands

### 1. Ensure All Required Config is Set
```bash
# Generate new secrets if needed
./scripts/generate-secrets.sh

# Set them on Heroku (use output from above)
heroku config:set \
  APP_KEYS="key1,key2,key3,key4" \
  ADMIN_JWT_SECRET="secret" \
  API_TOKEN_SALT="salt" \
  TRANSFER_TOKEN_SALT="salt" \
  JWT_SECRET="secret" \
  PUBLIC_URL="https://carafe-82d2cfeaa846.herokuapp.com" \
  DATABASE_CLIENT=postgres \
  SERVE_ADMIN_PANEL=true \
  --app carafe-82d2cfeaa846
```

### 2. Restart App
```bash
heroku restart --app carafe-82d2cfeaa846
```

### 3. Check Again
```bash
# Wait 30 seconds for app to start
sleep 30

# Test
curl -I https://carafe-82d2cfeaa846.herokuapp.com/admin
```

## Expected Result

After successful deployment, you should be able to:

1. **Access API:** `https://carafe-82d2cfeaa846.herokuapp.com/api` → Returns JSON
2. **Access Admin:** `https://carafe-82d2cfeaa846.herokuapp.com/admin` → Shows login page
3. **Create Admin User:** First time only, create your admin account
4. **Login:** Use your credentials to access the admin panel

## Still Having Issues?

### Check These Files:

1. **`strapi-backend/config/admin.ts`** - Should have `serveAdminPanel: true`
2. **`strapi-backend/config/server.ts`** - Should use `env.int('PORT')`
3. **`strapi-backend/Procfile`** - Should have `web: yarn start`
4. **`strapi-backend/package.json`** - Should have `"build": "strapi build"`

### Get Support:

```bash
# Collect diagnostics
heroku config --app carafe-82d2cfeaa846 > heroku-config.txt
heroku ps --app carafe-82d2cfeaa846 > heroku-ps.txt
heroku logs --tail --app carafe-82d2cfeaa846 > heroku-logs.txt

# Share these files for support
```

## Common Error Messages

### "Cannot GET /admin"
- Admin panel not built
- Check build logs
- Verify `yarn build` ran successfully

### "Application error"
- Check `heroku logs --tail`
- Usually a startup error
- Check environment variables

### Blank page at /admin
- JavaScript error in admin panel
- Check browser console (F12)
- Check `PUBLIC_URL` is set correctly

### "Failed to load admin panel"
- CORS issue
- Check `PUBLIC_URL` matches your Heroku domain
- Clear browser cache

## Prevention

Add to your deployment checklist:

- ✅ All environment variables set
- ✅ `yarn build` completes successfully
- ✅ `SERVE_ADMIN_PANEL=true` is set
- ✅ `PUBLIC_URL` matches Heroku domain
- ✅ Database is connected
- ✅ Test `/admin` immediately after deployment
