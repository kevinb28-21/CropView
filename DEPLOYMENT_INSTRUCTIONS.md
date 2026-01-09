# 🚀 Backend Deployment Instructions

## Status
✅ **Changes committed and pushed to GitHub**
- CORS fixes for Netlify domains
- HTTPS redirects in netlify.toml
- Improved API error handling

## Quick Deploy to EC2

### Option 1: EC2 Instance Connect (Recommended - No SSH Keys Needed)

1. **Open AWS Console**
   - Go to: https://console.aws.amazon.com/ec2/
   - Navigate to **EC2 → Instances**
   - Find instance: `ec2-18-117-90-212` (or search for "CropView")

2. **Connect via Instance Connect**
   - Select the instance
   - Click **"Connect"** button
   - Choose **"EC2 Instance Connect"** tab
   - Click **"Connect"** (opens browser terminal)

3. **Run Deployment Commands**
   ```bash
   cd ~/Capstone_Interface
   git pull origin main
   chmod +x deploy/update-backend-cors-remote.sh
   bash deploy/update-backend-cors-remote.sh
   ```

4. **Verify Deployment**
   ```bash
   pm2 status
   pm2 logs --lines 20
   curl http://localhost:5050/api/health
   ```

### Option 2: Manual Deployment (If Script Fails)

If the automated script doesn't work, run these commands manually:

```bash
cd ~/Capstone_Interface

# Pull latest code
git pull origin main

# Update Node.js dependencies
cd server
npm install --production
cd ..

# Restart PM2 services
pm2 restart all
pm2 save

# Verify
pm2 status
pm2 logs --lines 50
```

## What Gets Deployed

### Backend Changes:
- ✅ `server/src/server-enhanced.js` - CORS now allows all Netlify domains
- ✅ `server/src/server.js` - CORS now allows all Netlify domains
- ✅ Automatic Netlify domain detection (no manual configuration needed)

### Frontend Changes:
- ✅ `netlify.toml` - HTTPS redirects (already pushed, will deploy via Netlify)
- ✅ `client/src/utils/api.js` - Improved error handling

## Verification Steps

After deployment, verify everything works:

1. **Check PM2 Status**
   ```bash
   pm2 status
   ```
   Should show all services running (green)

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:5050/api/health
   ```
   Should return JSON with status: "ok"

3. **Test CORS (from EC2)**
   ```bash
   curl -H "Origin: https://your-site.netlify.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:5050/api/health
   ```
   Should return CORS headers

4. **Test from External**
   ```bash
   curl http://ec2-18-117-90-212.us-east-2.compute.amazonaws.com/api/health
   ```
   Should return JSON response

5. **Check Logs**
   ```bash
   pm2 logs --lines 50
   ```
   Should not show CORS errors

## Expected Results

After successful deployment:

✅ Backend accepts requests from all `*.netlify.app` domains
✅ No more "Failed to fetch" errors in frontend
✅ CORS headers are properly set
✅ API endpoints respond correctly

## Troubleshooting

### If git pull fails:
```bash
git status
git stash  # Save local changes
git pull origin main
```

### If PM2 restart fails:
```bash
pm2 delete all
cd server
pm2 start ecosystem.config.cjs  # or ecosystem.config.js
pm2 save
```

### If backend doesn't respond:
```bash
# Check if port is in use
sudo netstat -tlnp | grep 5050

# Check .env file
cd server
cat .env

# Check logs
pm2 logs --lines 100
```

## Next Steps

1. ✅ Deploy backend (follow instructions above)
2. ⏳ Netlify will auto-deploy frontend changes (already pushed)
3. ✅ Test the application
4. ✅ Monitor for any errors

## Support Files

- Detailed deployment guide: `deploy/DEPLOY_CORS_FIX.md`
- CORS fix documentation: `docs/deployment/FIX_FETCH_ERROR.md`
- Troubleshooting: `docs/deployment/NETLIFY_TROUBLESHOOTING.md`

---

**Ready to deploy?** Follow Option 1 above using EC2 Instance Connect! 🚀

