FROM --platform=linux/amd64 node:18-alpine

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

# Expose the port
EXPOSE 3000

# Start the application using the local next command
CMD ["./node_modules/.bin/next", "start"] 