# Manual EC2 Setup Guide

If automated setup fails due to connection issues, follow these manual steps:

## Prerequisites Check

1. **Verify Key Pair in AWS Console:**
   - EC2 → Instances → Select your instance
   - Check "Key pair name" field
   - Ensure it matches your key file name

2. **Check Security Group:**
   - EC2 → Security Groups → Select your instance's security group
   - Inbound Rules → Must allow SSH (port 22) from your IP

3. **Verify Instance State:**
   - Instance must be in "running" state

## Once Connection Works

### Step 1: Connect to EC2

```bash
ssh -i ~/Downloads/MS04_ID.pem ec2-user@ec2-18-224-7-31.us-east-2.compute.amazonaws.com
```

### Step 2: Transfer Files Manually

From your local machine (in a new terminal):

```bash
cd /Users/kevinbhatt/Desktop/Projects/Capstone_Interface

# Transfer deploy directory
scp -i ~/Downloads/MS04_ID.pem -r deploy/ ec2-user@ec2-18-224-7-31.us-east-2.compute.amazonaws.com:~/

# Transfer PM2 configs
scp -i ~/Downloads/MS04_ID.pem server/ecosystem.config.js ec2-user@ec2-18-224-7-31.us-east-2.compute.amazonaws.com:~/
scp -i ~/Downloads/MS04_ID.pem python_processing/ecosystem.config.js ec2-user@ec2-18-224-7-31.us-east-2.compute.amazonaws.com:~/
scp -i ~/Downloads/MS04_ID.pem python_processing/worker.config.js ec2-user@ec2-18-224-7-31.us-east-2.compute.amazonaws.com:~/
```

### Step 3: Run Setup on EC2

Once connected to EC2:

```bash
chmod +x ~/deploy/ec2-setup.sh
~/deploy/ec2-setup.sh
```

### Step 4: Configure Environment

After setup completes:

```bash
# Edit server .env
nano ~/Capstone_Interface/server/.env

# Edit python .env
nano ~/Capstone_Interface/python_processing/.env

# Copy PM2 configs
cp ~/server-ecosystem.config.js ~/Capstone_Interface/server/ecosystem.config.js
cp ~/python-ecosystem.config.js ~/Capstone_Interface/python_processing/ecosystem.config.js
cp ~/python-worker.config.js ~/Capstone_Interface/python_processing/worker.config.js

# Restart services
pm2 restart all
pm2 status
```

## Alternative: Use AWS Systems Manager Session Manager

If SSH continues to fail, you can use AWS Systems Manager:

1. Install AWS CLI: `brew install awscli`
2. Configure: `aws configure`
3. Connect: `aws ssm start-session --target i-067f72e13b8724b18`

