# Use an official Node.js runtime as a parent image
# Use a specific LTS version for reproducibility (e.g., Node 20 Alpine)
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies stage
FROM base AS deps
# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# Install app dependencies using npm ci for faster, reproducible installs
RUN npm ci

# Build stage
FROM base AS builder
# Copy dependencies from the deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .
# Build TypeScript code
RUN npm run build

# Production stage
FROM base AS production
# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy built code and dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Expose the port the app runs on (Cloud Run expects 8080 by default)
# The actual port is determined by the PORT env var injected by Cloud Run
EXPOSE 8080

# Define the command to run the application
# Use node to directly run the compiled JavaScript output
CMD ["node", "dist/server.js"] 