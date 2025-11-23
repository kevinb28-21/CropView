#!/bin/bash
# Interactive EC2 Setup Script
# This will guide you through the setup process

set -e

EC2_HOST="ec2-18-224-7-31.us-east-2.compute.amazonaws.com"
EC2_USER="ec2-user"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "EC2 Deployment Setup"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Transfer deployment files to EC2"
echo "2. Run the setup script on EC2"
echo "3. Configure all services"
echo ""

# Get key file location
echo "Please provide the path to your SSH key file (id_rsa):"
echo "Common locations:"
echo "  - ~/Downloads/id_rsa"
echo "  - ~/.ssh/id_rsa"
echo "  - ./id_rsa (current directory)"
echo ""
read -p "Key file path: " KEY_FILE

# Expand ~ to home directory
KEY_FILE="${KEY_FILE/#\~/$HOME}"

# Check if file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "Error: Key file not found at: $KEY_FILE"
    exit 1
fi

echo "✓ Found key file: $KEY_FILE"
chmod 400 "$KEY_FILE"
echo ""

# Test connection
echo "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connected successfully'" 2>&1; then
    echo "✓ Connection successful"
else
    echo "⚠ Connection test had issues, but continuing..."
    echo "You may need to accept the host key"
fi
echo ""

# Transfer files
echo "Transferring files to EC2..."
scp -i "$KEY_FILE" -r "$PROJECT_DIR/deploy/" "$EC2_USER@$EC2_HOST:~/deploy/"
echo "✓ Files transferred"
echo ""

# Transfer PM2 configs
echo "Transferring PM2 configuration files..."
scp -i "$KEY_FILE" "$PROJECT_DIR/server/ecosystem.config.js" "$EC2_USER@$EC2_HOST:~/server-ecosystem.config.js" 2>/dev/null || true
scp -i "$KEY_FILE" "$PROJECT_DIR/python_processing/ecosystem.config.js" "$EC2_USER@$EC2_HOST:~/python-ecosystem.config.js" 2>/dev/null || true
scp -i "$KEY_FILE" "$PROJECT_DIR/python_processing/worker.config.js" "$EC2_USER@$EC2_HOST:~/python-worker.config.js" 2>/dev/null || true
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
echo "IMPORTANT: You need to manually:"
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

