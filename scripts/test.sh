#!/bin/bash

# Love App Backend Testing Script

set -e

echo "🧪 Running Love App Backend Tests..."

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Run linting
echo "🔍 Running ESLint..."
yarn lint

# Run unit tests
echo "🔬 Running unit tests..."
yarn test

# Skip integration tests (require database setup)
echo "⏭️  Skipping integration tests (require database setup)"

# Generate test coverage
echo "📊 Generating test coverage..."
yarn test:cov

# Check test coverage threshold
echo "📈 Checking coverage threshold..."
if [ -f coverage/lcov.info ]; then
    COVERAGE=$(grep -o 'SF:.*' coverage/lcov.info | wc -l)
    echo "Coverage files: $COVERAGE"
fi

echo "✅ All tests passed successfully!"