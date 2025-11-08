#!/bin/bash

# Love App Backend Deployment Script

set -e

echo "🚀 Starting Love App Backend Deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t loveapp-backend:latest .

# Tag for registry (if using)
if [ ! -z "$DOCKER_REGISTRY" ]; then
    docker tag loveapp-backend:latest $DOCKER_REGISTRY/loveapp-backend:latest
    echo "📤 Pushing to registry..."
    docker push $DOCKER_REGISTRY/loveapp-backend:latest
fi

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec -T db psql -U postgres -d loveapp -f /docker-entrypoint-initdb.d/run-migrations.sh

# Deploy with Docker Compose
echo "🔄 Deploying services..."
docker-compose down
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Running health checks..."
if curl -f http://localhost:3000/health; then
    echo "✅ Deployment successful!"
    echo "📊 API Documentation: http://localhost:3000/api"
    echo "🏥 Health Check: http://localhost:3000/health"
else
    echo "❌ Deployment failed - health check failed"
    docker-compose logs app
    exit 1
fi

echo "🎉 Love App Backend deployed successfully!"