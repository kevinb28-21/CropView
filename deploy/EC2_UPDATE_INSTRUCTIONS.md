# EC2 Backend Update Instructions

## Quick Update (EC2 Instance Connect - Recommended)

Since SSH may not be working, use EC2 Instance Connect:

1. **Go to AWS Console:**
   - Navigate to EC2 → Instances
   - Select instance: **i-0ce6adb51ca9c5a4d (CropView)**
   - Click **"Connect"** button

2. **Choose EC2 Instance Connect:**
   - Select **"EC2 Instance Connect"** tab
   - Click **"Connect"** (opens browser terminal)

3. **Run these commands:**
   ```bash
   cd ~/Capstone_Interface
   git pull origin main
   chmod +x deploy/fix-ec2-processing.sh
   ./deploy/fix-ec2-processing.sh
   ```

4. **Verify services are running:**
   ```bash
   pm2 status
   pm2 logs --lines 20
   ```

## What Gets Updated

The update script will:
- ✅ Pull latest code from GitHub (all fixes included)
- ✅ Update Node.js dependencies (`npm install`)
- ✅ Update Python dependencies (`pip install -r requirements.txt`)
- ✅ Fix image file paths in database (auto-repair)
- ✅ Restart PM2 services (Node.js backend, Python worker, Flask API)
- ✅ Verify everything is working

## Automated Update (If SSH Works)

If SSH connection is working, you can use:

```bash
./deploy/update-ec2-complete.sh
```

This script will:
- Test SSH connection first
- Sync all backend files
- Run the fix script remotely
- Restart all services

## Manual Update Steps

If automated scripts fail, update manually:

```bash
# 1. Connect to EC2 (via Instance Connect or SSH)
cd ~/Capstone_Interface

# 2. Pull latest code
git pull origin main

# 3. Update Node.js dependencies
cd server
npm install --production
cd ..

# 4. Update Python dependencies
cd python_processing
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate
cd ..

# 5. Fix image paths (if needed)
chmod +x deploy/fix-ec2-processing.sh
./deploy/fix-ec2-processing.sh

# 6. Restart services
pm2 restart all
pm2 save

# 7. Check status
pm2 status
pm2 logs --lines 50
```

## Verify Update Success

After updating, verify:

1. **Check PM2 services:**
   ```bash
   pm2 status
   ```
   Should show: `nodejs-backend`, `flask-api`, `background-worker` all running

2. **Check API health:**
   ```bash
   curl http://localhost:5050/api/health
   ```
   Should return: `{"status":"ok","database":"connected",...}`

3. **Check worker logs:**
   ```bash
   pm2 logs background-worker --lines 20
   ```
   Should show: "Background Image Processing Worker Starting" and "Repaired X image file path(s)"

4. **Test from frontend:**
   - Go to your Netlify site
   - Try uploading an image
   - Check that processing completes successfully

## Troubleshooting

### Git Pull Fails
```bash
# If repository doesn't exist or is corrupted
cd ~
rm -rf Capstone_Interface
git clone https://github.com/kevinb28-21/Capstone_Interface.git
cd Capstone_Interface
```

### PM2 Not Found
```bash
npm install -g pm2
pm2 startup
pm2 save
```

### Services Not Starting
```bash
# Check logs
pm2 logs

# Restart all
pm2 restart all

# If still failing, check .env files
cat python_processing/.env
cat server/.env
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U drone_user -d drone_analytics -c "SELECT 1;"
```

## What's Fixed in This Update

1. **Image Processing:**
   - Always saves local file_path (even with S3)
   - Robust path resolution (5 priority levels)
   - Auto-repair at startup
   - Auto-update database when paths found

2. **Database:**
   - Numpy type conversion fixes
   - GNDVI column support
   - Better error handling

3. **Backend:**
   - Port changed to 5050 (avoids conflicts)
   - CORS configuration updated
   - Better error messages

All fixes are automatic and persistent - no manual intervention needed after update!

