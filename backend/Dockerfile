# Using Node 22 as the base
FROM node:20

# Set the working directory
WORKDIR /app

# 1. Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# 2. Copy the rest of your application source
COPY . .

# 3. Build the application
# This generates the /dist folder
RUN npm run build

# 4. Remove development dependencies to keep it lighter
# (This keeps only the production 'node_modules')
RUN npm prune --production

# 5. Ensure persistence directories exist
RUN mkdir -p recordings self-location-data

# 6. Set environment variables (Optional, can be overridden by Compose)
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]