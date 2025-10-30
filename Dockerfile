FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Build the application
RUN npm install -g typescript && \
    npm run build && \
    npm uninstall -g typescript

# Remove source files and keep only compiled code
RUN rm -rf src tsconfig.json

# Set environment
ENV NODE_ENV=production

# Run the server
CMD ["node", "dist/index.js"]
