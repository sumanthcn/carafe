# =============================================================================
# NUXT FRONTEND - DOCKERFILE
# =============================================================================

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built output
COPY --from=build /app/.output ./.output
COPY --from=build /app/package*.json ./

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nuxtjs \
    && adduser --system --uid 1001 nuxtjs

USER nuxtjs

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
