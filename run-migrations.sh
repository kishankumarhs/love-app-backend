#!/bin/bash

# Database Migration Script
# Run this script to apply all migrations to your PostgreSQL database

set -e

# Database connection parameters
DB_NAME=${DATABASE_NAME:-love_app_dev}
DB_USER=${DATABASE_USERNAME:-postgres}
DB_CONTAINER=${DB_CONTAINER:-backend-db-1}

echo "Running database migrations..."
echo "Database: $DB_NAME in container: $DB_CONTAINER"

# Function to run a migration file
run_migration() {
    local file=$1
    echo "Running migration: $file"
    docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$file"
    if [ $? -eq 0 ]; then
        echo "✓ Migration $file completed successfully"
    else
        echo "✗ Migration $file failed"
        exit 1
    fi
}

# Run migrations in order
# run_migration "src/migrations/001-create-providers.sql"
# run_migration "src/migrations/002-create-campaigns.sql"
# run_migration "src/migrations/003-create-sos-tables.sql"
# run_migration "src/migrations/004-create-requests-referrals.sql"
# run_migration "src/migrations/005-create-notification-tables.sql"
# run_migration "src/migrations/006-create-user-profile-feedback.sql"
# run_migration "src/migrations/007-create-donations-payments.sql"
# run_migration "src/migrations/008-create-volunteer-voucher-system.sql"
# run_migration "src/migrations/009-create-reviews-moderation-audit.sql"
# run_migration "src/migrations/010-create-notification-templates-realtime.sql"
# run_migration "src/migrations/011-create-admin-analytics-management.sql"
run_migration "src/migrations/013-create-countries-table.sql"

echo "All migrations completed successfully!"
echo "Database schema is now up to date."