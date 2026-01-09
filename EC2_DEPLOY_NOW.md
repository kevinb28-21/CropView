# 🚀 Deploy to EC2 - Quick Instructions

## ⚡ Fastest Method: EC2 Instance Connect

Since SSH isn't working, use **EC2 Instance Connect** (works from browser, no setup needed):

### Step 1: Open AWS Console
1. Go to: https://console.aws.amazon.com/ec2/
2. Click **EC2** → **Instances**
3. Find your instance (search for `ec2-18-117-90-212` or look for "CropView")

### Step 2: Connect
1. Select your instance
2. Click **"Connect"** button (top right)
3. Choose **"EC2 Instance Connect"** tab
4. Click **"Connect"** (opens browser terminal)

### Step 3: Run Deployment
Copy and paste this **entire command** into the terminal:

```bash
cd ~/Capstone_Interface && git pull origin main && cd server && npm install --production && cd .. && pm2 restart all && pm2 save && pm2 status && echo "✅ Deployment complete!"
```

**OR** run the deployment script:

```bash
cd ~/Capstone_Interface
git pull origin main
chmod +x deploy/update-backend-cors-remote.sh
bash deploy/update-backend-cors-remote.sh
```

### Step 4: Verify
After deployment completes, verify:

```bash
# Check services
pm2 status

# Check logs
pm2 logs --lines 20

# Test API
curl http://localhost:5050/api/health
```

---

## 📋 What Gets Deployed

✅ **CORS Fixes**: Backend now allows all `*.netlify.app` domains automatically
✅ **Latest Code**: All changes from GitHub
✅ **Dependencies**: Updated Node.js packages
✅ **Services**: PM2 restarted with new configuration

---

## 🔧 Alternative: One-Line Command

If you prefer a single command, use this:

```bash
cd ~/Capstone_Interface && git pull origin main && cd server && npm install --production && cd .. && pm2 restart all && pm2 save && pm2 logs --lines 10 --nostream
```

---

## ✅ Verification Checklist

After deployment, check:

- [ ] `pm2 status` shows all services running (green)
- [ ] `curl http://localhost:5050/api/health` returns JSON
- [ ] No errors in `pm2 logs`
- [ ] CORS configuration includes Netlify support

---

## 🆘 Troubleshooting

### If git pull fails:
```bash
git fetch origin main
git reset --hard origin/main
```

### If PM2 restart fails:
```bash
pm2 delete all
cd server
pm2 start ecosystem.config.cjs
pm2 save
```

### If backend doesn't respond:
```bash
pm2 logs --lines 100
# Check for errors
```

---

**Ready?** Open EC2 Instance Connect and run the deployment command! 🚀

