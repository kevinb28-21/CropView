#!/bin/bash
# Fix 502 Bad Gateway Error
# This script diagnoses and fixes nginx → Node.js backend connection issues

set -e

echo "=========================================="
echo "502 Bad Gateway Fix Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check PM2 status
echo "Step 1: Checking PM2 status..."
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed!"
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Check for .env file first
if [ ! -f ~/Capstone_Interface/server/.env ]; then
    print_error ".env file not found!"
    echo "Creating .env template..."
    cat > ~/Capstone_Interface/server/.env << 'EOF'
PORT=5050
NODE_ENV=production
ORIGIN=http://localhost:5173,http://localhost:5182

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drone_analytics
DB_USER=drone_user
DB_PASSWORD=changeme

# AWS S3 (optional)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=us-east-2
# S3_BUCKET_NAME=
EOF
    print_warning "Created .env template. Please edit it with your actual values:"
    echo "  nano ~/Capstone_Interface/server/.env"
fi

PM2_STATUS=$(pm2 list 2>/dev/null | grep -c "drone-backend" || echo "0")
if [ "$PM2_STATUS" -eq 0 ]; then
    print_warning "Backend process not found in PM2"
    echo "Checking if we need to start it..."
    
    # Try .cjs first (CommonJS - more reliable), then .js
    if [ -f ~/Capstone_Interface/server/ecosystem.config.cjs ]; then
        echo "Starting backend with PM2 (using .cjs config)..."
        cd ~/Capstone_Interface/server
        pm2 delete drone-backend 2>/dev/null || true
        pm2 start ecosystem.config.cjs
        pm2 save
        print_status "Backend started with PM2 (ecosystem.config.cjs)"
    elif [ -f ~/Capstone_Interface/server/ecosystem.config.js ]; then
        echo "Starting backend with PM2 (using .js config)..."
        cd ~/Capstone_Interface/server
        pm2 delete drone-backend 2>/dev/null || true
        pm2 start ecosystem.config.js
        pm2 save
        print_status "Backend started with PM2 (ecosystem.config.js)"
    else
        print_error "ecosystem.config.js or .cjs not found!"
        echo "Creating ecosystem.config.cjs (CommonJS format)..."
        mkdir -p ~/Capstone_Interface/server/logs
        cat > ~/Capstone_Interface/server/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'drone-backend',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5050
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
EOF
        cd ~/Capstone_Interface/server
        pm2 start ecosystem.config.cjs
        pm2 save
        print_status "Created and started backend"
    fi
else
    print_status "Backend process found in PM2"
    echo "Checking status..."
    PM2_STATE=$(pm2 jlist 2>/dev/null | grep -o '"pm2_env":{"status":"[^"]*"' | grep -o 'status":"[^"]*' | cut -d'"' -f3 || echo "unknown")
    if [ "$PM2_STATE" != "online" ]; then
        print_warning "Backend status: $PM2_STATE (not online)"
        echo "Restarting backend..."
        pm2 restart drone-backend
    else
        print_status "Backend is online, restarting to ensure clean state..."
        pm2 restart drone-backend
    fi
    sleep 3
fi

# Step 2: Check if port 5050 is listening
echo ""
echo "Step 2: Checking if backend is listening on port 5050..."
sleep 3  # Give it time to start

if sudo netstat -tlnp 2>/dev/null | grep -q ":5050" || sudo ss -tlnp 2>/dev/null | grep -q ":5050"; then
    print_status "Port 5050 is listening"
else
    print_error "Port 5050 is NOT listening!"
    echo "Checking backend logs..."
    pm2 logs drone-backend --lines 20 --nostream
    print_warning "Backend may have crashed. Check logs above."
fi

# Step 3: Test backend health endpoint
echo ""
echo "Step 3: Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5050/api/health || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_status "Backend health check passed"
    curl -s http://localhost:5050/api/health | head -3
else
    print_error "Backend health check failed (HTTP $HEALTH_RESPONSE)"
    echo ""
    echo "Recent backend logs:"
    pm2 logs drone-backend --lines 30 --nostream
    echo ""
    print_warning "Attempting to diagnose the issue..."
    
    # Check if backend can start manually
    cd ~/Capstone_Interface/server
    if [ -f src/server.js ]; then
        echo "Testing if backend can start manually (5 second timeout)..."
        timeout 5 node src/server.js 2>&1 | head -20 || echo "Backend failed to start - check errors above"
    fi
    
    # Check database connection
    echo ""
    echo "Checking database connection..."
    if command -v psql &> /dev/null; then
        if [ -f .env ]; then
            source .env 2>/dev/null || true
            if psql -U "${DB_USER:-drone_user}" -d "${DB_NAME:-drone_analytics}" -h "${DB_HOST:-localhost}" -c "SELECT 1;" 2>/dev/null; then
                print_status "Database connection successful"
            else
                print_error "Database connection failed!"
                echo "Check your .env file database credentials"
            fi
        fi
    fi
fi

# Step 4: Check nginx configuration
echo ""
echo "Step 4: Checking nginx configuration..."

if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed!"
    echo "Installing nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Check if nginx config exists
NGINX_CONFIG="/etc/nginx/sites-available/drone-backend"
NGINX_CONFIG_ALT="/etc/nginx/conf.d/drone-backend.conf"

if [ -f "$NGINX_CONFIG" ] || [ -f "$NGINX_CONFIG_ALT" ]; then
    print_status "Nginx configuration found"
else
    print_warning "Nginx configuration not found. Creating it..."
    
    if [ -f ~/Capstone_Interface/deploy/nginx.conf ]; then
        sudo cp ~/Capstone_Interface/deploy/nginx.conf /etc/nginx/sites-available/drone-backend
        sudo ln -sf /etc/nginx/sites-available/drone-backend /etc/nginx/sites-enabled/
        print_status "Nginx configuration created"
    else
        print_error "nginx.conf template not found!"
    fi
fi

# Test nginx configuration
echo "Testing nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    sudo nginx -t
fi

# Step 5: Restart nginx
echo ""
echo "Step 5: Restarting nginx..."
sudo systemctl restart nginx
sleep 2

if sudo systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx failed to start!"
    sudo systemctl status nginx --no-pager | head -10
fi

# Step 6: Check nginx error logs
echo ""
echo "Step 6: Checking recent nginx errors..."
if [ -f /var/log/nginx/error.log ]; then
    RECENT_ERRORS=$(sudo tail -5 /var/log/nginx/error.log)
    if [ -z "$RECENT_ERRORS" ] || echo "$RECENT_ERRORS" | grep -q "connect() failed"; then
        print_warning "Nginx connection errors detected:"
        echo "$RECENT_ERRORS"
    else
        print_status "No recent nginx errors"
    fi
fi

# Step 7: Verify PM2 startup on boot
echo ""
echo "Step 7: Ensuring PM2 starts on boot..."
if ! pm2 startup | grep -q "already setup"; then
    print_warning "PM2 startup not configured. Setting it up..."
    STARTUP_CMD=$(pm2 startup systemd -u $USER --hp $HOME | grep "sudo")
    if [ ! -z "$STARTUP_CMD" ]; then
        echo "Run this command to enable PM2 startup:"
        echo "$STARTUP_CMD"
    fi
    pm2 save
else
    print_status "PM2 startup already configured"
fi

# Step 8: Final verification
echo ""
echo "=========================================="
echo "Final Verification"
echo "=========================================="

echo ""
echo "PM2 Status:"
pm2 list | grep -E "drone-backend|server" || echo "No backend process found"

echo ""
echo "Port 5050 Status:"
sudo netstat -tlnp 2>/dev/null | grep ":5050" || sudo ss -tlnp 2>/dev/null | grep ":5050" || echo "Port 5050 not listening"

echo ""
echo "Backend Health:"
curl -s http://localhost:5050/api/health || echo "Backend not responding"

echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager | head -3

echo ""
echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "If issues persist:"
echo "1. Check backend logs: pm2 logs drone-backend"
echo "2. Check nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "3. Verify .env file: cat ~/Capstone_Interface/server/.env"
echo "4. Test backend directly: curl http://localhost:5050/api/health"
echo ""

