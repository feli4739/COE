# Build desde la raíz del monorepo: docker build -f server/Dockerfile .
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY server ./server
RUN npm ci --workspace=server
WORKDIR /app/server
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN npm ci --workspace=server --omit=dev
COPY --from=builder /app/server/dist ./server/dist
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:4000/health || exit 1
CMD ["node", "dist/index.js"]
