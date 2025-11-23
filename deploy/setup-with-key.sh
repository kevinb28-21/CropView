#!/bin/bash
# EC2 Setup with Key File Path as Argument
# Usage: ./deploy/setup-with-key.sh /path/to/id_rsa

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/id_rsa"
    echo ""
    echo "Example:"
    echo "  $0 ~/Downloads/id_rsa"
    echo "  $0 ~/.ssh/id_rsa"
    exit 1
fi

KEY_FILE="$1"
EC2_HOST="ec2-18-223-169-5.us-east-2.compute.amazonaws.com"
EC2_USER="ubuntu"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Expand ~ to home directory
KEY_FILE="${KEY_FILE/#\~/$HOME}"

# Check if file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "Error: Key file not found at: $KEY_FILE"
    exit 1
fi

echo "=========================================="
echo "EC2 Deployment Setup"
echo "=========================================="
echo ""
echo "Using key file: $KEY_FILE"
echo ""

chmod 400 "$KEY_FILE"
echo "✓ Key file permissions set"
echo ""

# Test connection
echo "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connected'" 2>&1 | grep -q "Connected"; then
    echo "✓ Connection successful"
else
    echo "⚠ First connection - accepting host key..."
    ssh -i "$KEY_FILE" -o StrictHostKeyChecking=accept-new "$EC2_USER@$EC2_HOST" "echo 'Connection established'" 2>&1 || {
        echo "Error: Could not connect to EC2 instance"
        echo "Please verify:"
        echo "  1. EC2 instance is running"
        echo "  2. Security group allows SSH from your IP"
        echo "  3. Key file is correct"
        exit 1
    }
fi
echo ""

# Transfer files
echo "Transferring deployment files to EC2..."
cd "$PROJECT_DIR"
scp -i "$KEY_FILE" -r deploy/ "$EC2_USER@$EC2_HOST:~/deploy/"
echo "✓ Deploy files transferred"

echo "Transferring PM2 configuration files..."
cd "$PROJECT_DIR"
scp -i "$KEY_FILE" server/ecosystem.config.js "$EC2_USER@$EC2_HOST:~/server-ecosystem.config.js" 2>/dev/null || echo "Note: Will be created during setup"
scp -i "$KEY_FILE" python_processing/ecosystem.config.js "$EC2_USER@$EC2_HOST:~/python-ecosystem.config.js" 2>/dev/null || echo "Note: Will be created during setup"
scp -i "$KEY_FILE" python_processing/worker.config.js "$EC2_USER@$EC2_HOST:~/python-worker.config.js" 2>/dev/null || echo "Note: Will be created during setup"
echo "✓ Configuration files transferred"
echo ""

# Run setup on EC2
echo "=========================================="
echo "Running setup script on EC2..."
echo "This will take 10-15 minutes"
echo "=========================================="
echo ""

ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    chmod +x ~/deploy/ec2-setup.sh
    ~/deploy/ec2-setup.sh
ENDSSH

echo ""
echo "=========================================="
echo "Setup script completed!"
echo "=========================================="
echo ""
echo "IMPORTANT: You need to manually complete these steps:"
echo ""
echo "1. SSH into EC2:"
echo "   ssh -i $KEY_FILE $EC2_USER@$EC2_HOST"
echo ""
echo "2. Edit environment files with your credentials:"
echo "   nano ~/Capstone_Interface/server/.env"
echo "   nano ~/Capstone_Interface/python_processing/.env"
echo ""
echo "3. Copy PM2 configs:"
echo "   cp ~/server-ecosystem.config.js ~/Capstone_Interface/server/ecosystem.config.js"
echo "   cp ~/python-ecosystem.config.js ~/Capstone_Interface/python_processing/ecosystem.config.js"
echo "   cp ~/python-worker.config.js ~/Capstone_Interface/python_processing/worker.config.js"
echo ""
echo "4. Restart services:"
echo "   pm2 restart all"
echo "   pm2 status"
echo ""

