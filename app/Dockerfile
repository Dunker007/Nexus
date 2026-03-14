# Stage 1: Build the Vite frontend
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package manifests separately to leverage Docker caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite/TypeScript)
RUN npm install --legacy-peer-deps

# Copy the rest of the app source code
COPY . .

# First, build Vite (produces the static assets in /dist)
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine AS production

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

# Only install production dependencies
COPY package*.json ./
COPY prisma/schema.postgres.prisma ./prisma/schema.prisma
RUN npm install prisma@5 @prisma/client@5 --omit=dev --legacy-peer-deps && npx prisma generate
RUN npm install --omit=dev --legacy-peer-deps

# We do not strictly need the src/ directory for the Vite frontend since it's built into dist/, 
# but we do need server.ts and its related dependencies.
COPY --from=builder /usr/src/app/server ./server
COPY --from=builder /usr/src/app/server.ts ./server.ts
COPY --from=builder /usr/src/app/dist ./dist

# Vite relies on "type": "module" in package.json
COPY package.json ./

# Copy optional .env to seed defaults (though Secret Manager should override in Cloud Run)
COPY .env.example .env

# Start the server (Cloud Run defaults to port 8080)
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# tsx server.ts or regular node execution. Since server.ts is TS, we keep tsx dependency or compile it.
# To keep this lightweight, we install tsx globally or locally in prod.
RUN npm install tsx -g

# SQLite requires a directory for storing data. For Cloud Run, /usr/src/app is ephemeral.
# If persistent data is required, a volume must be mapped or Cloud SQL enabled.
CMD ["tsx", "server.ts"]
