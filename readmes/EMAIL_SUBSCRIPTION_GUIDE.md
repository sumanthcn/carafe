# Email Subscription System - Implementation Guide

## Overview
Complete, production-ready email subscription system for Carafe Coffee website. Users can subscribe from any page, data is stored in Strapi, and can be exported for email marketing campaigns.

---

## Architecture

### Why This Structure is Scalable

1. **Database Level Validation**
   - Unique constraint on email field prevents duplicates at DB level
   - Email validation at both frontend and backend
   - Normalized emails (lowercase, trimmed) ensure data consistency

2. **Separation of Concerns**
   - Strapi handles data storage and API
   - Nuxt composable handles API communication
   - Vue component handles UI and user interaction
   - Toast system provides non-blocking feedback

3. **Reusability**
   - Component can be used on any page (footer, homepage, modal, popup)
   - Source tracking allows analytics on which page drives subscriptions
   - Props-based customization (title, description, button text)

4. **Marketing Ready**
   - `source` field tracks where subscriptions originated
   - `isActive` field allows soft-delete (unsubscribe without data loss)
   - `createdAt` timestamp for segmentation by signup date
   - Clean data structure ready for CSV export or API integration

---

## Backend Setup (Strapi)

### Step 1: Files Created

```
strapi-backend/src/api/email-subscriber/
├── content-types/
│   └── email-subscriber/
│       └── schema.json          # Data model definition
├── controllers/
│   └── email-subscriber.ts      # Business logic
├── routes/
│   └── email-subscriber.ts      # API routes
└── services/
    └── email-subscriber.ts      # Service layer
```

### Step 2: Restart Strapi

```bash
cd strapi-backend
yarn develop
```

### Step 3: Set Permissions

1. Go to: `http://localhost:1337/admin`
2. Navigate to: **Settings → Roles → Public**
3. Find: **Email-subscriber**
4. Enable: **subscribe** (custom route)
5. Click: **Save**

### Step 4: Test API

```bash
# Successful subscription
curl -X POST http://localhost:1337/api/email-subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"footer"}'

# Expected response (201):
{
  "message": "Successfully subscribed to our Coffee Circle!",
  "code": "SUCCESS",
  "subscriber": {
    "email": "test@example.com",
    "subscribedAt": "2025-12-25T12:00:00.000Z"
  }
}

# Duplicate subscription
curl -X POST http://localhost:1337/api/email-subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"footer"}'

# Expected response (200):
{
  "message": "This email is already subscribed",
  "code": "ALREADY_SUBSCRIBED",
  "subscriber": {
    "email": "test@example.com",
    "subscribedAt": "2025-12-25T12:00:00.000Z"
  }
}

# Invalid email
curl -X POST http://localhost:1337/api/email-subscribers/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","source":"footer"}'

# Expected response (400):
{
  "message": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

---

## Frontend Setup (Nuxt 3)

### Files Created

```
nuxt-frontend/
├── composables/
│   └── useEmailSubscription.ts   # API communication logic
└── components/
    └── EmailSubscribe.vue         # Reusable subscription component
```

### Dependencies Installed

```bash
npm install @nuxt/ui
```

### Configuration Added

**nuxt.config.ts:**
```typescript
modules: [
  "@nuxt/ui",  // Toast notifications
  // ... other modules
]
```

---

## Usage Examples

### 1. Footer (Global)
```vue
<!-- components/TheFooter.vue -->
<EmailSubscribe source="footer" />
```

### 2. Homepage
```vue
<!-- pages/index.vue -->
<EmailSubscribe source="homepage" />
```

### 3. Modal/Popup
```vue
<!-- components/NewsletterPopup.vue -->
<EmailSubscribe 
  source="popup"
  title="Get 10% Off Your First Order"
  description="Join our Coffee Circle and receive exclusive discounts"
  buttonText="Get Discount"
/>
```

### 4. Custom Styling
```vue
<!-- Can override styles with scoped CSS -->
<EmailSubscribe source="sidebar" class="sidebar-subscribe" />

<style scoped>
.sidebar-subscribe :deep(.subscribe-title) {
  font-size: 1.5rem;
}
</style>
```

---

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | String | "JOIN OUR COFFEE CIRCLE" | Main heading |
| `description` | String | "Be the first to discover..." | Description text |
| `placeholder` | String | "Enter your email address" | Input placeholder |
| `buttonText` | String | "SUBSCRIBE" | Button text |
| `source` | String | "footer" | Analytics tracking source |

---

## Validation Rules

### Frontend
- Email required
- Valid email format (regex)
- Disabled submit while loading
- Real-time validation on blur

### Backend
- Email required (400 if missing)
- Email format validation (400 if invalid)
- Unique constraint (200 if duplicate, friendly message)
- Normalized to lowercase + trimmed

---

## Error Handling

### User-Facing Messages

| Scenario | Toast Type | Message |
|----------|-----------|---------|
| Success (new) | Green | "Welcome to Our Coffee Circle! Thanks for subscribing..." |
| Success (duplicate) | Blue | "Already Subscribed - You're already part of our Coffee Circle!" |
| Invalid email | Red | "Please enter a valid email address" |
| Server error | Red | "Failed to subscribe. Please try again." |
| Network error | Red | "Connection failed. Please check your internet." |

---

## Future Marketing Extensions

### 1. Email Campaign Integration

**Mailchimp Integration:**
```typescript
// strapi-backend/src/api/email-subscriber/services/email-subscriber.ts

async syncToMailchimp(subscriberId: number) {
  const subscriber = await strapi.entityService.findOne(
    'api::email-subscriber.email-subscriber',
    subscriberId
  );
  
  await fetch('https://api.mailchimp.com/3.0/lists/{LIST_ID}/members', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: subscriber.email,
      status: 'subscribed',
      merge_fields: {
        SOURCE: subscriber.source,
      },
    }),
  });
}
```

**SendGrid Integration:**
```typescript
async syncToSendGrid(subscriberId: number) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const subscriber = await strapi.entityService.findOne(
    'api::email-subscriber.email-subscriber',
    subscriberId
  );
  
  await sgMail.send({
    to: subscriber.email,
    from: 'hello@carafe.coffee',
    templateId: 'welcome-email-template-id',
    dynamicTemplateData: {
      source: subscriber.source,
    },
  });
}
```

### 2. Subscriber Segmentation

**Query by source:**
```typescript
// Get all subscribers from homepage
const homepageSubscribers = await strapi.db
  .query('api::email-subscriber.email-subscriber')
  .findMany({
    where: { source: 'homepage', isActive: true },
  });

// Get recent subscribers (last 30 days)
const recentSubscribers = await strapi.db
  .query('api::email-subscriber.email-subscriber')
  .findMany({
    where: {
      isActive: true,
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
```

### 3. Unsubscribe Mechanism

**Add to schema.json:**
```json
{
  "unsubscribedAt": {
    "type": "datetime",
    "default": null
  },
  "unsubscribeReason": {
    "type": "string",
    "default": null
  }
}
```

**Controller method:**
```typescript
async unsubscribe(ctx) {
  const { email } = ctx.request.body;
  
  await strapi.db
    .query('api::email-subscriber.email-subscriber')
    .update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });
    
  return ctx.send({ message: 'Successfully unsubscribed' });
}
```

### 4. Export for Email Marketing

**CSV Export:**
```typescript
// In Strapi admin panel
async exportSubscribers() {
  const subscribers = await strapi.db
    .query('api::email-subscriber.email-subscriber')
    .findMany({
      where: { isActive: true },
    });
    
  // Convert to CSV
  const csv = subscribers.map(s => 
    `${s.email},${s.source},${s.createdAt}`
  ).join('\n');
  
  return csv;
}
```

### 5. Analytics & Reporting

**Subscription metrics:**
```typescript
// Total subscribers
const total = await strapi.db
  .query('api::email-subscriber.email-subscriber')
  .count({ where: { isActive: true } });

// By source
const bySource = await strapi.db
  .query('api::email-subscriber.email-subscriber')
  .findMany({
    select: ['source'],
    groupBy: ['source'],
  });

// Growth over time
const growth = await strapi.db
  .query('api::email-subscriber.email-subscriber')
  .findMany({
    where: {
      createdAt: {
        $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    groupBy: ['createdAt'],
  });
```

### 6. Welcome Email Automation

**Auto-send on subscribe:**
```typescript
// In controller after successful subscription
await strapi.plugins['email'].services.email.send({
  to: normalizedEmail,
  from: 'hello@carafe.coffee',
  subject: 'Welcome to the Carafe Coffee Circle!',
  html: `
    <h1>Welcome to Our Coffee Family!</h1>
    <p>Thank you for joining our community of coffee lovers.</p>
    <p>As a thank you, here's 10% off your first order: <strong>WELCOME10</strong></p>
    <a href="https://carafe.coffee/shop">Start Shopping</a>
  `,
});
```

---

## Security Considerations

1. **Rate Limiting** (Future Enhancement)
   ```typescript
   // Add to middleware
   {
     name: 'rateLimit',
     config: {
       max: 5, // 5 requests
       window: '15m', // per 15 minutes
     }
   }
   ```

2. **Email Verification** (Optional)
   - Add `isVerified` boolean field
   - Send verification email with token
   - Only count verified subscribers

3. **GDPR Compliance**
   - Store consent timestamp
   - Provide data export endpoint
   - Implement right to deletion

---

## Testing

### Unit Tests (Example)
```typescript
// tests/email-subscription.test.ts
describe('Email Subscription', () => {
  it('should validate email format', () => {
    const { validateEmail } = useEmailSubscription();
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });
  
  it('should handle duplicate subscriptions', async () => {
    const { subscribe } = useEmailSubscription();
    const result = await subscribe('duplicate@test.com', 'footer');
    expect(result.code).toBe('ALREADY_SUBSCRIBED');
  });
});
```

---

## Monitoring & Analytics

### Track in Google Analytics
```typescript
// Add to component after successful subscription
if (result.success) {
  gtag('event', 'newsletter_signup', {
    event_category: 'engagement',
    event_label: props.source,
    value: 1,
  });
}
```

### Dashboard Metrics to Track
- Total subscribers
- Subscription rate by source
- Daily/weekly growth
- Bounce rate (if email verification added)
- Unsubscribe rate

---

## Maintenance

### Regular Tasks
1. **Monthly:** Export subscriber list for backup
2. **Quarterly:** Clean inactive/bounced emails
3. **Annually:** Review and update privacy policy
4. **As needed:** Sync with email marketing platform

### Database Queries
```sql
-- Find all active subscribers
SELECT * FROM email_subscribers WHERE is_active = true;

-- Count by source
SELECT source, COUNT(*) as count 
FROM email_subscribers 
WHERE is_active = true 
GROUP BY source;

-- Recent signups
SELECT * FROM email_subscribers 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Issue: Emails not saving
- Check Strapi permissions (Public → email-subscriber → subscribe)
- Verify API endpoint is accessible
- Check browser console for CORS errors

### Issue: Toast not showing
- Ensure @nuxt/ui is installed
- Check nuxt.config.ts has module added
- Verify no conflicting CSS

### Issue: Duplicate error not handled
- Database unique constraint must be set
- Check schema.json has `unique: true`
- Restart Strapi after schema changes

---

## Production Checklist

- [ ] Strapi permissions configured
- [ ] Database unique constraint verified
- [ ] Environment variables set
- [ ] Email validation working
- [ ] Toast notifications displaying
- [ ] Component responsive on all devices
- [ ] Analytics tracking implemented
- [ ] Privacy policy updated
- [ ] GDPR compliance reviewed
- [ ] Backup strategy in place

---

## Support & Documentation

- **Strapi Docs:** https://docs.strapi.io
- **Nuxt UI Docs:** https://ui.nuxt.com
- **Vue 3 Docs:** https://vuejs.org

For questions specific to this implementation, refer to the inline code comments in:
- `useEmailSubscription.ts`
- `EmailSubscribe.vue`
- `email-subscriber.ts` (controller)
