#!/bin/bash
# Script to deploy processing fixes to EC2
# This syncs the code changes and runs the fix script

set -e

KEY_FILE="$HOME/Downloads/MS04_ID.pem"
EC2_HOST="ec2-18-223-169-5.us-east-2.compute.amazonaws.com"
EC2_USER="ubuntu"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo "=========================================="
echo "Deploying Processing Fixes to EC2"
echo "=========================================="
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    print_error "Key file not found at $KEY_FILE"
    exit 1
fi

chmod 400 "$KEY_FILE"

# Test SSH connection first
print_status "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    print_status "SSH connection successful"
else
    print_error "SSH connection failed!"
    echo ""
    echo "The EC2 instance is not reachable via SSH. Possible reasons:"
    echo "  1. Instance is stopped or not running"
    echo "  2. Security group doesn't allow SSH (port 22)"
    echo "  3. Public IP address changed"
    echo "  4. Network connectivity issues"
    echo ""
    echo "Alternative deployment methods:"
    echo ""
    echo "Option 1: Use EC2 Instance Connect (Browser-based)"
    echo "  1. Go to AWS Console → EC2 → Instances"
    echo "  2. Select your instance (i-0ce6adb51ca9c5a4d)"
    echo "  3. Click 'Connect' → 'EC2 Instance Connect'"
    echo "  4. Run these commands:"
    echo "     cd ~/Capstone_Interface"
    echo "     git pull origin main"
    echo "     ./deploy/fix-ec2-processing.sh"
    echo ""
    echo "Option 2: Use AWS Systems Manager Session Manager"
    echo "  (See: deploy/setup-session-manager.md)"
    echo ""
    echo "Option 3: Fix SSH connection first"
    echo "  - Check instance status in AWS Console"
    echo "  - Verify security group allows port 22"
    echo "  - Check if public IP changed"
    echo ""
    exit 1
fi

# Step 1: Sync the fixed files
echo ""
print_status "Step 1: Syncing fixed code files..."
if rsync -avz --progress -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude 'models' \
    "$PROJECT_DIR/python_processing/db_utils.py" \
    "$PROJECT_DIR/python_processing/background_worker.py" \
    "$EC2_USER@$EC2_HOST:~/Capstone_Interface/python_processing/" 2>&1; then
    print_status "Code files synced successfully"
else
    print_error "Failed to sync code files"
    exit 1
fi

# Step 2: Sync the fix script
echo ""
print_status "Step 2: Syncing fix script..."
if rsync -avz --progress -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
    "$PROJECT_DIR/deploy/fix-ec2-processing.sh" \
    "$EC2_USER@$EC2_HOST:~/Capstone_Interface/deploy/" 2>&1; then
    print_status "Fix script synced successfully"
else
    print_error "Failed to sync fix script"
    exit 1
fi

# Step 3: Run the fix script on EC2
echo ""
print_status "Step 3: Running fix script on EC2..."
if ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << 'ENDSSH'
cd ~/Capstone_Interface
chmod +x deploy/fix-ec2-processing.sh
./deploy/fix-ec2-processing.sh
ENDSSH
then
    print_status "Fix script executed successfully"
else
    print_error "Failed to execute fix script on EC2"
    exit 1
fi

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

