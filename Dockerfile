# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build (but keep drizzle-kit for database setup)
RUN npm prune --production && npm install drizzle-kit

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]