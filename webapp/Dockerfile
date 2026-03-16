# Dockerfile for Next.js app
# Version 2 - Force a clean build

# 1. Install dependencies
FROM node:20-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# 2. Build the app
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 3. Run the app
FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
