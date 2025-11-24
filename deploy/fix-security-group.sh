#!/bin/bash
# Instructions to fix Security Group for SSH access
# This script provides AWS CLI commands to fix the security group

INSTANCE_ID="i-0ce6adb51ca9c5a4d"

echo "=========================================="
echo "Security Group Fix for SSH Access"
echo "=========================================="
echo ""
echo "Your instance ID: $INSTANCE_ID"
echo ""
echo "To fix SSH access, you need to:"
echo ""
echo "1. Get your current public IP:"
echo "   curl -s https://checkip.amazonaws.com"
echo ""
echo "2. Get the Security Group ID for your instance:"
echo "   aws ec2 describe-instances --instance-ids $INSTANCE_ID \\"
echo "     --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \\"
echo "     --output text"
echo ""
echo "3. Add SSH rule to Security Group (replace YOUR_IP and SG_ID):"
echo "   aws ec2 authorize-security-group-ingress \\"
echo "     --group-id <SG_ID> \\"
echo "     --protocol tcp \\"
echo "     --port 22 \\"
echo "     --cidr <YOUR_IP>/32"
echo ""
echo "OR allow from anywhere (less secure but works):"
echo "   aws ec2 authorize-security-group-ingress \\"
echo "     --group-id <SG_ID> \\"
echo "     --protocol tcp \\"
echo "     --port 22 \\"
echo "     --cidr 0.0.0.0/0"
echo ""
echo "=========================================="
echo "Quick Fix (if AWS CLI is configured):"
echo "=========================================="

# Check if AWS CLI is available
if command -v aws &> /dev/null; then
    echo "AWS CLI found. Attempting to get Security Group..."
    
    # Get security group ID
    SG_ID=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
        --output text 2>/dev/null)
    
    if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
        echo "Security Group ID: $SG_ID"
        echo ""
        echo "Current inbound rules:"
        aws ec2 describe-security-groups --group-ids "$SG_ID" \
            --query 'SecurityGroups[0].IpPermissions[?FromPort==`22`]' \
            --output table 2>/dev/null || echo "No SSH rules found"
        echo ""
        echo "To add SSH access, run:"
        echo "  aws ec2 authorize-security-group-ingress \\"
        echo "    --group-id $SG_ID \\"
        echo "    --protocol tcp \\"
        echo "    --port 22 \\"
        echo "    --cidr 0.0.0.0/0"
    else
        echo "Could not retrieve Security Group. Check AWS credentials."
    fi
else
    echo "AWS CLI not found. Use AWS Console method below."
fi

echo ""
echo "=========================================="
echo "AWS Console Method (Recommended):"
echo "=========================================="
echo "1. Go to: https://console.aws.amazon.com/ec2/"
echo "2. Click 'Instances' → Select instance $INSTANCE_ID"
echo "3. Click 'Security' tab → Click Security Group name"
echo "4. Click 'Edit inbound rules'"
echo "5. Click 'Add rule':"
echo "   - Type: SSH"
echo "   - Port: 22"
echo "   - Source: 0.0.0.0/0 (or your IP for security)"
echo "6. Click 'Save rules'"
echo ""
echo "Then try connecting again:"
echo "  ssh -i ~/Downloads/MS04_ID.pem ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com"

