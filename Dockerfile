# ========================================================
# Nexora AI – Intelligent DevOps Workspace
# Production Multi-Stage Dockerfile
# ========================================================

# Stage 1: Build the React / Vite SPA production assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies deterministically
# Uses npm ci if package-lock.json exists, otherwise falls back to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy application source code
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# Stage 2: Serve static production assets with Nginx Alpine
FROM nginx:alpine

# Remove default static nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA bundle from Stage 1 builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration supporting React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80 internally within the container
EXPOSE 80

# Health check to verify the web server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Launch Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
