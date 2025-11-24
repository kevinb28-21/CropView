# Run Migration via EC2 Instance Connect

Since SSH is blocked, use EC2 Instance Connect (works immediately, no setup needed).

## Step 1: Connect via EC2 Instance Connect

1. Go to **AWS Console** → **EC2** → **Instances**
2. Select instance: **i-0ce6adb51ca9c5a4d (CropView)**
3. Click **Connect** button
4. Choose **EC2 Instance Connect** tab
5. Click **Connect** (opens browser terminal)

**Note:** Sessions are 60 seconds, but you can reconnect multiple times.

## Step 2: Run Migration Commands

Once connected, copy and paste these commands one section at a time:

### Part 1: Navigate and Check
```bash
cd ~/Capstone_Interface
pwd
ls -la python_processing/database_migration_add_gndvi.sql
```

### Part 2: Load Environment Variables
```bash
source python_processing/.env
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
```

### Part 3: Run Migration
```bash
psql -U "$DB_USER" -d "$DB_NAME" -h "${DB_HOST:-localhost}" \
  -f python_processing/database_migration_add_gndvi.sql
```

### Part 4: Verify Migration
```bash
psql -U "$DB_USER" -d "$DB_NAME" -h "${DB_HOST:-localhost}" -c "
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='analyses' AND column_name LIKE 'gndvi%'
ORDER BY column_name;
"
```

You should see:
- gndvi
- gndvi_mean
- gndvi_std
- gndvi_min
- gndvi_max

### Part 5: Update Code
```bash
cd ~/Capstone_Interface
git pull origin main 2>/dev/null || echo "Git not configured - will need to sync manually"
```

### Part 6: Update Dependencies
```bash
cd server
npm install --production
cd ..

cd python_processing
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate
cd ..
```

### Part 7: Restart Services
```bash
pm2 restart all
pm2 status
```

## Step 3: Verify Fix

After restarting, check the health endpoint:

```bash
curl http://localhost:5050/api/health | python3 -m json.tool
```

Should show:
```json
{
  "status": "ok",
  "database": "connected",
  "service": "nodejs-backend",
  "gndviColumns": true
}
```

## If Session Times Out

EC2 Instance Connect sessions are 60 seconds. If you need more time:
1. Run commands in smaller chunks
2. Reconnect as needed
3. Or fix SSH security group (see fix-security-group.sh) for persistent access

## Alternative: Fix Security Group First

If you want persistent SSH access, fix the security group first:

1. **AWS Console** → **EC2** → **Instances** → Select your instance
2. **Security** tab → Click Security Group name
3. **Edit inbound rules** → **Add rule**:
   - Type: SSH
   - Port: 22
   - Source: 0.0.0.0/0
4. **Save rules**

Then use the migration script:
```bash
./deploy/migrate-and-update.sh ~/Downloads/MS04_ID.pem ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com
```

