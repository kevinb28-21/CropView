#!/bin/bash
# Troubleshooting script for EC2 connection

KEY_FILE="$HOME/Downloads/MS04_ID.pem"
EC2_HOST="ec2-18-224-7-31.us-east-2.compute.amazonaws.com"

echo "=========================================="
echo "EC2 Connection Troubleshooting"
echo "=========================================="
echo ""

# Check key file
echo "1. Checking key file..."
if [ -f "$KEY_FILE" ]; then
    echo "   ✓ Key file exists: $KEY_FILE"
    chmod 400 "$KEY_FILE"
    echo "   ✓ Permissions set correctly"
else
    echo "   ✗ Key file not found: $KEY_FILE"
    exit 1
fi
echo ""

# Test connection with verbose output
echo "2. Testing SSH connection (verbose)..."
echo "   Attempting to connect to: $EC2_HOST"
echo ""

ssh -v -i "$KEY_FILE" ec2-user@$EC2_HOST "echo 'Connection successful'" 2>&1 | tail -20

echo ""
echo "=========================================="
echo "If connection failed, check:"
echo "=========================================="
echo "1. AWS Console → EC2 → Your Instance:"
echo "   - Is the instance in 'running' state?"
echo "   - What key pair is associated? (should be MS04_ID)"
echo ""
echo "2. Security Group:"
echo "   - Does it allow SSH (port 22) from your IP?"
echo "   - Check: EC2 → Security Groups → Inbound Rules"
echo ""
echo "3. Key Pair:"
echo "   - In EC2 Console, verify the key pair name matches: MS04_ID"
echo "   - If different, you may need the correct key file"
echo ""

