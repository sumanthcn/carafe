# =============================================================================

# CARAFE COFFEE - PROJECT README

# =============================================================================

# Carafe Coffee House & Roasters

A production-ready specialty coffee e-commerce website built with Strapi CMS and Nuxt 3.

## 🚀 Tech Stack

### Backend

- **Strapi 5.6** - Headless CMS
- **PostgreSQL** - Database
- **REST API** - API architecture

### Frontend

- **Nuxt 3.14** - Vue.js framework with SSR/SSG
- **Vue 3** - Composition API
- **Pinia** - State management
- **SCSS** - Styling

### Payments

- **Worldpay** - Payment gateway

### Infrastructure

- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **PM2** - Process manager

## 📁 Project Structure

```
carafe-coffee/
├── strapi-backend/          # Strapi CMS
│   ├── config/              # Server configuration
│   ├── src/
│   │   ├── api/             # Content types & APIs
│   │   └── components/      # Reusable components
│   └── Dockerfile
│
├── nuxt-frontend/           # Nuxt 3 frontend
│   ├── assets/              # SCSS styles
│   ├── components/          # Vue components
│   ├── composables/         # Shared logic
│   ├── layouts/             # Page layouts
│   ├── pages/               # Route pages
│   ├── server/              # API routes
│   ├── stores/              # Pinia stores
│   ├── types/               # TypeScript types
│   └── Dockerfile
│
├── nginx/                   # Nginx configuration
├── scripts/                 # Deployment scripts
├── docs/                    # Documentation
└── docker-compose.yml       # Full stack setup
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 20.x
- PostgreSQL 15+
- npm or yarn

### Backend (Strapi)

```bash
cd strapi-backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run develop
```

Strapi admin: http://localhost:1337/admin

### Frontend (Nuxt)

```bash
cd nuxt-frontend
cp .env.example .env
# Edit .env with your Strapi URL and API token
npm install
npm run dev
```

Frontend: http://localhost:3000

## 🚀 Production Deployment

### Using Docker Compose

```bash
# Copy and configure environment variables
cp .env.production.example .env

# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Manual Deployment with PM2

```bash
# Setup server (Ubuntu 22.04)
./scripts/server-setup.sh

# Deploy updates
./scripts/deploy.sh
```

### SSL Certificates

```bash
sudo certbot --nginx -d carafe.coffee -d www.carafe.coffee -d cms.carafe.coffee
```

## 🔧 Configuration

### Environment Variables

See `.env.production.example` for all required variables:

- Database credentials
- Strapi secrets
- Worldpay API keys
- Site URLs

### Strapi Content Types

| Type             | Description                                             |
| ---------------- | ------------------------------------------------------- |
| Homepage         | Homepage sections (hero, categories, brand story, etc.) |
| Product          | Coffee products with variants, images, SEO              |
| Product Category | Product categories                                      |
| Subscription     | Subscription plans                                      |
| Page             | Dynamic content pages                                   |
| Global Settings  | Site-wide settings (nav, footer, etc.)                  |
| Order            | Order management                                        |

## 📦 Key Features

### E-commerce

- Product catalog with categories
- Cart with localStorage persistence
- Checkout with Worldpay integration
- Order management

### SEO

- Server-side rendering
- Meta tags & Open Graph
- JSON-LD structured data
- Dynamic sitemap
- robots.txt

### Performance

- ISR for product pages
- Image optimization
- Lazy loading
- Caching headers

## 🧪 Testing

```bash
# Frontend
cd nuxt-frontend
npm run test
npm run test:e2e

# Backend
cd strapi-backend
npm run test
```

## 📊 Monitoring

- **PM2**: `pm2 status`, `pm2 logs`
- **Nginx logs**: `/var/log/nginx/`
- **Health check**: `/api/health`

## 🔐 Security

- HTTPS enforced
- CORS configured
- Rate limiting
- Input validation
- MAC signature for webhooks

## 📝 License

Proprietary - Carafe Coffee House & Roasters

## 📞 Support

For technical support, contact: dev@carafe.coffee
