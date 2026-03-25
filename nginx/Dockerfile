# Build desde la raíz del monorepo: docker build -f nginx/Dockerfile .
FROM node:20-alpine AS client-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client ./client
RUN npm ci --workspace=client && npm run build -w client

FROM nginx:alpine
COPY --from=client-build /app/client/dist /usr/share/nginx/html
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
