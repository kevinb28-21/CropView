#!/bin/bash
# Alternative deployment method: Use Git pull on EC2
# This is useful when SSH connection is not available
# Use EC2 Instance Connect or Session Manager to run this

echo "=========================================="
echo "Deploy Processing Fixes via Git"
echo "=========================================="
echo ""
echo "This script should be run ON THE EC2 INSTANCE"
echo "Use EC2 Instance Connect or Session Manager to connect"
echo ""
echo "Commands to run on EC2:"
echo ""
echo "cd ~/Capstone_Interface"
echo "git pull origin main"
echo "chmod +x deploy/fix-ec2-processing.sh"
echo "./deploy/fix-ec2-processing.sh"
echo ""
echo "Or run this single command:"
echo ""
echo "cd ~/Capstone_Interface && git pull origin main && chmod +x deploy/fix-ec2-processing.sh && ./deploy/fix-ec2-processing.sh"
echo ""

