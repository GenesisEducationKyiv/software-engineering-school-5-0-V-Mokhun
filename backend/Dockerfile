FROM node:22-bookworm AS base
WORKDIR /app

FROM base AS installer
COPY package.json package-lock.json ./
RUN npm install

FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY . .
RUN npm install
RUN npm run db:generate
RUN npm run build

FROM base AS migrator
COPY --from=installer /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json .
RUN npm install
RUN npm run db:generate

FROM base AS runner
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=migrator /app/prisma ./prisma
COPY package.json .

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

RUN chown -R expressjs:expressjs /app

USER expressjs

COPY --chown=expressjs:expressjs docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
