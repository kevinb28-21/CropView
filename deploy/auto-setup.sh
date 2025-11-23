#!/bin/bash
# Automated EC2 Setup - Tries to find key file automatically

set -e

EC2_HOST="ec2-18-224-7-31.us-east-2.compute.amazonaws.com"
EC2_USER="ec2-user"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Try to find key file
KEY_FILE=""
for loc in "$PROJECT_DIR/id_rsa" "$HOME/Downloads/id_rsa" "$HOME/.ssh/id_rsa" "$HOME/id_rsa" "./id_rsa"; do
    if [ -f "$loc" ]; then
        KEY_FILE="$loc"
        echo "Found key file: $KEY_FILE"
        break
    fi
done

if [ -z "$KEY_FILE" ]; then
    echo "Error: Could not find id_rsa key file"
    echo "Please place your id_rsa file in one of these locations:"
    echo "  - $PROJECT_DIR/id_rsa"
    echo "  - $HOME/Downloads/id_rsa"
    echo "  - $HOME/.ssh/id_rsa"
    echo "  - $HOME/id_rsa"
    exit 1
fi

chmod 400 "$KEY_FILE"
echo "✓ Key file permissions set"
echo ""

# Test connection
echo "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connected'" 2>&1 | grep -q "Connected"; then
    echo "✓ Connection successful"
else
    echo "⚠ First connection - you may need to accept host key"
    ssh -i "$KEY_FILE" -o StrictHostKeyChecking=accept-new "$EC2_USER@$EC2_HOST" "echo 'Connection established'" || true
fi
echo ""

# Transfer files
echo "Transferring deployment files..."
scp -i "$KEY_FILE" -r "$PROJECT_DIR/deploy/" "$EC2_USER@$EC2_HOST:~/deploy/"
echo "✓ Deploy files transferred"

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
echo "Automated setup completed!"
echo "=========================================="
echo ""
echo "Next: Edit .env files and restart services (see deploy/README.md)"

