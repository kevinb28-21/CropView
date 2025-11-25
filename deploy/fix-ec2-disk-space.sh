#!/bin/bash
# Script to free up disk space on EC2
# Run this on EC2 if you see "no space left on device" errors

echo "=========================================="
echo "EC2 Disk Space Cleanup"
echo "=========================================="
echo ""

# Check current disk usage
echo "Current disk usage:"
df -h /

echo ""
echo "Cleaning up..."

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Clean pip cache
echo "Cleaning pip cache..."
pip cache purge 2>/dev/null || true

# Remove old logs
echo "Removing old log files..."
find ~/.pm2/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
find /tmp -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Clean apt cache (if on Ubuntu)
if command -v apt-get &> /dev/null; then
    echo "Cleaning apt cache..."
    sudo apt-get clean 2>/dev/null || true
    sudo apt-get autoremove -y 2>/dev/null || true
fi

# Remove old Docker images/containers (if Docker is installed)
if command -v docker &> /dev/null; then
    echo "Cleaning Docker..."
    docker system prune -f 2>/dev/null || true
fi

# Show updated disk usage
echo ""
echo "Updated disk usage:"
df -h /

echo ""
echo "=========================================="
echo "Cleanup complete!"
echo "=========================================="

