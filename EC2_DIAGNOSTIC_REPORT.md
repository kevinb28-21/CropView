# EC2 Diagnostic Report

**Date:** 2025-03-11  
**Instance ID:** `i-0ce6adb51ca9c5a4d` (CropView)  
**EC2 host:** `ec2-3-144-192-19.us-east-2.compute.amazonaws.com`  
**Key:** `MS04_ID.pem` (e.g. in project directory or `~/Downloads/MS04_ID.pem`)  
**User:** `ubuntu`

**SSH command:**
```bash
chmod 400 "MS04_ID.pem"
ssh -i "MS04_ID.pem" ubuntu@ec2-3-144-192-19.us-east-2.compute.amazonaws.com
```

---

## Action Required

| Item | Status | Action |
|------|--------|--------|
| **SSH connection** | OK | Connected to `ec2-3-144-192-19.us-east-2.compute.amazonaws.com` with `MS04_ID.pem`. |
| **Flask API** | **NOT RUNNING** | **flask-api** (flask_api_db.py) is not in PM2. Nothing listening on port 5001. `curl http://localhost:5001/api/status` fails. Start with: `cd ~/Capstone_Interface/python_processing && pm2 start ecosystem.config.cjs` (or ensure flask-api is in your PM2 config and start it). |
| **Background worker** | **NOT RUNNING** | **background-worker** (background_worker.py) is not in PM2. Image processing will not run. Add and start the worker (e.g. via your ecosystem or `pm2 start background_worker.py --name background-worker --interpreter python` from python_processing). |
| **MulterError (upload)** | **BROKEN** | Backend logs show `MulterError: Unexpected field` on uploads (2026-02-07). Frontend may be sending a different field name than the server expects (e.g. `image` vs `file`). Align multer field name with frontend form. |
| **Database schema** | OK | All required columns present on `analyses`. Row counts: **images** 9, **analyses** 2. |
| **Disk** | OK | Root 71% used (2.0G avail). Uploads 140K; models dir has only `onion_class_names.json` (4K). No orphan upload files (all 4 upload files are referenced in `images`). |
| **Nginx** | OK | Config valid, nginx active. Proxy to port 5050 for `/api` is correct. |
| **Environment** | OK | `.env` exists in server/ and python_processing/; PORT, DB_HOST, AWS_ACCESS_KEY_ID, S3_BUCKET_NAME set. Node v20.19.5 (18+). |
| **Network** | Partial | Node: `http://localhost:5050/api/health` returns OK. Flask: `http://localhost:5001/api/status` — **no response** (service not running). |

---

## 1. Process health

**Status:** Run via SSH. **Issues:** Only **drone-backend** is running; **flask-api** and **background-worker** are not in PM2.

**pm2 list (actual):**

| id | name           | mode | pid    | uptime | ↺ | status  | cpu | mem     |
|----|----------------|------|--------|--------|---|---------|-----|---------|
| 0  | drone-backend  | fork | 562758 | 12D    | 0 | online  | 0%  | 56.9mb  |

**Required but missing:** `flask-api`, `background-worker`.

**drone-backend logs (last 50 lines, excerpt):**
- Recent: Database connected, GNDVI columns detected, S3 enabled, listening on 5050.
- Errors in log history: `ECONNREFUSED 127.0.0.1:5432` (earlier DB connection failures); `GNDVI columns not found` (resolved after migration); **MulterError: Unexpected field** (2026-02-07) on upload — field name mismatch.

**Commands to run on EC2 (for stopped/errored):**

```bash
pm2 list
```

For any process with status **stopped** or **errored**, run:

```bash
pm2 logs <name> --lines 50
```

**Required processes:**

| PM2 name | Description | Script |
|----------|-------------|--------|
| drone-backend | Node server | server.js (port 5050) |
| flask-api | Flask API | flask_api_db.py via gunicorn (port 5001) |
| background-worker | Background worker | background_worker.py |

---

## 2. Database schema verification

**Status:** Run via SSH. **Result:** All required columns present. Row counts: **images** 9, **analyses** 2.

**analyses table columns (confirmed):**  
id, image_id, ndvi, ndvi_mean, ndvi_std, ndvi_min, ndvi_max, savi, savi_mean, savi_std, savi_min, savi_max, health_score, health_status, summary, analysis_type, model_version, confidence, processed_image_path, processed_s3_url, processed_at, created_at, updated_at, inference_time_ms, band_schema, health_topk, crop_topk, heuristic_fusion_score, fallback_reason, crop_type, crop_confidence, gndvi, **gndvi_mean**, **gndvi_std**, **gndvi_min**, **gndvi_max**.

**Row counts:**
- `SELECT COUNT(*) FROM images;` → **9**
- `SELECT COUNT(*) FROM analyses;` → **2**

**Commands to run on EC2 (if re-checking):**

```bash
# Connect to PostgreSQL (drone_analytics) and describe analyses table
sudo -u postgres psql -d drone_analytics -c "\d analyses"
```

**Required columns on `analyses`:**  
`gndvi_mean`, `gndvi_std`, `gndvi_min`, `gndvi_max`, `crop_type`, `crop_confidence`, `model_version`, `band_schema`.

**If any are missing**, run (from project root on EC2):

- GNDVI columns:  
  `psql -U postgres -d drone_analytics -f ~/Capstone_Interface/python_processing/database_migration_add_gndvi.sql`
- crop_type / crop_confidence:  
  `psql -U postgres -d drone_analytics -f ~/Capstone_Interface/server/database/migration_add_crop_type.sql`
- model_version / band_schema:  
  `psql -U postgres -d drone_analytics -f ~/Capstone_Interface/server/database/migration_add_ml_fields.sql`

**Row counts:**

```bash
sudo -u postgres psql -d drone_analytics -c "SELECT COUNT(*) FROM images;"
sudo -u postgres psql -d drone_analytics -c "SELECT COUNT(*) FROM analyses;"
```

---

## 3. Disk usage

**Status:** Run via SSH.

**df -h (root volume):**

| Filesystem | Size | Used | Avail | Use% | Mounted on |
|------------|------|------|-------|------|------------|
| /dev/root   | 6.8G | 4.8G | 2.0G  | 71%  | /          |

**Uploads:** `/home/ubuntu/Capstone_Interface/server/uploads` → **140K** total. Four files (all from Jan 2026): 1768587231005-k6P_wWoX.jpg, 1769194900964-4MIZj13w.jpg, 1769198488617-xm-t9ATQ.jpg, 1769199438066-FMHDKCCD.jpg.

**Models:** `/home/ubuntu/Capstone_Interface/python_processing/models/onion_class_names.json` → **4.0K**. No large model file reported in models dir.

**Orphan uploads (older than 7 days, not in images):** **None.** All four files in `server/uploads/` are referenced in the `images` table (by `file_path`).

**Commands to run on EC2 (if re-checking):**

```bash
df -h
```

```bash
# If uploads dir exists
du -sh /home/ubuntu/Capstone_Interface/server/uploads/*
```

```bash
du -sh /home/ubuntu/Capstone_Interface/python_processing/models/*
```

**Orphaned uploads (optional):** List files under `server/uploads/` older than 7 days that are not referenced in the `images` table (e.g. compare filenames/paths to `images` table and list those not found).

---

## 4. Nginx

**Status:** Run via SSH. **Result:** Config valid, nginx active, proxy to 5050 configured.

- `sudo nginx -t` → syntax ok, test successful.
- `sudo systemctl is-active nginx` → **active**.
- `/etc/nginx/sites-enabled/` → symlink to `drone-backend`. Config includes:
  - `location /api` → `proxy_pass http://localhost:5050;`
  - `location /flask` → `proxy_pass http://localhost:5001;`
  - `server_name` still set to old host (ec2-18-117-90-212...); consider updating to current hostname/IP for clarity.

**Commands to run on EC2 (if re-checking):**

```bash
sudo nginx -t
sudo systemctl status nginx
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/*
```

Confirm: config is valid, nginx is active, and proxy to **port 5050** is configured (e.g. `proxy_pass http://localhost:5050;`).

---

## 5. Environment

**Status:** Run via SSH. **Result:** .env present in both dirs; key vars set; Node 18+.

- **server/.env:** exists. PORT, DB_HOST, AWS_ACCESS_KEY_ID, S3_BUCKET_NAME set.
- **python_processing/.env:** exists.
- **Node:** `v20.19.5` (≥18).

**Commands to run on EC2 (if re-checking, do not print secret values):**

```bash
# Presence of .env
test -f /home/ubuntu/Capstone_Interface/server/.env && echo "server/.env: exists" || echo "server/.env: MISSING"
test -f /home/ubuntu/Capstone_Interface/python_processing/.env && echo "python_processing/.env: exists" || echo "python_processing/.env: MISSING"

# Confirm key vars are set (names only)
grep -E '^PORT=|^DB_HOST=|^AWS_ACCESS_KEY_ID=|^S3_BUCKET_NAME=' /home/ubuntu/Capstone_Interface/server/.env 2>/dev/null | sed 's/=.*/=***/' || true
grep -E '^PORT=|^DB_HOST=|^AWS_ACCESS_KEY_ID=|^S3_BUCKET_NAME=' /home/ubuntu/Capstone_Interface/python_processing/.env 2>/dev/null | sed 's/=.*/=***/' || true

# Node version (required 18+)
node --version
```

---

## 6. Network (local health endpoints)

**Status:** Run via SSH.

**Node backend (5050):**
```json
{"status":"ok","database":"connected","service":"nodejs-backend","gndviColumns":true}
```

**Flask API (5001):** No response (connection failed / HTTP_CODE:000). Service not running — consistent with flask-api not in PM2.

**Commands to run on EC2 (if re-checking):**

```bash
curl -s http://localhost:5050/api/health
curl -s http://localhost:5001/api/status
```

Report both responses in full.

---

## 7. One-shot script (run on EC2)

To run all checks in one go, copy this script onto the EC2 instance and execute it (e.g. via EC2 Instance Connect), then paste the output into this report or a follow-up file:

```bash
echo "=== PM2 LIST ==="
pm2 list
echo "=== PM2 LOGS (last 50 each) ==="
for name in drone-backend flask-api background-worker; do
  echo "--- $name ---"
  pm2 logs "$name" --lines 50 --nostream 2>/dev/null || true
done
echo "=== DB: ANALYSES TABLE ==="
sudo -u postgres psql -d drone_analytics -c "\d analyses"
echo "=== DB: ROW COUNTS ==="
sudo -u postgres psql -d drone_analytics -c "SELECT COUNT(*) FROM images;"
sudo -u postgres psql -d drone_analytics -c "SELECT COUNT(*) FROM analyses;"
echo "=== DISK ==="
df -h
[ -d /home/ubuntu/Capstone_Interface/server/uploads ] && du -sh /home/ubuntu/Capstone_Interface/server/uploads/* 2>/dev/null || echo "uploads dir empty or missing"
du -sh /home/ubuntu/Capstone_Interface/python_processing/models/* 2>/dev/null || echo "models dir empty or missing"
echo "=== NGINX ==="
sudo nginx -t
sudo systemctl is-active nginx
ls -la /etc/nginx/sites-enabled/
echo "=== ENV (presence) ==="
test -f /home/ubuntu/Capstone_Interface/server/.env && echo "server/.env exists" || echo "server/.env MISSING"
test -f /home/ubuntu/Capstone_Interface/python_processing/.env && echo "python_processing/.env exists" || echo "python_processing/.env MISSING"
node --version
echo "=== CURL HEALTH ==="
curl -s http://localhost:5050/api/health
echo ""
curl -s http://localhost:5001/api/status
echo ""
```

---

## Summary

- **SSH** to `ec2-3-144-192-19.us-east-2.compute.amazonaws.com` (i-0ce6adb51ca9c5a4d) with key `MS04_ID.pem` **succeeded**. Diagnostics were run on 2025-03-11.
- **Critical:** **flask-api** and **background-worker** are not running under PM2; start them for image processing and Flask endpoints.
- **Critical:** Uploads fail with **MulterError: Unexpected field** — fix multer field name to match frontend.
- Database schema, Nginx, env, and Node backend health are OK. No orphan upload files. Nginx `server_name` can be updated to current hostname.
