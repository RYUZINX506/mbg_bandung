#!/bin/bash
# Quick setup script

echo "=== Step 1: Test MySQL Connection ==="
mysql -u root -e "SELECT 1" 2>/dev/null && echo "✓ MySQL accessible" || echo "✗ MySQL not responding"

echo ""
echo "=== Step 2: Create Database ==="
mysql -u root -e "CREATE DATABASE IF NOT EXISTS backand;" && echo "✓ Database ready"

echo ""
echo "=== Step 3: Run Migrations ==="
php artisan migrate:fresh --seed --force 2>&1 | tail -20

echo ""
echo "=== Done ==="
echo "Server should now be able to access the database."
