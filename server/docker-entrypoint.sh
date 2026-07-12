#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit push \
  --force \
  --dialect=postgresql \
  --schema=./src/db/schema/index.js \
  --url="$DATABASE_URL"

echo "Starting server..."
node src/index.js
