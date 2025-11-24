#!/bin/bash
# Script to deploy processing fixes to EC2
# This syncs the code changes and runs the fix script

set -e

KEY_FILE="$HOME/Downloads/MS04_ID.pem"
EC2_HOST="ec2-18-223-169-5.us-east-2.compute.amazonaws.com"
EC2_USER="ubuntu"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "Deploying Processing Fixes to EC2"
echo "=========================================="
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "Error: Key file not found at $KEY_FILE"
    exit 1
fi

chmod 400 "$KEY_FILE"

# Step 1: Sync the fixed files
echo "Step 1: Syncing fixed code files..."
rsync -avz --progress -e "ssh -i $KEY_FILE" \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'models' \
    "$PROJECT_DIR/python_processing/db_utils.py" \
    "$PROJECT_DIR/python_processing/background_worker.py" \
    "$EC2_USER@$EC2_HOST:~/Capstone_Interface/python_processing/"

# Step 2: Sync the fix script
echo ""
echo "Step 2: Syncing fix script..."
rsync -avz --progress -e "ssh -i $KEY_FILE" \
    "$PROJECT_DIR/deploy/fix-ec2-processing.sh" \
    "$EC2_USER@$EC2_HOST:~/Capstone_Interface/deploy/"

# Step 3: Run the fix script on EC2
echo ""
echo "Step 3: Running fix script on EC2..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd ~/Capstone_Interface
chmod +x deploy/fix-ec2-processing.sh
./deploy/fix-ec2-processing.sh
ENDSSH

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
echo ""
echo "The following fixes have been applied:"
echo "  ✓ Numpy type adapters in db_utils.py"
echo "  ✓ Type conversion function"
echo "  ✓ Upload directory path fix"
echo "  ✓ .env file check/creation"
echo "  ✓ Database file path fixes"
echo "  ✓ PM2 services restarted"
echo ""
echo "Check EC2 logs: ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'pm2 logs'"

