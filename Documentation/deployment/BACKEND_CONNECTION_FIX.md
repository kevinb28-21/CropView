# Backend Connection Fix - Deployment Guide

## Problem Summary

The deployed Netlify frontend was unable to connect to the EC2 backend due to:
1. **Server listening on localhost only** - Backend wasn't accepting external connections
2. **Mixed content errors** - HTTPS frontend trying to call HTTP backend directly
3. **EC2 URL mismatch** - Old EC2 URL in some configurations
4. **Insufficient error diagnostics** - Hard to debug connection issues

## What Was Fixed

### 1. Server Configuration (`server/src/server.js`)
- **Changed**: Server now listens on `0.0.0.0` instead of `localhost`
- **Impact**: Backend can now accept connections from external sources (EC2, Netlify proxy)

```javascript
// Before: app.listen(PORT, async () => {
// After:
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} (accessible from external connections)`);
```

### 2. Frontend API Configuration (`client/src/utils/api.js`)
- **Changed**: Production mode now defaults to relative paths (uses Netlify proxy)
- **Impact**: Avoids mixed content errors (HTTPS frontend → HTTP backend via proxy)
- **Behavior**:
  - Development: Uses `http://localhost:5050`
  - Production: Uses relative paths (empty string) to leverage Netlify proxy
  - If `VITE_API_URL` is set to HTTPS, uses it directly
  - If `VITE_API_URL` is set to HTTP, warns and falls back to relative paths

### 3. Netlify Proxy Configuration (`netlify.toml`)
- **Updated**: EC2 URL to correct instance: `ec2-3-144-192-19.us-east-2.compute.amazonaws.com:5050`
- **Added**: Explicit port `:5050` in redirect URLs
- **Impact**: Netlify proxy correctly routes `/api/*` and `/uploads/*` to backend

### 4. Enhanced Error Handling
- **Added**: Detailed error logging with diagnostics
- **Added**: Better error messages for production vs development
- **Impact**: Easier debugging when connection issues occur

### 5. Health Check Indicator
- **Added**: Backend status indicator on Home page
- **Added**: Health check API call on page load
- **Impact**: Visual feedback on backend connectivity

## Deployment Steps

### Step 1: Update Backend on EC2

1. **SSH into your EC2 instance**:
   ```bash
   ssh -i "MS04_ID.pem" ubuntu@ec2-3-144-192-19.us-east-2.compute.amazonaws.com
   ```

2. **Navigate to server directory**:
   ```bash
   cd ~/Capstone_Interface/server
   ```

3. **Pull latest changes** (or manually update `src/server.js`):
   ```bash
   git pull origin main
   # OR manually edit server.js to change app.listen line
   ```

4. **Verify the server listens on 0.0.0.0**:
   ```bash
   grep "app.listen" src/server.js
   # Should show: app.listen(PORT, '0.0.0.0', async () => {
   ```

5. **Restart the backend server**:
   ```bash
   # If using PM2:
   pm2 restart server
   # OR if using systemd:
   sudo systemctl restart your-backend-service
   # OR if running directly:
   # Stop current process (Ctrl+C) and restart:
   npm start
   ```

6. **Verify server is listening on 0.0.0.0**:
   ```bash
   netstat -tlnp | grep 5050
   # Should show: 0.0.0.0:5050 (not 127.0.0.1:5050)
   ```

### Step 2: Verify Backend is Accessible

From your local machine, test the backend:

```bash
# Test health endpoint
curl http://ec2-3-144-192-19.us-east-2.compute.amazonaws.com:5050/api/health

# Should return:
# {"status":"ok","database":"connected",...}
```

If this fails, check:
- EC2 security group allows inbound traffic on port 5050
- Backend server is running
- Server is listening on 0.0.0.0 (not localhost)

### Step 3: Update Netlify Configuration

1. **Verify `netlify.toml`** has correct EC2 URL:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "http://ec2-3-144-192-19.us-east-2.compute.amazonaws.com:5050/api/:splat"
     status = 200
     force = true
   ```

2. **Commit and push** the updated `netlify.toml`:
   ```bash
   git add netlify.toml
   git commit -m "Fix Netlify proxy configuration"
   git push origin main
   ```

3. **Netlify will auto-deploy** (if connected to Git), or manually trigger a deploy

### Step 4: Configure Netlify Environment Variables

**IMPORTANT**: Do NOT set `VITE_API_URL` in Netlify environment variables unless you have HTTPS on your backend.

- **Option A (Recommended)**: Leave `VITE_API_URL` unset
  - Frontend will use relative paths (`/api/...`)
  - Netlify proxy handles HTTPS → HTTP conversion
  - No mixed content errors

- **Option B**: Set `VITE_API_URL` to HTTPS (only if you have SSL on EC2)
  - Requires Nginx reverse proxy with Let's Encrypt certificate
  - More complex setup, but direct connection

**To check/update Netlify env vars**:
1. Go to Netlify dashboard → Your site → Site settings → Environment variables
2. If `VITE_API_URL` exists and is HTTP, **remove it** or change to HTTPS
3. If it doesn't exist, **leave it unset** (this is correct)

### Step 5: Verify CORS Configuration on Backend

On EC2, check your backend `.env` file:

```bash
cd ~/Capstone_Interface/server
cat .env | grep ORIGIN
```

The `ORIGIN` variable should include your Netlify domain (or be empty to allow all Netlify domains):

```bash
ORIGIN=https://your-app-name.netlify.app,http://localhost:5173
```

**OR** leave it empty/unset - the server will automatically allow all `*.netlify.app` domains.

### Step 6: Test the Connection

1. **Deploy frontend** to Netlify (should happen automatically via Git)

2. **Open your Netlify site** in a browser

3. **Open browser DevTools** (F12) → Console tab

4. **Check for errors**:
   - Should see: `✓ Backend health check passed`
   - Should NOT see: `Cannot connect to backend server`

5. **Check Network tab**:
   - Requests to `/api/health`, `/api/images` should return 200 OK
   - If you see CORS errors, check backend CORS configuration

6. **Verify Home page** shows "✓ Backend Online" badge

## Troubleshooting

### Issue: "Cannot connect to backend server"

**Check 1**: Backend is listening on 0.0.0.0
```bash
# On EC2:
netstat -tlnp | grep 5050
# Should show: 0.0.0.0:5050
```

**Check 2**: Security group allows port 5050
- AWS Console → EC2 → Security Groups
- Inbound rules should allow TCP port 5050 from 0.0.0.0/0 (or Netlify IPs)

**Check 3**: Backend server is running
```bash
# On EC2:
ps aux | grep node
# OR
pm2 list
```

**Check 4**: Netlify proxy is working
- Check Netlify deploy logs for redirect configuration
- Test: `curl https://your-app.netlify.app/api/health`
- Should proxy to backend and return JSON

### Issue: CORS errors in browser console

**Check 1**: Backend CORS allows Netlify origin
- Backend automatically allows `*.netlify.app` domains
- If using custom domain, add it to `ORIGIN` env var

**Check 2**: Backend is receiving requests
```bash
# On EC2, check backend logs:
pm2 logs server
# OR
tail -f /path/to/server.log
```

### Issue: Mixed content errors

**Solution**: Ensure `VITE_API_URL` is NOT set to HTTP in Netlify
- Remove `VITE_API_URL` from Netlify env vars (use Netlify proxy instead)
- OR set it to HTTPS (requires SSL on EC2)

### Issue: 502 Bad Gateway from Netlify proxy

**Check 1**: Backend is accessible from internet
```bash
curl http://ec2-3-144-192-19.us-east-2.compute.amazonaws.com:5050/api/health
```

**Check 2**: Backend is listening on 0.0.0.0 (not localhost)

**Check 3**: EC2 security group allows port 5050

## Verification Checklist

- [ ] Backend server listens on `0.0.0.0:5050` (not `localhost:5050`)
- [ ] Backend is accessible via `curl http://ec2-3-144-192-19...:5050/api/health`
- [ ] `netlify.toml` has correct EC2 URL with port `:5050`
- [ ] `VITE_API_URL` is NOT set in Netlify (or set to HTTPS)
- [ ] Frontend deployed to Netlify
- [ ] Browser console shows "✓ Backend health check passed"
- [ ] Home page shows "✓ Backend Online" badge
- [ ] `/api/images` endpoint returns data
- [ ] No CORS errors in browser console
- [ ] No mixed content errors

## Summary

The fix ensures:
1. ✅ Backend accepts external connections (listens on 0.0.0.0)
2. ✅ Frontend uses Netlify proxy to avoid mixed content (relative paths)
3. ✅ CORS allows Netlify origins automatically
4. ✅ Better error messages for debugging
5. ✅ Visual health check indicator

**Key Takeaway**: The frontend should use **relative paths** in production (no `VITE_API_URL` set), allowing Netlify's proxy to handle the HTTPS → HTTP conversion seamlessly.
