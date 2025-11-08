#!/bin/bash

# Database Migration Script
# Run this script to apply all migrations to your PostgreSQL database

set -e

# Database connection parameters
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_NAME=${DATABASE_NAME:-loveapp}
DB_USER=${DATABASE_USERNAME:-postgres}

echo "Running database migrations..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Function to run a migration file
run_migration() {
    local file=$1
    echo "Running migration: $file"
    PGPASSWORD=$DATABASE_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file"
    if [ $? -eq 0 ]; then
        echo "✓ Migration $file completed successfully"
    else
        echo "✗ Migration $file failed"
        exit 1
    fi
}

# Run migrations in order
run_migration "src/migrations/001-create-providers.sql"
run_migration "src/migrations/002-create-campaigns.sql"
run_migration "src/migrations/003-create-sos-tables.sql"
run_migration "src/migrations/004-create-requests-referrals.sql"
run_migration "src/migrations/005-create-notification-tables.sql"
run_migration "src/migrations/006-create-user-profile-feedback.sql"
run_migration "src/migrations/007-create-donations-payments.sql"
run_migration "src/migrations/008-create-volunteer-voucher-system.sql"
run_migration "src/migrations/009-create-reviews-moderation-audit.sql"
run_migration "src/migrations/010-create-notification-templates-realtime.sql"

echo "All migrations completed successfully!"
echo "Database schema is now up to date."