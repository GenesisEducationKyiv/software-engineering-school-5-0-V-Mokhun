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

# Copy all source code for all apps and packages.
# This is necessary for the root `tsc --build` to succeed.
COPY apps ./apps/
COPY packages ./packages/

# Generate Prisma client which is a build-time dependency.
RUN npm run db:generate --workspace=apps/weather

# Build all dependencies and the app itself from the root.
RUN npm run build

# Copy the generated Prisma client to the dist folder.
RUN cp -R apps/weather/src/generated dist/apps/weather/generated

# --- Development Stage ---
# For development, we want all dependencies and live-reloading.
FROM deps AS development

RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

# Copy root configurations. The apps/packages will be mounted via docker-compose.
COPY --from=builder /app/apps/weather/prisma ./prisma
COPY package.json .
COPY tsconfig.json tsconfig.base.json ./

# Create a non-root user for security.
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

RUN chown -R expressjs:expressjs /app

USER expressjs

# We still need the entrypoint script.
COPY --chown=expressjs:expressjs apps/weather/docker-entrypoint.sh ./apps/weather/docker-entrypoint.sh
RUN chmod +x ./apps/weather/docker-entrypoint.sh

ENTRYPOINT ["/app/apps/weather/docker-entrypoint.sh"]
# The default command will be overridden by docker-compose, but we set it for clarity.
CMD ["npm", "run", "dev", "--workspace=apps/weather"]


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

# Copy the specific build artifacts for the 'weather' app and its dependencies.
COPY --from=builder /app/dist/apps/weather ./dist/apps/weather
COPY --from=builder /app/dist/packages/common ./dist/packages/common
COPY --from=builder /app/dist/packages/logger ./dist/packages/logger

# Copy the lean, production-only node_modules.
COPY --from=production-deps /app/node_modules ./node_modules

# Copy Prisma schema and package.json, which are needed at runtime.
COPY --from=builder /app/apps/weather/prisma ./prisma
COPY package.json .
# Also copy the app's package.json, it might be useful for context.
COPY apps/weather/package.json ./

# Create a non-root user for security.
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
RUN chown -R expressjs:expressjs /app
USER expressjs

# Copy and set up the entrypoint script, which is specific to this app.
COPY --chown=expressjs:expressjs apps/weather/docker-entrypoint.sh ./apps/weather/docker-entrypoint.sh
RUN chmod +x ./apps/weather/docker-entrypoint.sh

ENTRYPOINT ["/app/apps/weather/docker-entrypoint.sh"]

# The final command to run the 'weather' service.
CMD ["node", "dist/apps/weather/index.js"]
