FROM --platform=linux/amd64 node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PATH $PATH:/app/node_modules/.bin

# Build the application
RUN npm run build

# Production image, copy all the files and run nginx
FROM --platform=linux/amd64 nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy built assets from builder
COPY --from=builder /app/out .

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 