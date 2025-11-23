#!/bin/bash
# Complete EC2 Setup Script
# This script will help you set up your EC2 instance

set -e

KEY_FILE=""
EC2_HOST="ec2-18-224-7-31.us-east-2.compute.amazonaws.com"
EC2_USER="ec2-user"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================="
echo "EC2 Deployment Setup"
echo "=========================================="
echo ""

# Step 1: Locate key file
echo "Step 1: Locating SSH key file..."
if [ -f "$PROJECT_DIR/id_rsa" ]; then
    KEY_FILE="$PROJECT_DIR/id_rsa"
    echo "Found key file: $KEY_FILE"
elif [ -f "$HOME/id_rsa" ]; then
    KEY_FILE="$HOME/id_rsa"
    echo "Found key file: $KEY_FILE"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
    KEY_FILE="$HOME/.ssh/id_rsa"
    echo "Found key file: $KEY_FILE"
else
    echo "Key file not found in common locations."
    echo "Please enter the full path to your id_rsa key file:"
    read -r KEY_FILE
    if [ ! -f "$KEY_FILE" ]; then
        echo "Error: Key file not found at $KEY_FILE"
        exit 1
    fi
fi

# Make key file readable only
chmod 400 "$KEY_FILE"
echo "✓ Key file permissions set"
echo ""

# Step 2: Test SSH connection
echo "Step 2: Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo "✓ SSH connection successful"
else
    echo "⚠ SSH connection test failed, but continuing..."
    echo "You may need to accept the host key on first connection"
fi
echo ""

# Step 3: Transfer files
echo "Step 3: Transferring deployment files to EC2..."
echo "This may take a few moments..."

# Transfer deploy directory
scp -i "$KEY_FILE" -r "$PROJECT_DIR/deploy/" "$EC2_USER@$EC2_HOST:~/deploy/" 2>/dev/null || {
    echo "Error transferring deploy directory"
    exit 1
}
echo "✓ Deploy files transferred"

# Transfer PM2 configs (if directories exist on EC2, they'll be created)
echo "Transferring PM2 configuration files..."
scp -i "$KEY_FILE" "$PROJECT_DIR/server/ecosystem.config.js" "$EC2_USER@$EC2_HOST:~/server-ecosystem.config.js" 2>/dev/null || echo "Note: Will be created during setup"
scp -i "$KEY_FILE" "$PROJECT_DIR/python_processing/ecosystem.config.js" "$EC2_USER@$EC2_HOST:~/python-ecosystem.config.js" 2>/dev/null || echo "Note: Will be created during setup"
scp -i "$KEY_FILE" "$PROJECT_DIR/python_processing/worker.config.js" "$EC2_USER@$EC2_HOST:~/python-worker.config.js" 2>/dev/null || echo "Note: Will be created during setup"
echo "✓ Configuration files transferred"
echo ""

# Step 4: Run setup script on EC2
echo "Step 4: Running setup script on EC2..."
echo "This will install all dependencies and configure the system."
echo "This may take 10-15 minutes..."
echo ""

ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Make setup script executable
    chmod +x ~/deploy/ec2-setup.sh
    
    # Run setup script
    ~/deploy/ec2-setup.sh
ENDSSH

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. SSH into your EC2 instance:"
echo "   ssh -i $KEY_FILE $EC2_USER@$EC2_HOST"
echo ""
echo "2. Edit environment files:"
echo "   nano ~/Capstone_Interface/server/.env"
echo "   nano ~/Capstone_Interface/python_processing/.env"
echo ""
echo "3. Copy PM2 configs to correct locations:"
echo "   cp ~/server-ecosystem.config.js ~/Capstone_Interface/server/ecosystem.config.js"
echo "   cp ~/python-ecosystem.config.js ~/Capstone_Interface/python_processing/ecosystem.config.js"
echo "   cp ~/python-worker.config.js ~/Capstone_Interface/python_processing/worker.config.js"
echo ""
echo "4. Restart services:"
echo "   pm2 restart all"
echo "   pm2 status"
echo ""

