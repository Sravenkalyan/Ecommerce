# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install additional runtime dependencies
RUN npm install drizzle-kit pg tsx

# Copy source code
COPY . .

# Build frontend only (skip full build for faster Docker builds)
RUN npx vite build

# Create a simple production server bundle
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server.js

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server.js"]