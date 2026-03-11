#!/bin/bash
# Restart all PM2 processes (Node backend + Flask API + background worker).
# Run on EC2 after deploy or reboot: bash restart-all.sh

set -e
echo "Restarting all PM2 processes..."
cd ~/Capstone_Interface/server && pm2 start ecosystem.config.cjs --update-env 2>/dev/null || pm2 start ecosystem.config.js --update-env
cd ~/Capstone_Interface/python_processing && pm2 start ecosystem.config.cjs --update-env 2>/dev/null || pm2 start ecosystem.config.js --update-env
pm2 save
pm2 list
