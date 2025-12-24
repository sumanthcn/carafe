# Carafe Coffee - Strapi Backend

## Prerequisites

- Node.js 18.x or 20.x (LTS recommended)
- PostgreSQL 14+ (for production)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd strapi-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Generate secure keys for production
# Use: openssl rand -base64 32

APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# PostgreSQL
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=carafe_strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE carafe_strapi;
CREATE USER strapi WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE carafe_strapi TO strapi;
\q
```

### 4. Run Development Server

```bash
npm run develop
```

Access the admin panel at: http://localhost:1337/admin

### 5. Create Admin User

On first run, create your admin account at the admin panel.

## API Endpoints

| Endpoint                       | Description            |
| ------------------------------ | ---------------------- |
| `GET /api/homepage`            | Homepage content       |
| `GET /api/products`            | Product listing        |
| `GET /api/products/slug/:slug` | Product by slug        |
| `GET /api/product-categories`  | Categories             |
| `GET /api/subscriptions`       | Subscription plans     |
| `GET /api/pages/slug/:slug`    | Page by slug           |
| `GET /api/global-setting`      | Global settings        |
| `GET /api/orders`              | Orders (authenticated) |

## Production Build

```bash
npm run build
npm run start
```

## API Tokens

For frontend access, create an API token in the admin:

1. Go to Settings → API Tokens
2. Create new token with name "Frontend"
3. Set type to "Read-only" for public endpoints
4. Copy token to frontend `.env`

## Media Uploads

For production, configure S3 or similar:

```bash
npm install @strapi/provider-upload-aws-s3
```

Update `config/plugins.ts` with S3 configuration.
