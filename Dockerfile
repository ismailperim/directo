# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy default configuration
COPY --from=builder /app/services.yml ./services.yml

# Copy public files
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S directo && \
    adduser -S directo -u 1001 && \
    chown -R directo:directo /app

USER directo

EXPOSE 3000

CMD ["node", "dist/index.js"]
