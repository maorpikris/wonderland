# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build the app
ARG VITE_MAGENIM_BACKEND_URL
ENV VITE_MAGENIM_BACKEND_URL=$VITE_MAGENIM_BACKEND_URL
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built assets to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
