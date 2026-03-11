# Diagnostic Report — Capstone Interface

**Date:** 2025-03-11  
**Scope:** Backend diagnostic, immediate processing on upload, and cleanup of redundant files.

---

## Critical Fixes Applied (2025-03-11)

Two production-blocking issues from the EC2 diagnostic were fixed:

| Fix | File(s) changed | What was done |
|-----|-----------------|---------------|
| **FIX 1: MulterError — Unexpected field** | `server/src/server.js` | Multer was updated to accept both `image` and `file` via `upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }])`. The handler uses whichever field is present so it matches `UploadPanel.jsx` (which sends `formData.append('image', file)`) and avoids "Unexpected field" from clients that send `file`. Comment added: *Field name must match UploadPanel.jsx FormData.append key.* |
| **FIX 2: Flask API and background worker not in PM2** | `python_processing/ecosystem.config.cjs`, `deploy/ec2-setup.sh`, `restart-all.sh` | **ecosystem.config.cjs:** Added `background-worker` app entry (flask-api was already present). Both processes now start with a single `pm2 start ecosystem.config.cjs` from `python_processing/`. **ec2-setup.sh:** Step 16 now starts both server and python_processing ecosystems using `ecosystem.config.cjs` (with fallback to `.js`) and creates logs dirs. **restart-all.sh:** New script at project root to restart all PM2 processes: `cd ~/Capstone_Interface/server && pm2 start ecosystem.config.cjs --update-env`, then same for `python_processing`, then `pm2 save` and `pm2 list`. Use on EC2 after deploy or reboot. |

---

## TASK 1: Backend Diagnostic

### 1.1 Active server file (server.js vs server-enhanced.js)

| Source | Finding |
|--------|--------|
| **server/ecosystem.config.cjs** | `script: 'src/server.js'` — **server.js** is the active entry. |
| **server/package.json** | `"start": "node src/server.js"` — start script runs **server.js**. |
| **Conclusion** | **server.js** is the running server. **server-enhanced.js** is **UNUSED** (only used by `npm run dev:enhanced` / `start:enhanced`). |

**Flagged:** `server/src/server-enhanced.js` — unused; candidate for removal.

---

### 1.2 Routes: defined vs called by frontend

**Active server (server.js)** defines these API routes:

- `GET /api/health` — ✅ Used (Home.jsx)
- `GET/POST /api/images` — ✅ Used (multiple pages)
- `GET /api/images/:id` — ✅ Used (image detail)
- `POST /api/images/:id/process` — ✅ Used (Analytics.jsx, UploadPanel.jsx)
- `GET/POST /api/telemetry` — ✅ Used (Home, Drone, Map)
- `GET /api/ml/status` — ✅ Used (ModelTraining.jsx)
- `GET /api/ml/recent` — ✅ Used (ML.jsx)
- `GET /api/insights/:mission_id` — ✅ Used (Insights.jsx)

**Routes defined only in server-enhanced.js (route modules)** and therefore **not available** when running server.js:

- `DELETE /api/images/:id` — ❌ Not exposed (server.js has no delete route). Frontend does not call it.
- `GET /api/statistics` — ❌ Not exposed.
- `GET /api/statistics/health` — ❌ Not exposed.

**Conclusion:** All endpoints currently exposed by server.js are used. The routes in `server/src/routes/` (images.js, telemetry.js, statistics.js) are only mounted by server-enhanced.js, so **DELETE /api/images/:id**, **GET /api/statistics**, and **GET /api/statistics/health** are defined in code but never used in production with the current server.

---

### 1.3 python_processing/ — scripts not referenced

**Referenced in ecosystem / deploy / other Python:**

- **flask_api_db.py** — Run by python_processing/ecosystem.config.cjs (gunicorn).
- **background_worker.py** — Run by PM2/run-local.sh/stop-local.sh; imported by flask_api_db.
- **image_processor.py** — Imported by background_worker, process_sample_images, train_model, etc.
- **db_utils.py**, **s3_utils.py**, **multispectral_loader.py** — Imported by background_worker, flask_api_db, image_processor, etc.
- **train_multi_crop_model_v2.py** — Imported by evaluate_model.py.
- **datasets/** (label_mapping, parse_*, download_*) — Used by training/parsing scripts.

**Not in ecosystem.config.cjs, not imported by other Python, not run by deploy/ or root .sh:**

- **flask_api.py** — Legacy Flask API (no DB); superseded by **flask_api_db.py**. **Candidate for removal.**
- **upload_images.py** — Standalone; no references found. **Candidate for removal.**
- **create_minimal_model.py** — Standalone; no references. **Candidate for removal.**
- **test_single_image.py** — Standalone test script. **Flagged but kept** (testing).
- **process_sample_images.py** — Standalone; imports image_processor, db_utils. **Flagged but kept** (utility).
- **batch_test_ndvi.py** — Standalone. **Flagged but kept** (testing).
- **train_model.py**, **train_multi_crop_model.py** — Training; not in deploy. **Kept.**
- **evaluate_model.py** — Evaluation; **kept.**
- **prepare_tom2024_data.py** — Data prep; **kept.**

**Hardware scripts (kept per instructions):** mapir_survey3w_pwm.py, capture_interval.py, capture_gps_triggered.py, capture_mapir_survey3w_interval.py, sync_mapir_sdcard.py.

---

### 1.4 deploy/ — duplicate or obsolete scripts

- **ecosystem.config.js vs .cjs:** Many deploy scripts reference `ecosystem.config.js`; the repo uses **ecosystem.config.cjs** for the server. Scripts often try both (e.g. fix-502-bad-gateway.sh). No file reference is broken.
- **run-setup.sh, auto-setup.sh, setup-with-key.sh, setup-ec2.sh:** All transfer configs and run setup on EC2; **functional overlap** but not exact duplicates. **Flagged** for possible consolidation.
- **run-migration.sh** references `~/Capstone_Interface/python_processing/database_migration_add_gndvi.sql` — file exists.
- **run-migration-remote.sh** copies run-migration.sh and the GNDVI migration SQL — valid.
- **References to ec2-setup.sh:** Used from run-setup.sh, auto-setup.sh, transfer-to-ec2.sh, etc. — **ec2-setup.sh exists** in deploy/.
- No deploy script references a file that does not exist.

**Conclusion:** No script was removed for “references non-existent files.” Overlap between setup scripts is noted; no duplicate with identical function was deleted.

---

### 1.5 database/ — migrations vs current schema

- **server/database/schema.sql** — Base schema (no GNDVI, crop_type, or ML fields in analyses).
- **python_processing/database_migration_add_gndvi.sql** — Adds gndvi_*, idx_analyses_gndvi_mean.
- **server/database/migration_add_crop_type.sql** — Adds crop_type, crop_confidence.
- **server/database/migration_add_ml_fields.sql** — Adds model_version, inference_time_ms, band_schema, health_topk, crop_topk, heuristic_fusion_score, fallback_reason.

**Applied or not:** Without running the DB, we cannot confirm that these columns exist. The migrations use `ADD COLUMN IF NOT EXISTS`, so re-running is safe. **No migration file was deleted.** If the current DB already has these columns, the migrations are effectively no-ops.

---

### 1.6 python_processing/models/ — files and references

| File | Size | Referenced by |
|------|------|----------------|
| multi_crop/multi_crop_model_demo_final.h5 | 800 B | background_worker (glob `*_final.h5`), image_processor (multi_crop path) |
| multi_crop/multi_crop_model_*_metadata.json | 582 B / 545 B | background_worker (metadata), image_processor (model_dir) |
| onion_crop_best_model.h5 | 800 B | test_single_image.py, train_model.py (output) |
| onion_class_names.json | 111 B | image_processor (class names for single-crop) |

**Note:** Default single-crop path in code is `onion_crop_best_model.h5` (updated in Round 2). All are referenced by image_processor.py or background_worker.py or training/test scripts.

---

### 1.7 uploads/

- **uploads/** at project root and **server/uploads/** were checked. No test/sample images or processed outputs were found to list. If present later, any file not referenced in the `images` table would be a candidate for cleanup (to be listed manually or via a small script).

---

## TASK 2: Immediate Processing on Upload

### Implemented in server/src/server.js (active server)

1. **After** the image is saved with `processing_status = 'uploaded'`, a **non-blocking** `setImmediate` triggers:
   - `POST` to `http://localhost:5001/api/process` (or `FLASK_PROCESS_URL`) with body `{ "image_id": "<id>" }`.
2. **Native `fetch`** is used (no new dependency; Node 18+).
3. **try/catch:** On failure (network or Flask down), the code logs:  
   `[AutoProcess] Flask unavailable, background worker will handle image <id>`  
   and does **not** throw or affect the upload response.
4. **On success (`res.ok`):** The DB is updated to `processing_status = 'processing'` so the background worker does not double-process, and the log is:  
   `[AutoProcess] Triggered processing for image <id>`.

### python_processing/flask_api_db.py — POST /api/process

- **Confirmed:** `POST /api/process` accepts JSON with `image_id`, calls `get_image_by_id(image_id)` and `process_image(record)` from background_worker. The pipeline uses the DB record and runs the full processing (image_processor, etc.). No code changes were required here.

### Other

- **db_utils.py** — Fixed indentation in `get_pending_images` (return in `except` block).

---

## TASK 3: Clean Up Redundant Files

### Deleted (with reason)

| Item | Reason |
|------|--------|
| **server/src/server-enhanced.js** | Not the active server; ecosystem.config.cjs and package.json start script use server.js. |
| **python_processing/flask_api.py** | Superseded by flask_api_db.py (used by ecosystem and POST /api/process). |

### Not deleted (per instructions or uncertainty)

- **Documentation/**, **database/schema/**, **.env.example** / env templates — not deleted.
- **Hardware scripts** (mapir_survey3w_pwm.py, capture_*.py, sync_*.py) — kept even if unreferenced.
- **Deploy scripts** — no duplicate or broken-reference removal; overlap flagged.
- **Model files** — all referenced; none deleted.

---

## Flagged but kept

- **Deploy setup scripts** (run-setup.sh, auto-setup.sh, setup-with-key.sh, setup-ec2.sh) — Overlap in behavior; no consolidation done.
- **Migrations** — Whether GNDVI/crop_type/ML columns already exist was not verified against a live DB; migrations are idempotent and left as-is.

---

## Summary of changes

- **server.js:** After saving an image, added non-blocking trigger to Flask `POST /api/process` with `image_id`; on success set `processing_status = 'processing'` and log `[AutoProcess] Triggered processing for image <id>`; on failure log `[AutoProcess] Flask unavailable, background worker will handle image <id>` without affecting the upload response.
- **python_processing/db_utils.py:** Fixed indentation of `return []` in `get_pending_images` exception handler.

---

## Summary of deletions

| File | Reason |
|------|--------|
| server/src/server-enhanced.js | Unused; active server is server.js. |
| python_processing/flask_api.py | Replaced by flask_api_db.py. |

---

## Issues not fixed (manual attention)

1. **DELETE /api/images** — Not implemented in server.js. If the UI or API should support image deletion, add a route in server.js (or re-enable the enhanced server and its routes).
2. **GET /api/statistics** and **GET /api/statistics/health** — Not available under server.js; add to server.js or rely on enhanced server if needed.
3. **Deploy ecosystem.config.js vs .cjs** — Several scripts reference `.js`; production uses `.cjs`. Ensure PM2/startup use `ecosystem.config.cjs` where intended.
4. ~~**Single-crop model filename**~~ — **Fixed in Round 2:** Code and env template now use `onion_crop_best_model.h5`.

---

## Estimated disk space freed (Round 1)

- **server-enhanced.js:** ~6.5 KB  
- **flask_api.py:** ~6.5 KB  
- **Total (Round 1):** ~13 KB. Main benefit is reduced confusion and dead code rather than space.

---

## Round 2 Cleanup

### Code/config changes (no deletions)

- **python_processing/image_processor.py** — Replaced all references to `onion_crop_health_model.h5` with `onion_crop_best_model.h5` (docstring default and `ONION_MODEL_PATH` default).
- **python_processing/background_worker.py** — Same replacement (default path and checklist comment).
- **server/src/server.js** — Fallback path for `ONION_MODEL_PATH` changed from `onion_crop_health_model.h5` to `onion_crop_best_model.h5`.
- **deploy/env-templates/python.env.template** — `ONION_MODEL_PATH=./models/onion_crop_best_model.h5`.
- **python_processing/ecosystem.config.cjs** — No `ONION_MODEL_PATH` present; no change.

### Confirmation before deletion

- **server.js** does not import `server/src/routes/` or any of images.js, telemetry.js, statistics.js (grep found no matches). Safe to remove route modules.

### Deleted (Round 2)

| Item | Reason |
|------|--------|
| **server/src/routes/images.js** | Only mounted by deleted server-enhanced.js; server.js does not import it. |
| **server/src/routes/telemetry.js** | Same. |
| **server/src/routes/statistics.js** | Same. |
| **server/src/routes/** (directory) | Removed after deleting the three route files. |
| **python_processing/upload_images.py** | Unreferenced (not in ecosystem, not imported, not run by deploy/root). |
| **python_processing/create_minimal_model.py** | Unreferenced (not in ecosystem, not imported, not run by deploy/root). |

### Round 2 disk space freed

- **server/src/routes/images.js:** ~4.3 KB  
- **server/src/routes/telemetry.js:** ~1.6 KB  
- **server/src/routes/statistics.js:** ~0.9 KB  
- **python_processing/upload_images.py:** ~6.9 KB  
- **python_processing/create_minimal_model.py:** ~5.9 KB  
- **Round 2 total:** ~19.6 KB  
- **Cumulative (Round 1 + Round 2):** ~33 KB
