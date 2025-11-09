#!/bin/bash

# Love App MVP Backend Setup Script
echo "🚀 Setting up Love App MVP Backend..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
    echo "🔧 Setting up environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing"
    echo "   Required: DATABASE_*, JWT_SECRET, STRIPE_*, PAYPAL_*, MAIL_*, TWILIO_*"
    read -p "Press enter when .env is configured..."
fi

# Start database services
echo "🗄️  Starting database services..."
docker-compose up postgres redis -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed sample data
echo "🌱 Seeding sample data..."
npm run db:seed

# Build application
echo "🏗️  Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test

echo ""
echo "🎉 Love App MVP Backend setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Start development server: npm run dev"
echo "   2. Access API: http://localhost:3000"
echo "   3. View API docs: http://localhost:3000/api/docs"
echo "   4. Test with Postman: Import postman/Love-App-MVP.postman_collection.json"
echo ""
echo "🔐 Test credentials:"
echo "   Admin: admin@loveapp.com / password123"
echo "   Provider: provider@foodbank.org / password123"
echo "   Seeker: seeker@example.com / password123"
echo ""
echo "🐳 Docker commands:"
echo "   Full stack: docker-compose up -d"
echo "   View logs: docker-compose logs -f api"
echo "   Stop all: docker-compose down"
echo ""
echo "✨ Happy coding!"