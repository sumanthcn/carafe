# =============================================================================

# PRODUCTION SEO CHECKLIST - CARAFE COFFEE

# =============================================================================

## Pre-Launch Checklist

### Technical SEO

- [ ] **SSL Certificate**: HTTPS enabled on all pages
- [ ] **Canonical URLs**: All pages have proper canonical tags
- [ ] **Sitemap**: sitemap.xml generated and accessible at /sitemap.xml
- [ ] **Robots.txt**: Properly configured at /robots.txt
- [ ] **Meta Tags**: All pages have title, description, OG tags
- [ ] **Structured Data**: JSON-LD schemas validated
- [ ] **Mobile-Friendly**: Responsive design passes Google test
- [ ] **Page Speed**: Core Web Vitals passing (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Content SEO

- [ ] **Homepage**: Title includes brand name and primary keyword
- [ ] **Product Pages**: Unique titles, descriptions, and schema
- [ ] **Category Pages**: Optimized for category keywords
- [ ] **Blog/Articles**: If applicable, proper heading hierarchy
- [ ] **Image Alt Text**: All images have descriptive alt text
- [ ] **Internal Linking**: Logical site structure with breadcrumbs

### Structured Data Validation

Test at: https://validator.schema.org/

- [ ] **Organization Schema**: Business info, logo, social profiles
- [ ] **LocalBusiness Schema**: Address, opening hours, geo coordinates
- [ ] **Product Schema**: Price, availability, reviews, images
- [ ] **Breadcrumb Schema**: Navigation path on all pages
- [ ] **WebPage Schema**: Basic page information

### Performance

- [ ] **Images**: WebP format, lazy loading, proper sizing
- [ ] **CSS/JS**: Minified and bundled
- [ ] **Caching**: Proper cache headers for static assets
- [ ] **CDN**: Consider for global performance
- [ ] **Server**: Gzip compression enabled

### Analytics & Tracking

- [ ] **Google Analytics**: GA4 installed and tracking
- [ ] **Google Search Console**: Site verified and submitted
- [ ] **Bing Webmaster Tools**: Optional but recommended
- [ ] **Enhanced Ecommerce**: Product impressions, add to cart, purchases

---

## Post-Launch Monitoring

### Google Search Console

1. Submit sitemap
2. Request indexing for important pages
3. Monitor for crawl errors
4. Check mobile usability
5. Review Core Web Vitals

### Lighthouse Audit

Run audits for:

- Homepage
- Product listing page
- Product detail page
- Checkout flow

Target scores:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Regular Monitoring

Weekly:

- [ ] Check Search Console for errors
- [ ] Review analytics traffic

Monthly:

- [ ] Full Lighthouse audit
- [ ] Review keyword rankings
- [ ] Update sitemap if needed
- [ ] Check for broken links

---

## SEO Tools

### Validation Tools

- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/
- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly
- PageSpeed Insights: https://pagespeed.web.dev/

### Monitoring Tools

- Google Search Console
- Google Analytics 4
- Bing Webmaster Tools
- Lighthouse (Chrome DevTools)

### Third-Party Tools (Optional)

- Ahrefs / SEMrush / Moz
- Screaming Frog SEO Spider
- GTmetrix
- WebPageTest

---

## Common Issues & Fixes

### Duplicate Content

- Ensure canonical tags are set
- Use 301 redirects for old URLs
- Avoid parameter-based duplicates

### Slow Page Speed

- Optimize images (WebP, proper sizing)
- Enable lazy loading
- Minimize JavaScript
- Use ISR for product pages

### Poor Mobile Experience

- Test on real devices
- Ensure tap targets are large enough
- Avoid horizontal scrolling
- Check font sizes (minimum 16px)

### Missing Schema

- Add JSON-LD to all page types
- Validate with Google's tool
- Include required properties

### Crawl Issues

- Check robots.txt isn't blocking important pages
- Ensure internal links are crawlable
- Fix broken links promptly
