# Quick Start - EC2 Deployment

## Prerequisites

1. Your `id_rsa` key file must be accessible
2. Your EC2 instance must be running
3. Security group must allow SSH (port 22)

## Step 1: Locate Your Key File

Your key file should be named `id_rsa`. Common locations:
- `~/Downloads/id_rsa`
- `~/.ssh/id_rsa`
- Wherever you downloaded it from AWS

## Step 2: Copy Key to Project (Optional but Recommended)

```bash
# Copy your key file to the project directory
cp /path/to/your/id_rsa /Users/kevinbhatt/Desktop/Projects/Capstone_Interface/
```

## Step 3: Run Automated Setup

### Option A: If key is in project directory
```bash
cd /Users/kevinbhatt/Desktop/Projects/Capstone_Interface
./deploy/auto-setup.sh
```

### Option B: If key is elsewhere
```bash
cd /Users/kevinbhatt/Desktop/Projects/Capstone_Interface
./deploy/run-setup.sh
# When prompted, enter the full path to your key file
```

## Step 4: After Setup Completes

1. **SSH into EC2:**
   ```bash
   ssh -i id_rsa ec2-user@ec2-18-224-7-31.us-east-2.compute.amazonaws.com
   ```

2. **Edit environment files:**
   ```bash
   nano ~/Capstone_Interface/server/.env
   # Add your AWS credentials, database password, etc.
   
   nano ~/Capstone_Interface/python_processing/.env
   # Add your AWS credentials, database password, etc.
   ```

3. **Copy PM2 configs:**
   ```bash
   cp ~/server-ecosystem.config.js ~/Capstone_Interface/server/ecosystem.config.js
   cp ~/python-ecosystem.config.js ~/Capstone_Interface/python_processing/ecosystem.config.js
   cp ~/python-worker.config.js ~/Capstone_Interface/python_processing/worker.config.js
   ```

4. **Restart services:**
   ```bash
   pm2 restart all
   pm2 status
   ```

5. **Check logs:**
   ```bash
   pm2 logs
   ```

## Troubleshooting

### Key file not found
- Make sure you've copied `id_rsa` to the project directory
- Or use `run-setup.sh` and provide the full path when prompted

### Connection refused
- Check EC2 instance is running
- Verify security group allows SSH from your IP
- Check key file permissions: `chmod 400 id_rsa`

### Setup script fails
- Check EC2 has internet connection
- Verify you have sufficient disk space
- Check logs on EC2: `ssh` in and run `pm2 logs`

