#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

source .env.test

export DATABASE_URL="$DATABASE_URL_EXTERNAL"
export REDIS_HOST="$REDIS_HOST_EXTERNAL"
export REDIS_PORT="$REDIS_PORT_EXTERNAL"

# --- Docker Compose File ---
COMPOSE_FILE="docker-compose.test.yml"

# --- Functions ---
cleanup() {
  echo "--- Shutting down test containers ---"
  docker compose -f "$COMPOSE_FILE" down --volumes
}

# --- Main Script ---

# Register the cleanup function to be called on the EXIT signal
trap cleanup EXIT

echo "--- Starting test containers ---"
docker compose -f "$COMPOSE_FILE" up -d

echo "--- Waiting for database to be ready ---"

./scripts/wait-until.sh "docker compose -f ${COMPOSE_FILE} exec -T db-test psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c 'select 1' > /dev/null 2>&1"

echo "--- Running integration tests ---"
npm run test:integration

echo "--- Integration tests finished ---"
