# Use official Node.js LTS slim image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (for caching dependencies)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --silent

# Copy all frontend source code
COPY . .

ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build

# Build the React app
RUN npm run build

# Install serve to serve the build folder
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]


