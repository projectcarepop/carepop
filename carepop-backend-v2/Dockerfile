# ========= Stage 1: Build Stage =========
# Use a specific Node.js version for reproducibility and security
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# If you have a TypeScript build step (which you don't for tsx, but is good practice)
# you would run it here. e.g., RUN npm run build

# ========= Stage 2: Production Stage =========
# Use a lightweight, secure base image for the final container
FROM node:20-alpine

WORKDIR /app

# Copy the installed node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code from the builder stage
COPY --from=builder /app .

# Expose the port the Hono app will listen on
EXPOSE 8000

# The command to start the production Hono server
# This will use the 'start' script from our package.json
CMD ["npm", "run", "start"] 