# =============================================================================
# STRAPI BACKEND - DOCKERFILE
# =============================================================================

# Build stage
FROM node:20-alpine AS build

WORKDIR /opt/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /opt/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/config ./config
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/src ./src

# Create uploads directory
RUN mkdir -p /opt/app/public/uploads

# Set permissions
RUN chown -R node:node /opt/app

USER node

EXPOSE 1337

CMD ["npm", "start"]
