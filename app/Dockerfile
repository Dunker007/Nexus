# Stage 1: Build the Vite frontend
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package manifests separately to leverage Docker caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite/TypeScript)
RUN npm install --legacy-peer-deps

# Copy the rest of the app source code
COPY . .

# Build Vite frontend + compile server TypeScript
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine AS production

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

# Only install production dependencies (single pass — prisma generate runs via postinstall)
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled server output and Vite frontend build
COPY --from=builder /usr/src/app/dist-server ./dist-server
COPY --from=builder /usr/src/app/dist ./dist

# Vite relies on "type": "module" in package.json
COPY package.json ./

# Do NOT copy .env — Cloud Run injects secrets via environment variables
# Start the server (Cloud Run defaults to port 8080)
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
ENV DB_PROVIDER=postgresql

# SQLite requires a directory for storing data. For Cloud Run, /usr/src/app is ephemeral.
# If persistent data is required, a volume must be mapped or Cloud SQL enabled.
CMD ["node", "dist-server/server.js"]
