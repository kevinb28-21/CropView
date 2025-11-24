#!/bin/bash
# Script to check EC2 connection and get current details
# Usage: ./check-ec2-connection.sh

KEY_FILE="$HOME/Downloads/MS04_ID.pem"
EC2_HOST="ec2-18-223-169-5.us-east-2.compute.amazonaws.com"
EC2_USER="ubuntu"

echo "=========================================="
echo "EC2 Connection Diagnostic"
echo "=========================================="
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Key file not found at: $KEY_FILE"
    echo ""
    echo "Please update KEY_FILE path or place MS04_ID.pem in ~/Downloads/"
    exit 1
fi

echo "✓ Key file found: $KEY_FILE"
chmod 400 "$KEY_FILE"

echo ""
echo "Attempting to connect to: $EC2_USER@$EC2_HOST"
echo ""

# Try to get instance info via AWS CLI if available
if command -v aws &> /dev/null; then
    echo "Checking instance status via AWS CLI..."
    INSTANCE_ID="i-067f72e13b8724b18"
    aws ec2 describe-instances --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,PublicDnsName]' \
        --output text 2>/dev/null && echo ""
fi

# Try SSH connection
echo "Testing SSH connection..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=5 -o StrictHostKeyChecking=no \
    "$EC2_USER@$EC2_HOST" "echo 'Connection successful!'" 2>/dev/null; then
    echo "✓ SSH connection successful!"
    echo ""
    echo "You can now run:"
    echo "  ./deploy/migrate-and-update.sh"
    exit 0
else
    echo "❌ SSH connection failed"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check AWS Console → EC2 → Your instance"
    echo "   - Verify instance is 'running'"
    echo "   - Check the current 'Public IPv4 address'"
    echo "   - The IP may have changed if instance was stopped/started"
    echo ""
    echo "2. Verify Security Group:"
    echo "   - EC2 → Security Groups → Your instance's security group"
    echo "   - Ensure port 22 (SSH) is open from your IP"
    echo ""
    echo "3. Try connecting with current IP:"
    echo "   ssh -i $KEY_FILE $EC2_USER@<current-public-ip>"
    echo ""
    echo "4. Alternative: Use AWS Systems Manager Session Manager"
    echo "   - AWS Console → EC2 → Your instance → Connect → Session Manager"
    exit 1
fi

