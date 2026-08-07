# Stage 1: Build Astro SSR Node application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./

# Install dependencies clean
RUN npm ci

# Copy application code
COPY . .

# Set environment variables for build time
ARG PUBLIC_API_BASE_URL=http://localhost:8082/api/v1
ENV PUBLIC_API_BASE_URL=${PUBLIC_API_BASE_URL}

# Build Astro production bundle
RUN npm run build

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Copy production artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
