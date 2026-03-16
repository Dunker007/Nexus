# Dockerfile for Next.js app
# Version 3 - Fix Prisma schema location

# 1. Install dependencies
FROM node:20-slim AS deps

WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies
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
