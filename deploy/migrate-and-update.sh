#!/bin/bash
# Combined script: Run migration and update backend on EC2
# Usage: ./migrate-and-update.sh [key-file] [ec2-user@ec2-host]

set -e

KEY_FILE="${1:-$HOME/Downloads/MS04_ID.pem}"
EC2_HOST="${2:-ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com}"

if [ ! -f "$KEY_FILE" ]; then
    echo "Error: Key file not found: $KEY_FILE"
    echo "Usage: $0 [key-file] [ec2-user@ec2-host]"
    exit 1
fi

chmod 400 "$KEY_FILE"

echo "=========================================="
echo "Step 1: Running Database Migration"
echo "=========================================="

# Transfer migration files
echo "Transferring migration files..."
scp -i "$KEY_FILE" deploy/run-migration.sh "$EC2_HOST:~/run-migration.sh"
scp -i "$KEY_FILE" python_processing/database_migration_add_gndvi.sql "$EC2_HOST:~/Capstone_Interface/python_processing/database_migration_add_gndvi.sql"

# Run migration
echo "Running migration on EC2..."
ssh -i "$KEY_FILE" "$EC2_HOST" "chmod +x ~/run-migration.sh && ~/run-migration.sh"

echo ""
echo "=========================================="
echo "Step 2: Updating Backend Code"
echo "=========================================="

# Sync backend files
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Syncing server files..."
rsync -avz --progress -e "ssh -i $KEY_FILE" \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    "$PROJECT_DIR/server/" "$EC2_HOST:~/Capstone_Interface/server/"

echo "Syncing Python processing files..."
rsync -avz --progress -e "ssh -i $KEY_FILE" \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'models' \
    "$PROJECT_DIR/python_processing/" "$EC2_HOST:~/Capstone_Interface/python_processing/"

echo ""
echo "Installing dependencies and restarting services..."
ssh -i "$KEY_FILE" "$EC2_HOST" << 'ENDSSH'
cd ~/Capstone_Interface

# Update Node.js dependencies
echo "Updating Node.js dependencies..."
cd server
npm install --production
cd ..

# Update Python dependencies (if venv exists)
if [ -d "python_processing/venv" ]; then
    echo "Updating Python dependencies..."
    cd python_processing
    source venv/bin/activate
    pip install -r requirements.txt --quiet 2>/dev/null || true
    deactivate
    cd ..
fi

# Restart PM2 services
if command -v pm2 &> /dev/null; then
    echo "Restarting PM2 services..."
    pm2 restart all
    echo ""
    echo "PM2 Status:"
    pm2 status
else
    echo "PM2 not found. Please restart services manually."
fi
ENDSSH

echo ""
echo "=========================================="
echo "✓ Migration and Backend Update Complete!"
echo "=========================================="

