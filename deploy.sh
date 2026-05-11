#!/bin/bash
# run this ON YOUR SERVER to deploy

set -e  # exit on any error

echo "Loading secrets..."
set -a && source /etc/beggy/secrets.env && set +a

echo "Pulling latest code..."
git pull origin main

echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml up --build -d

echo "Running migrations..."
docker compose -f docker-compose.prod.yml exec api node -e "
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
"

echo "Done. App is live."