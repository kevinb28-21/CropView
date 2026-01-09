# Deploy CORS Fix to EC2 Backend

## Quick Deployment (Recommended)

Since SSH may not be available, use **EC2 Instance Connect**:

### Step 1: Connect to EC2
1. Go to [AWS Console](https://console.aws.amazon.com/ec2/)
2. Navigate to **EC2 → Instances**
3. Find your instance (look for `ec2-18-117-90-212`)
4. Click **"Connect"** button
5. Select **"EC2 Instance Connect"** tab
6. Click **"Connect"** (opens browser terminal)

### Step 2: Run Deployment Script
Once connected, run:

```bash
cd ~/Capstone_Interface
git pull origin main
chmod +x deploy/update-backend-cors-remote.sh
bash deploy/update-backend-cors-remote.sh
```

This script will:
- ✅ Pull latest code from GitHub (includes CORS fixes)
- ✅ Update Node.js dependencies
- ✅ Restart PM2 services
- ✅ Test API health endpoint
- ✅ Verify CORS configuration

### Step 3: Verify Deployment
After the script completes, verify:

```bash
# Check PM2 status
pm2 status

# View recent logs
pm2 logs --lines 50

# Test health endpoint
curl http://localhost:5050/api/health

# Test CORS (should work now)
curl -H "Origin: https://your-site.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:5050/api/health
```

## What Was Fixed

1. **CORS Configuration**: Backend now automatically allows all Netlify domains
   - Production: `*.netlify.app`
   - Preview: `*--*.netlify.app`
   - No need to manually add each domain

2. **Server Files Updated**:
   - `server/src/server-enhanced.js` - Enhanced server with CORS fix
   - `server/src/server.js` - Standard server with CORS fix

3. **Error Handling**: Improved API error messages in frontend

## Manual Deployment (If Script Fails)

If the script doesn't work, deploy manually:

```bash
cd ~/Capstone_Interface

# Pull latest code
git pull origin main

# Update dependencies
cd server
npm install --production
cd ..

# Restart services
pm2 restart all
pm2 save

# Verify
pm2 status
pm2 logs --lines 20
```

## Verification Checklist

After deployment, verify:

- [ ] PM2 shows all services running
- [ ] Health endpoint responds: `curl http://localhost:5050/api/health`
- [ ] CORS headers are present in OPTIONS requests
- [ ] No errors in PM2 logs
- [ ] Frontend can make API calls without "Failed to fetch" errors

## Troubleshooting

### If git pull fails:
```bash
# Check git status
git status

# If there are conflicts, stash changes
git stash
git pull origin main
git stash pop
```

### If PM2 restart fails:
```bash
# Check what's running
pm2 list

# Stop all services
pm2 stop all

# Start with config
cd server
pm2 start ecosystem.config.cjs
# or
pm2 start ecosystem.config.js

# Save
pm2 save
```

### If backend doesn't start:
```bash
# Check logs
pm2 logs --lines 100

# Check for port conflicts
sudo netstat -tlnp | grep 5050

# Check .env file
cd server
cat .env
```

## Next Steps

After successful deployment:

1. ✅ Backend is updated with CORS fixes
2. ✅ Frontend changes will deploy via Netlify (automatic)
3. ✅ Test the application in production
4. ✅ Monitor for any CORS errors in browser console

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs --lines 100`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables in `server/.env`
4. Test API directly: `curl http://localhost:5050/api/health`

