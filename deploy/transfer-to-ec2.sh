#!/bin/bash
# Script to transfer deployment files to EC2 instance

set -e

KEY_FILE="id_rsa"
EC2_HOST="ec2-18-224-7-31.us-east-2.compute.amazonaws.com"
EC2_USER="ec2-user"

echo "=========================================="
echo "Transferring files to EC2 instance"
echo "=========================================="
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "Error: Key file '$KEY_FILE' not found in current directory"
    echo "Please ensure your id_rsa file is in the project root or specify the path"
    exit 1
fi

# Make key file readable only by owner
chmod 400 "$KEY_FILE"

echo "Transferring deployment files..."
scp -i "$KEY_FILE" -r deploy/ "$EC2_USER@$EC2_HOST:~/"

echo ""
echo "Transferring PM2 configuration files..."
scp -i "$KEY_FILE" server/ecosystem.config.js "$EC2_USER@$EC2_HOST:~/Capstone_Interface/server/" 2>/dev/null || echo "Note: Server directory may not exist yet on EC2"
scp -i "$KEY_FILE" python_processing/ecosystem.config.js "$EC2_USER@$EC2_HOST:~/Capstone_Interface/python_processing/" 2>/dev/null || echo "Note: Python directory may not exist yet on EC2"
scp -i "$KEY_FILE" python_processing/worker.config.js "$EC2_USER@$EC2_HOST:~/Capstone_Interface/python_processing/" 2>/dev/null || echo "Note: Python directory may not exist yet on EC2"

echo ""
echo "=========================================="
echo "Files transferred successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. SSH into your EC2 instance:"
echo "   ssh -i $KEY_FILE $EC2_USER@$EC2_HOST"
echo ""
echo "2. Run the setup script:"
echo "   chmod +x ~/deploy/ec2-setup.sh"
echo "   ~/deploy/ec2-setup.sh"
echo ""

