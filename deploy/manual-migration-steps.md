# Manual Migration and Update Steps

Since SSH connection is timing out, follow these steps manually when you can connect to EC2.

## Step 1: Connect to EC2

```bash
ssh -i ~/Downloads/MS04_ID.pem ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com
```

**Note:** If this doesn't work, check:
- AWS Console → EC2 → Your instance → Check the current Public IPv4 address
- Update the hostname if the IP changed
- Verify Security Group allows SSH (port 22) from your IP

## Step 2: Run Database Migration

Once connected to EC2, run:

```bash
cd ~/Capstone_Interface

# Make sure migration file exists
ls -la python_processing/database_migration_add_gndvi.sql

# Load environment variables
source python_processing/.env

# Run migration
psql -U "$DB_USER" -d "$DB_NAME" -h "${DB_HOST:-localhost}" \
  -f python_processing/database_migration_add_gndvi.sql

# Verify migration
psql -U "$DB_USER" -d "$DB_NAME" -h "${DB_HOST:-localhost}" -c "
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='analyses' AND column_name LIKE 'gndvi%'
ORDER BY column_name;
"
```

## Step 3: Update Backend Code

```bash
cd ~/Capstone_Interface

# Pull latest code from GitHub
git pull origin main

# If git pull fails (not a git repo), initialize it:
# git init
# git remote add origin https://github.com/kevinb28-21/Capstone_Interface.git
# git fetch origin
# git checkout -b main origin/main

# Update Node.js dependencies
cd server
npm install --production
cd ..

# Update Python dependencies
cd python_processing
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate
cd ..
```

## Step 4: Restart Services

```bash
# Restart all PM2 services
pm2 restart all

# Check status
pm2 status

# View logs if needed
pm2 logs server
pm2 logs flask-api
pm2 logs background-worker
```

## Step 5: Verify Everything Works

```bash
# Check health endpoint
curl http://localhost:5050/api/health

# Should show:
# {
#   "status": "ok",
#   "database": "connected",
#   "service": "nodejs-backend",
#   "gndviColumns": true
# }
```

## Troubleshooting

### If migration fails with "permission denied":
```bash
sudo -u postgres psql -d drone_analytics -f ~/Capstone_Interface/python_processing/database_migration_add_gndvi.sql
```

### If git pull fails:
The project might have been transferred via SCP. You can either:
1. Initialize git repo (see Step 3)
2. Or manually copy files using the sync script from your local machine

### If services don't restart:
```bash
# Stop all services
pm2 stop all

# Delete and restart
pm2 delete all
cd ~/Capstone_Interface/server && pm2 start ecosystem.config.cjs
cd ~/Capstone_Interface/python_processing && pm2 start ecosystem.config.cjs
cd ~/Capstone_Interface/python_processing && pm2 start worker.config.cjs
pm2 save
```

