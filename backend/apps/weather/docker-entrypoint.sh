#!/bin/sh
set -e

# Determine database host based on environment
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}

# Function to check if database is ready
wait_for_db() {
    echo "Waiting for database to be ready at ${DB_HOST}:${DB_PORT}..."
    while ! nc -z ${DB_HOST} ${DB_PORT}; do
        sleep 1
    done
    echo "Database is ready!"
}

# Wait for database
wait_for_db

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec "$@" 
