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

# Run all SQL migrations in src/migrations in lexicographic order.
# Files are executed with psql; migrations should be idempotent (use IF NOT EXISTS)
MIG_DIR="src/migrations"
shopt -s nullglob
sql_files=($MIG_DIR/*.sql)
if [ ${#sql_files[@]} -eq 0 ]; then
    echo "No SQL migration files found in $MIG_DIR"
else
    IFS=$'\n' sorted_files=($(printf "%s\n" "${sql_files[@]}" | sort))
    for f in "${sorted_files[@]}"; do
        run_migration "$f"
    done
fi

echo "All migrations completed successfully!"
echo "Database schema is now up to date."