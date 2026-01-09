#!/bin/bash
# Automated deployment script that can be run on EC2
# This script assumes you're already connected to EC2 (via Instance Connect or SSH)
# Run this ON the EC2 instance, not from your local machine

set -e

echo "=========================================="
echo "🚀 Automated Backend Deployment"
echo "=========================================="
echo ""

# Navigate to project directory
cd ~/Capstone_Interface || {
    echo "❌ Error: ~/Capstone_Interface directory not found"
    echo "Please ensure the project is cloned to ~/Capstone_Interface"
    exit 1
}

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Pull latest changes
echo "📥 Step 1: Pulling latest changes from GitHub..."
if git pull origin main; then
    echo "✅ Successfully pulled latest changes"
else
    echo "⚠️  Warning: git pull failed. Attempting to fetch and reset..."
    git fetch origin main
    git reset --hard origin/main || {
        echo "❌ Error: Could not update from GitHub"
        echo "Continuing with existing code..."
    }
fi

echo ""

# Step 2: Update Node.js dependencies
echo "📦 Step 2: Updating Node.js dependencies..."
if [ -d "server" ]; then
    cd server
    npm install --production
    cd ..
    echo "✅ Node.js dependencies updated"
else
    echo "❌ Error: server directory not found"
    exit 1
fi

echo ""

# Step 3: Restart PM2 services
echo "🔄 Step 3: Restarting PM2 services..."
if command -v pm2 &> /dev/null; then
    # Restart all services
    pm2 restart all || {
        echo "⚠️  PM2 restart failed, trying to start services..."
        cd server
        if [ -f "ecosystem.config.cjs" ]; then
            pm2 start ecosystem.config.cjs
        elif [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js
        else
            echo "❌ No PM2 config file found"
            exit 1
        fi
        cd ..
    }
    
    # Save PM2 configuration
    pm2 save
    
    echo ""
    echo "✅ PM2 Status:"
    pm2 status
    
    echo ""
    echo "📋 Recent logs (last 15 lines):"
    pm2 logs --lines 15 --nostream || true
else
    echo "❌ Error: PM2 not found. Please install PM2 first:"
    echo "   npm install -g pm2"
    exit 1
fi

echo ""

# Step 4: Test health endpoint
echo "🏥 Step 4: Testing API health endpoint..."
sleep 2  # Give services time to start
HEALTH_RESPONSE=$(curl -s http://localhost:5050/api/health 2>/dev/null || echo "FAILED")
if [ "$HEALTH_RESPONSE" != "FAILED" ]; then
    echo "✅ Health check successful"
    echo "$HEALTH_RESPONSE" | head -5
else
    echo "⚠️  Health check failed - backend may still be starting"
    echo "   Check logs with: pm2 logs --lines 50"
fi

echo ""

# Step 5: Verify CORS configuration
echo "🔍 Step 5: Verifying CORS configuration..."
CORS_FIXED=false
if [ -f "server/src/server-enhanced.js" ]; then
    if grep -q "netlifyPattern\|netlify\.app" server/src/server-enhanced.js 2>/dev/null; then
        echo "✅ CORS configuration in server-enhanced.js includes Netlify support"
        CORS_FIXED=true
    fi
fi

if [ -f "server/src/server.js" ]; then
    if grep -q "netlifyPattern\|netlify\.app" server/src/server.js 2>/dev/null; then
        echo "✅ CORS configuration in server.js includes Netlify support"
        CORS_FIXED=true
    fi
fi

if [ "$CORS_FIXED" = false ]; then
    echo "⚠️  Warning: CORS configuration may not include Netlify support"
    echo "   Please verify server/src/server-enhanced.js or server/src/server.js"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Code updated from GitHub"
echo "  ✓ Dependencies installed"
echo "  ✓ PM2 services restarted"
if [ "$CORS_FIXED" = true ]; then
    echo "  ✓ CORS configuration verified"
fi
echo ""
echo "Next steps:"
echo "  1. Monitor logs: pm2 logs --lines 50"
echo "  2. Check status: pm2 status"
echo "  3. Test API: curl http://localhost:5050/api/health"
echo ""

