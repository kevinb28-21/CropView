# Deployment Alternatives

If the automated deployment script fails due to SSH connection issues, use one of these alternatives:

## Option 1: EC2 Instance Connect (Recommended - No SSH Setup Needed)

1. Go to [AWS Console → EC2 → Instances](https://console.aws.amazon.com/ec2/)
2. Select your instance: **i-0ce6adb51ca9c5a4d (CropView)**
3. Click **"Connect"** button
4. Select **"EC2 Instance Connect"** tab
5. Click **"Connect"** (opens browser-based terminal)
6. Run these commands:

```bash
cd ~/Capstone_Interface
git pull origin main
chmod +x deploy/fix-ec2-processing.sh
./deploy/fix-ec2-processing.sh
```

**Advantages:**
- ✅ No SSH key needed
- ✅ Works from any browser
- ✅ No security group configuration needed
- ✅ Works even if public IP changed

## Option 2: AWS Systems Manager Session Manager

1. Ensure Session Manager is set up (see `deploy/setup-session-manager.md`)
2. Install AWS CLI and Session Manager plugin locally
3. Run:

```bash
aws ssm start-session --target i-0ce6adb51ca9c5a4d
```

4. Then run the same commands as Option 1

## Option 3: Fix SSH Connection First

If you prefer SSH, fix the connection issue:

### Check Instance Status
1. AWS Console → EC2 → Instances
2. Verify instance is **"Running"**
3. Check **Public IPv4 address** (may have changed)

### Check Security Group
1. Select instance → Security tab
2. Click security group
3. Verify **Inbound Rules** allow:
   - Type: SSH
   - Port: 22
   - Source: Your IP or 0.0.0.0/0 (temporary)

### Update Deployment Script
If public IP changed, update `deploy/deploy-processing-fixes.sh`:
```bash
EC2_HOST="ec2-NEW-IP.us-east-2.compute.amazonaws.com"
```

## Option 4: Manual File Transfer via S3

If all else fails:

1. **Upload files to S3:**
   ```bash
   aws s3 cp python_processing/db_utils.py s3://ms04-image-db/deploy/db_utils.py
   aws s3 cp python_processing/background_worker.py s3://ms04-image-db/deploy/background_worker.py
   aws s3 cp deploy/fix-ec2-processing.sh s3://ms04-image-db/deploy/fix-ec2-processing.sh
   ```

2. **On EC2 (via Instance Connect):**
   ```bash
   cd ~/Capstone_Interface
   aws s3 cp s3://ms04-image-db/deploy/db_utils.py python_processing/
   aws s3 cp s3://ms04-image-db/deploy/background_worker.py python_processing/
   aws s3 cp s3://ms04-image-db/deploy/fix-ec2-processing.sh deploy/
   chmod +x deploy/fix-ec2-processing.sh
   ./deploy/fix-ec2-processing.sh
   ```

## Quick Reference: Commands to Run on EC2

Once connected (via any method), run:

```bash
# Navigate to project
cd ~/Capstone_Interface

# Pull latest code from GitHub
git pull origin main

# Make fix script executable
chmod +x deploy/fix-ec2-processing.sh

# Run the fix script
./deploy/fix-ec2-processing.sh

# Check PM2 status
pm2 status

# View logs
pm2 logs --lines 50
```

## What the Fix Script Does

The `fix-ec2-processing.sh` script will:
1. ✅ Check/create `.env` file with database credentials
2. ✅ Fix database file paths for failed images
3. ✅ Restart PM2 services
4. ✅ Verify everything is working

## Troubleshooting

### "git pull" fails
- Check if repository exists: `ls -la ~/Capstone_Interface/.git`
- If not, clone: `git clone https://github.com/kevinb28-21/Capstone_Interface.git`

### ".env file not found"
- The script will create it automatically
- Edit it: `nano ~/Capstone_Interface/python_processing/.env`
- Add your database password and AWS credentials

### "PM2 not found"
- Install PM2: `npm install -g pm2`
- Or start services manually

