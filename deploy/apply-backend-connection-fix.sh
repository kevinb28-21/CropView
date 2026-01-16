#!/bin/bash
# Deployment script to apply backend connection fixes to EC2
# This script updates the backend server to listen on 0.0.0.0

set -e

EC2_HOST="ec2-3-144-192-19.us-east-2.compute.amazonaws.com"
EC2_USER="ubuntu"
KEY_FILE="${1:-MS04_ID.pem}"

echo "=========================================="
echo "Backend Connection Fix - EC2 Deployment"
echo "=========================================="
echo ""
echo "EC2 Host: $EC2_HOST"
echo "Key File: $KEY_FILE"
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file '$KEY_FILE' not found"
    echo "   Please provide the path to your EC2 key file:"
    echo "   Usage: $0 /path/to/MS04_ID.pem"
    exit 1
fi

# Make key file readable only by owner
chmod 400 "$KEY_FILE"

echo "📋 Step 1: Connecting to EC2 instance..."
echo ""

# SSH into EC2 and apply fixes
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
set -e

echo "✓ Connected to EC2 instance"
echo ""

# Navigate to server directory
cd ~/Capstone_Interface/server || {
    echo "❌ Error: ~/Capstone_Interface/server not found"
    echo "   Please ensure the project is cloned on EC2"
    exit 1
}

echo "📋 Step 2: Updating server.js to listen on 0.0.0.0..."
echo ""

# Check current listen configuration
if grep -q "app.listen(PORT, '0.0.0.0'" src/server.js; then
    echo "✓ Server already configured to listen on 0.0.0.0"
else
    # Update server.js to listen on 0.0.0.0
    if grep -q "app.listen(PORT," src/server.js; then
        # Replace app.listen(PORT, with app.listen(PORT, '0.0.0.0',
        sed -i "s/app\.listen(PORT,/app.listen(PORT, '0.0.0.0',/" src/server.js
        echo "✓ Updated server.js to listen on 0.0.0.0"
    else
        echo "⚠️  Warning: Could not find app.listen in server.js"
        echo "   Please manually update server.js"
    fi
fi

# Verify the change
echo ""
echo "📋 Step 3: Verifying configuration..."
if grep -q "app.listen(PORT, '0.0.0.0'" src/server.js; then
    echo "✓ Server configured correctly"
    grep "app.listen" src/server.js | head -1
else
    echo "❌ Error: Server configuration not updated correctly"
    exit 1
fi

echo ""
echo "📋 Step 4: Checking if server is running..."
echo ""

# Check if PM2 is being used
if command -v pm2 &> /dev/null; then
    echo "✓ PM2 detected"
    if pm2 list | grep -q "server\|node"; then
        echo "✓ Server process found in PM2"
        echo ""
        echo "📋 Step 5: Restarting server with PM2..."
        pm2 restart all || pm2 restart server || {
            echo "⚠️  Warning: PM2 restart failed, trying to start..."
            pm2 start ecosystem.config.cjs || pm2 start ecosystem.config.js || {
                echo "⚠️  Could not restart with PM2, please restart manually"
            }
        }
        echo "✓ Server restarted"
        pm2 list
    else
        echo "⚠️  No server process found in PM2"
        echo "   Starting server with PM2..."
        pm2 start ecosystem.config.cjs || pm2 start ecosystem.config.js || {
            echo "⚠️  Could not start with PM2"
            echo "   Please start the server manually"
        }
    fi
elif [ -f "/etc/systemd/system/backend.service" ] || systemctl list-units | grep -q "backend"; then
    echo "✓ Systemd service detected"
    echo ""
    echo "📋 Step 5: Restarting server with systemd..."
    sudo systemctl restart backend || {
        echo "⚠️  Warning: Could not restart systemd service"
        echo "   Service name might be different, please restart manually"
    }
    sudo systemctl status backend --no-pager | head -10
else
    echo "⚠️  No process manager detected (PM2 or systemd)"
    echo "   Please restart the server manually:"
    echo "   cd ~/Capstone_Interface/server && npm start"
fi

echo ""
echo "📋 Step 6: Verifying server is listening on 0.0.0.0..."
echo ""

# Wait a moment for server to start
sleep 2

# Check if port 5050 is listening on 0.0.0.0
if netstat -tlnp 2>/dev/null | grep -q ":5050.*0.0.0.0"; then
    echo "✓ Server is listening on 0.0.0.0:5050"
    netstat -tlnp 2>/dev/null | grep ":5050" || ss -tlnp 2>/dev/null | grep ":5050"
elif ss -tlnp 2>/dev/null | grep -q ":5050.*0.0.0.0"; then
    echo "✓ Server is listening on 0.0.0.0:5050"
    ss -tlnp 2>/dev/null | grep ":5050"
else
    echo "⚠️  Warning: Could not verify server is listening on 0.0.0.0:5050"
    echo "   Server might still be starting, or using a different port"
fi

echo ""
echo "📋 Step 7: Testing health endpoint..."
echo ""

# Test health endpoint
if curl -s -f http://localhost:5050/api/health > /dev/null; then
    echo "✓ Health endpoint responding locally"
    curl -s http://localhost:5050/api/health | head -3
else
    echo "⚠️  Warning: Health endpoint not responding locally"
    echo "   Server might still be starting"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test backend from your local machine:"
echo "   curl http://$EC2_HOST:5050/api/health"
echo ""
echo "2. Verify EC2 security group allows port 5050"
echo ""
echo "3. Deploy frontend to Netlify (if not auto-deployed)"
echo ""

ENDSSH

echo ""
echo "=========================================="
echo "✅ EC2 Deployment Script Complete"
echo "=========================================="
echo ""
echo "Testing backend from local machine..."
echo ""

# Test backend from local machine
if curl -s -f --max-time 5 "http://$EC2_HOST:5050/api/health" > /dev/null 2>&1; then
    echo "✓ Backend is accessible from internet!"
    curl -s "http://$EC2_HOST:5050/api/health" | head -5
else
    echo "⚠️  Backend not accessible from internet yet"
    echo "   This might be due to:"
    echo "   1. Security group not allowing port 5050"
    echo "   2. Server still starting"
    echo "   3. Firewall blocking connections"
    echo ""
    echo "   Check EC2 security group inbound rules for port 5050"
fi

echo ""
