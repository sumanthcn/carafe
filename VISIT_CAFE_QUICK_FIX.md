# Visit Cafe - Quick Fix Steps

## The Issue
"Unable to load page content. Please try again later." appears because:
1. ❌ No public API permissions set for visit-cafe endpoint
2. ❌ No content added to the Visit Cafe page

## Quick Fix (5 minutes)

### Step 1: Set Permissions ⚙️
Just opened in your browser → Click on **Public** role

Then:
1. Scroll to **"Visit-cafe"** section
2. Check these boxes: ☑️ `find` and ☑️ `findOne`  
3. Click **Save** (top right corner)

### Step 2: Add Content ✍️
1. Go to: **Content Manager** → **Visit Cafe**
2. Fill in at minimum:
   - Banner Title (e.g., "VISIT OUR CAFÉ")
   - Opening Hours (Monday-Saturday & Sunday times)
3. Click **Save**

### Step 3: Test 🧪
Visit: https://carafe-82d2cfeaa846.herokuapp.com/visit-cafe

---

## What Changed in This Commit?

### Fixed Files:
1. **`useVisitCafe.ts`** - Uncommented all populate parameters for proper data fetching
2. **Migration file** - Auto-sets permissions for future deployments
3. **Setup script** - Helper to verify permissions
4. **Documentation** - Complete setup guide

### For Future Deployments:
- Always add content in Strapi admin first
- Set public permissions for new endpoints
- Export local DB before deploying: `./scripts/export-import-database.sh`
- This ensures content is migrated to production

---

## API Test Commands

**Check if permissions work:**
```bash
# Should return JSON data (not HTML)
curl https://carafe-strapi-6a5c003b33c5.herokuapp.com/api/visit-cafe

# With population (full data)
curl "https://carafe-strapi-6a5c003b33c5.herokuapp.com/api/visit-cafe?populate=deep"
```

**Expected response:**
- ✅ 200 OK with JSON data = Working
- ❌ 403 Forbidden = Permissions not set (go to Step 1)
- ❌ 404 Not Found = Content not added (go to Step 2)
- ❌ HTML page = Wrong URL or Strapi issue

---

## Files Created/Modified

```
✓ nuxt-frontend/composables/useVisitCafe.ts (fixed populate params)
✓ strapi-backend/database/migrations/2026-01-01-enable-visit-cafe-permissions.js (new)
✓ scripts/set-visit-cafe-permissions.sh (new)
✓ VISIT_CAFE_SETUP.md (comprehensive guide)
✓ VISIT_CAFE_QUICK_FIX.md (this file)
```

---

## Next Time You Add a New Page

1. **Create Strapi content type** (admin panel or code)
2. **Set public permissions** immediately
3. **Add test content** in admin
4. **Test API endpoint** with curl
5. **Create migration file** for permissions
6. **Document setup steps**
7. **Commit to feature branch**
8. **Deploy after testing**

This prevents the "Unable to load content" issue!

---

## Production Deployment Flow

```bash
# 1. Work on feature branch
git checkout -b cns-visit-cafe

# 2. Make changes, test locally
yarn dev

# 3. Add content in local Strapi
# 4. Test at http://localhost:3000/visit-cafe

# 5. Commit changes
git add -A
git commit -m "Add visit cafe page"

# 6. Merge to master
git checkout master
git merge cns-visit-cafe

# 7. Export database
./scripts/export-import-database.sh

# 8. Deploy backend
git subtree push --prefix strapi-backend heroku-backend master

# 9. Deploy frontend (if needed)
git push heroku master

# 10. Set permissions in production admin
# (manual step - can't be automated due to Strapi limitations)
```

---

**Created**: January 1, 2026  
**Branch**: `cns-visit-cafe`  
**Status**: Ready for setup ✅
