# 🚀 Deploy to EC2 - Complete Guide

## ⚠️ SSH Connection Issue
SSH is currently not working (connection timeout). Use **EC2 Instance Connect** instead - it works from your browser with no setup needed!

---

## ✅ Method 1: EC2 Instance Connect (Recommended - Works Now!)

### Step 1: Open AWS Console
1. Go to: **https://console.aws.amazon.com/ec2/**
2. Click **EC2** → **Instances** (left sidebar)
3. Find your instance:
   - Search for: `ec2-18-117-90-212` or `18.117.90.212`
   - Or look for instance name: "CropView"

### Step 2: Connect via Instance Connect
1. **Select** your EC2 instance (click the checkbox)
2. Click **"Connect"** button (top right)
3. Choose **"EC2 Instance Connect"** tab
4. Click **"Connect"** button
5. A browser terminal will open! 🎉

### Step 3: Run Deployment
Copy and paste this **entire command** into the terminal:

```bash
cd ~/Capstone_Interface && git pull origin main && cd server && npm install --production && cd .. && pm2 restart all && pm2 save && pm2 status && echo "✅ Deployment complete!"
```

**OR** use the automated script:

```bash
cd ~/Capstone_Interface
git pull origin main
chmod +x deploy/auto-deploy-via-git.sh
bash deploy/auto-deploy-via-git.sh
```

### Step 4: Verify
After deployment, verify everything works:

```bash
# Check services
pm2 status

# View logs
pm2 logs --lines 30

# Test API
curl http://localhost:5050/api/health
```

---

## 📋 What Gets Deployed

✅ **CORS Fixes**: Backend automatically allows all `*.netlify.app` domains
✅ **Latest Code**: All changes from GitHub (including CORS fixes)
✅ **Dependencies**: Updated Node.js packages
✅ **Services**: PM2 restarted with new configuration

---

## 🔧 Alternative: One-Line Quick Deploy

If you want the fastest deployment, use this single command:

```bash
cd ~/Capstone_Interface && git pull origin main && cd server && npm install --production && cd .. && pm2 restart all && pm2 save && pm2 logs --lines 10 --nostream
```

---

## ✅ Verification Checklist

After deployment, check:

- [ ] `pm2 status` shows all services running (green status)
- [ ] `curl http://localhost:5050/api/health` returns JSON with `"status": "ok"`
- [ ] No errors in `pm2 logs --lines 50`
- CORS configuration includes Netlify support

To verify CORS:

```bash
grep -n "netlify" server/src/server-enhanced.js server/src/server.js
```

Should show lines with `netlifyPattern` or `netlify.app`

---

## 🆘 Troubleshooting

### If `git pull` fails:
```bash
# Fetch and reset
git fetch origin main
git reset --hard origin/main

# Or check git status
git status
```

### If PM2 restart fails:
```bash
# Check what's running
pm2 list

# Stop all and restart
pm2 delete all
cd server
pm2 start ecosystem.config.cjs  # or ecosystem.config.js
pm2 save
```

### If backend doesn't respond:
```bash
# Check logs for errors
pm2 logs --lines 100

# Check if port is in use
sudo netstat -tlnp | grep 5050

# Check .env file
cd server
cat .env
```

### If Instance Connect doesn't work:
1. Make sure instance is **"Running"** (green circle)
2. Try refreshing the AWS Console page
3. Try a different browser
4. Check if you have permissions to connect

---

## 📝 Deployment Scripts Available

All scripts are now on GitHub and can be run on EC2:

1. **`deploy/auto-deploy-via-git.sh`** - Full automated deployment
2. **`deploy/update-backend-cors-remote.sh`** - CORS-specific update
3. **`deploy/quick-deploy.sh`** - Quick deployment script

To use any script:
```bash
cd ~/Capstone_Interface
git pull origin main  # Get latest scripts
chmod +x deploy/[script-name].sh
bash deploy/[script-name].sh
```

---

## 🎯 Expected Results

After successful deployment:

✅ Backend accepts requests from all Netlify domains (`*.netlify.app`)
✅ No more "Failed to fetch" errors in frontend
✅ CORS headers are properly set in responses
✅ API endpoints respond correctly
✅ PM2 services are running and healthy

---

## 📞 Next Steps

1. ✅ **Deploy backend** (follow Method 1 above)
2. ⏳ **Netlify auto-deploys** frontend (already pushed to GitHub)
3. ✅ **Test the application** in production
4. ✅ **Monitor logs** for any issues

---

## 🔗 Related Documentation

- Detailed deployment: `deploy/DEPLOY_CORS_FIX.md`
- CORS fix details: `docs/deployment/FIX_FETCH_ERROR.md`
- Troubleshooting: `docs/deployment/NETLIFY_TROUBLESHOOTING.md`

---

**Ready to deploy?** Open EC2 Instance Connect and run the deployment command! 🚀

The deployment should take 1-2 minutes. All changes are already on GitHub, so `git pull` will get everything!

