# Visit Cafe Setup Guide

## Problem
The Visit Cafe page shows "Unable to load page content" because:
1. The API endpoint doesn't have public permissions
2. No content has been added to the Visit Cafe single type

## Solution Steps

### Step 1: Enable API Permissions

1. **Open Strapi Admin Panel**
   - Local: http://localhost:1337/admin
   - Production: https://carafe-strapi-6a5c003b33c5.herokuapp.com/admin

2. **Navigate to Permissions**
   - Settings → Users & Permissions plugin → Roles → Public

3. **Enable Visit Cafe Permissions**
   - Scroll down to find "Visit-cafe"
   - Check the boxes for:
     - ✅ `find`
     - ✅ `findOne`
   - Click **Save** button (top right)

### Step 2: Add Content

1. **Go to Content Manager**
   - Content Manager → Visit Cafe (Single Type)

2. **Fill in the sections:**

#### Banner Section
- **Background Image**: Upload a banner image
- **Title**: e.g., "VISIT OUR CAFÉ"
- **Subtitle**: Optional subtitle
- **Description**: Optional description

#### Brand Story Section
- **Heading**: e.g., "OUR STORY"
- **Title**: e.g., "Where Coffee Meets Culture"
- **Description**: Your café's story
- **Images**: Upload 2-4 images for the gallery

#### Opening Hours Section
- **Background Image**: Upload a background image
- **Title**: e.g., "OPENING HOURS"
- **Monday to Saturday**: e.g., "8:00 AM - 6:00 PM"
- **Sunday**: e.g., "9:00 AM - 4:00 PM"

#### Getting Here Section
- **Title**: e.g., "HOW TO FIND US"
- **Items**: Add transportation options
  - Icon (upload small icon)
  - Name (e.g., "By Car", "By Train", "By Bus", "On Foot")
  - Description (directions)

#### SEO Section
- **Meta Title**: e.g., "Visit Our Café - Carafe Coffee"
- **Meta Description**: SEO description
- **Meta Image**: Social media image

3. **Click Save**

### Step 3: Test the API

**Local:**
```bash
curl http://localhost:1337/api/visit-cafe?populate=deep
```

**Production:**
```bash
curl https://carafe-strapi-6a5c003b33c5.herokuapp.com/api/visit-cafe?populate=deep
```

### Step 4: Deploy to Production

After adding content locally:

```bash
# Export local database
./scripts/export-import-database.sh

# Or manually push to Heroku
heroku pg:push carafe_strapi DATABASE --app carafe-strapi
```

---

## Automated Permission Setup (Future)

A migration file has been created: `database/migrations/2026-01-01-enable-visit-cafe-permissions.js`

This migration will automatically set permissions when you run:
```bash
cd strapi-backend
yarn strapi migrate
```

**Note**: Strapi migrations for permissions don't run automatically. You need to:
1. Set permissions manually through the admin panel (recommended)
2. Or run custom migration scripts

---

## Troubleshooting

### Issue: API returns 403 Forbidden
**Solution**: Permissions not set. Follow Step 1 above.

### Issue: API returns 404 Not Found
**Solution**: Content not added. Follow Step 2 above.

### Issue: API returns empty data
**Solution**: 
1. Check if content is published (if draftAndPublish is enabled)
2. Verify content exists in Content Manager

### Issue: Images not loading
**Solution**:
1. Check if images are uploaded
2. Verify STRAPI_URL is correct in frontend
3. For production, consider using cloud storage (Cloudinary, S3)

---

## Quick Check Script

Run this to verify setup:
```bash
./scripts/set-visit-cafe-permissions.sh
```

---

## Production Deployment Checklist

When deploying Visit Cafe to production:

- [ ] Add content in local Strapi admin
- [ ] Set permissions for public access (local)
- [ ] Test locally: http://localhost:3000/visit-cafe
- [ ] Export database: `./scripts/export-import-database.sh`
- [ ] Commit code changes
- [ ] Deploy backend: `git subtree push --prefix strapi-backend heroku-backend master`
- [ ] Set permissions in production admin panel
- [ ] Test production: https://carafe-82d2cfeaa846.herokuapp.com/visit-cafe
- [ ] Verify API: https://carafe-strapi-6a5c003b33c5.herokuapp.com/api/visit-cafe

---

## Important Notes

### Ephemeral Filesystem (Heroku)
- Uploaded images to `public/uploads` are temporary on Heroku
- They will be deleted on dyno restart
- **Solution**: Use cloud storage for production (Cloudinary, AWS S3)

### Database Migrations
- Always create migrations for schema changes
- Run `yarn strapi generate` to create migration files
- Permissions must be set manually or via custom scripts

### Content Updates
- Local content changes require database export/import
- Or manually add content in production admin
- Consider using Strapi's data transfer feature for large updates

