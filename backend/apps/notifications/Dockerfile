# apps/weather/Dockerfile

# --- 1. Base Stage ---
# Defines the base image and working directory.
FROM node:22-bookworm AS base
WORKDIR /app

# --- 2. Dependencies Stage ---
# Installs ALL dependencies for the entire monorepo.
# This layer is cached and only re-runs if the root package.json or lockfile changes.
FROM base AS deps
COPY package.json package-lock.json ./
# We need all package.json files for npm to correctly install workspace dependencies.
# A simple glob copy is the most maintainable approach.
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/
RUN npm install

# --- 3. Builder Stage ---
# Builds the specific application and its dependencies.
FROM base AS builder
# Copy all dependencies from the previous stage.
COPY --from=deps /app/node_modules ./node_modules
# Copy all necessary configuration files.
COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.base.json ./
COPY prisma ./prisma/

# Copy the source code for the app and ONLY the packages it depends on.
# This improves caching significantly.
COPY apps/notifications ./apps/notifications/
COPY packages/common ./packages/common/
COPY packages/logger ./packages/logger/

# Generate Prisma client which is a build-time dependency.
RUN npm run db:generate

# Build the specific app and its dependencies. `tsc --build` handles the dependency order.
RUN npm run build --workspace=apps/notifications

# --- 4. Production Dependencies Stage ---
# Creates a clean installation of only production dependencies.
FROM base AS production-deps
COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/
RUN npm install --omit=dev

# --- 5. Final Runner Stage ---
# Creates the final, lean image for running the application.
FROM base AS runner
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

# Copy the specific build artifacts for the 'weather' app.
COPY --from=builder /app/apps/notifications/dist ./dist
# Copy the lean, production-only node_modules.
COPY --from=production-deps /app/node_modules ./node_modules
# Copy Prisma schema and package.json, which are needed at runtime.
COPY --from=builder /app/prisma ./prisma
COPY package.json .
# Also copy the app's package.json, it might be useful for context.
COPY apps/notifications/package.json ./

# Create a non-root user for security.
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
RUN chown -R expressjs:expressjs /app
USER expressjs

# Copy and set up the entrypoint script, which is specific to this app.
COPY --chown=expressjs:expressjs apps/notifications/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]

# The final command to run the 'notifications' service.
CMD ["node", "dist/index.js"]
