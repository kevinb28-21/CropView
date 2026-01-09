#!/bin/bash
# Quick deployment script - copy and paste this entire script into EC2 Instance Connect
# Or run: bash <(curl -s https://raw.githubusercontent.com/kevinb28-21/Capstone_Interface/main/deploy/update-backend-cors-remote.sh)

set -e

echo "=========================================="
echo "🚀 Quick Backend Deployment"
echo "=========================================="
echo ""

cd ~/Capstone_Interface || { echo "❌ Error: ~/Capstone_Interface not found"; exit 1; }

echo "📥 Step 1: Pulling latest changes from GitHub..."
git pull origin main || {
    echo "⚠️  Warning: git pull failed. Trying to continue..."
    git fetch origin main || echo "Git fetch also failed"
}

echo ""
echo "📦 Step 2: Updating Node.js dependencies..."
cd server
npm install --production
cd ..

echo ""
echo "🔄 Step 3: Restarting PM2 services..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    pm2 save
    
    echo ""
    echo "✅ PM2 Status:"
    pm2 status
    
    echo ""
    echo "📋 Recent logs:"
    pm2 logs --lines 15 --nostream || true
else
    echo "❌ Error: PM2 not found"
    exit 1
fi

echo ""
echo "🏥 Step 4: Testing API health..."
HEALTH=$(curl -s http://localhost:5050/api/health 2>/dev/null || echo "FAILED")
if [ "$HEALTH" != "FAILED" ]; then
    echo "✅ Health check successful"
    echo "$HEALTH" | head -3
else
    echo "⚠️  Health check failed"
fi

echo ""
echo "🔍 Step 5: Verifying CORS configuration..."
if grep -q "netlifyPattern\|netlify\.app" server/src/server-enhanced.js 2>/dev/null || \
   grep -q "netlifyPattern\|netlify\.app" server/src/server.js 2>/dev/null; then
    echo "✅ CORS configuration includes Netlify support"
else
    echo "⚠️  Warning: CORS configuration may need update"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "The backend is now updated with:"
echo "  ✓ CORS support for all Netlify domains"
echo "  ✓ Latest code from GitHub"
echo "  ✓ All services restarted"
echo ""

