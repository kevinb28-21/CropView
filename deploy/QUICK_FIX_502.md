# Quick Fix for 502 Bad Gateway

## The Problem

You're seeing a 502 Bad Gateway error, which means:
- ✅ Nginx is running and receiving requests
- ❌ Nginx cannot connect to the Node.js backend on `localhost:5050`

## The Solution (3 Steps)

### Step 1: SSH into EC2

```bash
ssh -i your-key.pem ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com
```

### Step 2: Run the Fix Script

```bash
cd ~/Capstone_Interface
bash deploy/fix-502-bad-gateway.sh
```

This script will:
- Check if PM2 is running the backend
- Restart the backend if needed
- Verify port 5050 is listening
- Test the backend health endpoint
- Restart nginx
- Verify everything is working

### Step 3: Verify It's Fixed

```bash
# Test backend directly
curl http://localhost:5050/api/health

# Test through nginx
curl http://localhost/api/health
```

## If the Script Doesn't Work

Run these commands manually:

```bash
# 1. Restart backend
pm2 restart drone-backend

# 2. Check if it's running
pm2 status

# 3. Check logs for errors
pm2 logs drone-backend --lines 20

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Test
curl http://localhost:5050/api/health
```

## Common Causes

1. **Backend crashed** - Check `pm2 logs drone-backend`
2. **Database connection failed** - Check `.env` file has correct DB credentials
3. **Port conflict** - Another process using port 5050
4. **PM2 not started on boot** - Backend stopped after server restart

## Still Not Working?

See [FIX_502_INSTRUCTIONS.md](./FIX_502_INSTRUCTIONS.md) for detailed troubleshooting.

