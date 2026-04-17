FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY frontend/package.json frontend/
RUN pnpm install --filter frontend

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend/ frontend/
COPY package.json ./
ARG VITE_MAGENIM_BACKEND_URL=http://localhost:3000
ENV VITE_MAGENIM_BACKEND_URL=${VITE_MAGENIM_BACKEND_URL}
RUN cd frontend && npx vite build

FROM nginx:alpine AS production
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
