#!/bin/sh
set -e

# Determine database host based on environment
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}

# Function to check if database is ready
wait_for_db() {
    echo "Waiting for database to be ready at ${DB_HOST}:${DB_PORT}..."
    while ! nc -z ${DB_HOST} ${DB_PORT}; do
        sleep 1
    done
    echo "Database is ready!"
}

wait_for_redis() {
    echo "Waiting for Redis to be ready at ${REDIS_HOST}:${REDIS_PORT}..."
    while ! nc -z ${REDIS_HOST} ${REDIS_PORT}; do
        sleep 1
    done
    echo "Redis is ready!"
}

# Wait for database
wait_for_db
wait_for_redis

echo "Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting application..."
exec "$@" 
