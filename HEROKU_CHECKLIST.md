# Heroku Deployment Checklist

## Pre-Deployment

- [ ] Install Heroku CLI: `brew install heroku/brew/heroku`
- [ ] Login to Heroku: `heroku login`
- [ ] Ensure all code is committed: `git status`
- [ ] Review environment variables needed
- [ ] Have credit card ready (required for addons, even free ones)

## Backend Deployment (Strapi)

- [ ] Create Heroku app: `heroku create carafe-strapi`
- [ ] Add PostgreSQL addon: `heroku addons:create heroku-postgresql:mini --app carafe-strapi`
- [ ] Generate secrets: `./scripts/generate-secrets.sh`
- [ ] Set environment variables:
  - [ ] `APP_KEYS`
  - [ ] `API_TOKEN_SALT`
  - [ ] `ADMIN_JWT_SECRET`
  - [ ] `TRANSFER_TOKEN_SALT`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `PUBLIC_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_CLIENT=postgres`
- [ ] Verify DATABASE_URL is set: `heroku config --app carafe-strapi | grep DATABASE_URL`
- [ ] Deploy: `git subtree push --prefix strapi-backend heroku-backend master`
- [ ] Check logs: `heroku logs --tail --app carafe-strapi`
- [ ] Access admin panel: `https://carafe-strapi.herokuapp.com/admin`
- [ ] Create admin user
- [ ] Generate API token in Strapi admin (Settings → API Tokens)

## Frontend Deployment (Nuxt)

- [ ] Create Heroku app: `heroku create carafe-frontend`
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `NUXT_PUBLIC_SITE_URL=https://carafe-frontend.herokuapp.com`
  - [ ] `NUXT_PUBLIC_STRAPI_URL=https://carafe-strapi.herokuapp.com`
  - [ ] `STRAPI_API_TOKEN` (from Strapi admin)
  - [ ] `WORLDPAY_MERCHANT_CODE` (optional)
  - [ ] `WORLDPAY_XML_PASSWORD` (optional)
  - [ ] `WORLDPAY_MAC_SECRET` (optional)
  - [ ] `WORLDPAY_ENV=live` (optional)
- [ ] Deploy: `git subtree push --prefix nuxt-frontend heroku-frontend master`
- [ ] Check logs: `heroku logs --tail --app carafe-frontend`
- [ ] Access site: `https://carafe-frontend.herokuapp.com`

## Post-Deployment Configuration

### Strapi Backend
- [ ] Configure CORS in `config/middlewares.ts` to allow frontend domain
- [ ] Set up email provider (if using email features)
- [ ] Configure media library (Cloudinary or S3 recommended)
- [ ] Import/create initial content
- [ ] Test API endpoints
- [ ] Set up roles & permissions

### Nuxt Frontend
- [ ] Test homepage loads
- [ ] Test product pages
- [ ] Test cart functionality
- [ ] Test checkout flow (in test mode)
- [ ] Verify SEO tags
- [ ] Check sitemap: `/sitemap.xml`
- [ ] Check robots.txt: `/robots.txt`

## Custom Domain Setup (Optional)

### Backend (cms.carafe.coffee)
- [ ] Add domain: `heroku domains:add cms.carafe.coffee --app carafe-strapi`
- [ ] Get DNS target: `heroku domains --app carafe-strapi`
- [ ] Update DNS records (CNAME)
- [ ] Update `PUBLIC_URL` config var
- [ ] Update CORS settings

### Frontend (carafe.coffee)
- [ ] Add domain: `heroku domains:add carafe.coffee --app carafe-frontend`
- [ ] Add www: `heroku domains:add www.carafe.coffee --app carafe-frontend`
- [ ] Get DNS targets: `heroku domains --app carafe-frontend`
- [ ] Update DNS records (A/CNAME)
- [ ] Update `NUXT_PUBLIC_SITE_URL` config var
- [ ] Update Strapi's `FRONTEND_URL` config var

### SSL Certificates
- [ ] Enable Automated Certificate Management (ACM): `heroku certs:auto:enable --app carafe-strapi`
- [ ] Enable ACM for frontend: `heroku certs:auto:enable --app carafe-frontend`
- [ ] Wait for certificates to provision (can take up to 30 minutes)
- [ ] Verify SSL: `https://www.ssllabs.com/ssltest/`

## Monitoring & Maintenance

- [ ] Set up log drains (optional): Papertrail, Loggly, etc.
- [ ] Configure metrics dashboard
- [ ] Set up uptime monitoring: UptimeRobot, Pingdom, etc.
- [ ] Configure backups:
  - [ ] Database: `heroku pg:backups:schedule --at '02:00 America/Los_Angeles' DATABASE_URL --app carafe-strapi`
- [ ] Set up alerts for errors
- [ ] Document rollback procedure

## Testing Production

- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Images load properly
- [ ] Products display with correct data
- [ ] Cart functionality works
- [ ] Search works (if implemented)
- [ ] Forms submit correctly
- [ ] API responses are fast
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser testing
- [ ] Payment flow (test mode first!)

## Performance Optimization

- [ ] Enable gzip compression (enabled by default on Heroku)
- [ ] Configure caching headers
- [ ] Optimize images (use CDN or image service)
- [ ] Consider upgrading dyno types if slow
- [ ] Monitor dyno metrics
- [ ] Consider adding CDN (Cloudflare, Fastly)

## Security

- [ ] Ensure all secrets are set and not in code
- [ ] Review Strapi permissions
- [ ] Enable rate limiting
- [ ] Set up security headers
- [ ] Regular dependency updates
- [ ] Set up security alerts

## Go-Live

- [ ] Update DNS to point to Heroku
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Test from different locations
- [ ] Monitor error rates
- [ ] Check analytics setup
- [ ] Announce launch! 🎉

## Emergency Contacts

- Heroku Status: https://status.heroku.com
- Heroku Support: https://help.heroku.com
- Internal Dev Team: dev@carafe.coffee

## Quick Reference Commands

```bash
# View logs
heroku logs --tail --app carafe-strapi
heroku logs --tail --app carafe-frontend

# Restart apps
heroku restart --app carafe-strapi
heroku restart --app carafe-frontend

# Scale dynos
heroku ps:scale web=2 --app carafe-frontend

# Run commands
heroku run bash --app carafe-strapi
heroku run npm run strapi -- migration:run --app carafe-strapi

# Database
heroku pg:info --app carafe-strapi
heroku pg:backups --app carafe-strapi
heroku pg:backups:capture --app carafe-strapi

# Config
heroku config --app carafe-strapi
heroku config:set KEY=value --app carafe-strapi
heroku config:unset KEY --app carafe-strapi

# Releases
heroku releases --app carafe-strapi
heroku rollback --app carafe-strapi
```

## Notes

- Keep this checklist updated as you deploy
- Document any issues encountered
- Save all generated secrets securely (1Password, etc.)
- Test thoroughly before switching production DNS
