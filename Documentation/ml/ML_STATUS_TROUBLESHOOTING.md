# ML Status Troubleshooting Guide

## Overview

This guide explains how the ML status system works and how to troubleshoot common issues.

## How `/api/ml/status` Works

The `/api/ml/status` endpoint checks for model availability by:

1. **Reading environment variables** (from worker perspective):
   - `USE_MULTI_CROP_MODEL` - Whether to use multi-crop model (default: `true`)
   - `MULTI_CROP_MODEL_PATH` - Explicit path to multi-crop model file
   - `MULTI_CROP_MODEL_DIR` - Directory to search for multi-crop models (default: `./models/multi_crop`)
   - `ONION_MODEL_PATH` - Fallback single-crop model path
   - `MODEL_CHANNELS` - Number of channels (3 for RGB, 4 for multispectral)

2. **Checking file system**:
   - If `MULTI_CROP_MODEL_PATH` is set, checks if that file exists
   - Otherwise, searches `MULTI_CROP_MODEL_DIR` for `*_final.h5` files
   - If multi-crop not found, checks for single-crop model at `ONION_MODEL_PATH`
   - Extracts model version from metadata JSON if available

3. **Returns status**:
   ```json
   {
     "model_available": true/false,
     "model_type": "multi_crop" | "single_crop" | "none",
     "model_path": "/path/to/model.h5",
     "model_version": "model_version_string",
     "channels": 3,
     "worker_config": { ... }
   }
   ```

## How `/api/ml/recent` Works

The `/api/ml/recent` endpoint queries the database for recent ML predictions:

1. **Queries `analyses` table**:
   - Filters for rows with `confidence IS NOT NULL` and `health_status IS NOT NULL`
   - Only includes completed images (`processing_status = 'completed'`)
   - Orders by `processed_at DESC`
   - Limits results (default: 10)

2. **Backward compatibility**:
   - Checks which columns exist before querying
   - Safely handles missing columns: `crop_type`, `crop_confidence`, `heuristic_fusion_score`, `band_schema`, `gndvi_mean`
   - Returns `available_fields` object indicating what's present

3. **Returns predictions**:
   ```json
   {
     "predictions": [
       {
         "image_id": "...",
         "filename": "...",
         "processed_at": "2024-01-01T12:00:00Z",
         "health_status": "healthy",
         "confidence": 0.95,
         "crop_type": "onion",
         "crop_confidence": 0.92,
         ...
       }
     ],
     "count": 10,
     "available_fields": {
       "crop_type": true,
       "heuristic_fusion_score": false,
       ...
     }
   }
   ```

## Common Issues

### Issue: Model Status Shows "Not Available"

**Check 1: Model file exists**
```bash
# On EC2, check if model file exists
ls -la ~/Capstone_Interface/python_processing/models/multi_crop/*_final.h5
# OR
ls -la ~/Capstone_Interface/python_processing/models/onion_crop_health_model.h5
```

**Check 2: Environment variables**
```bash
# On EC2, check worker environment
cd ~/Capstone_Interface/python_processing
cat .env | grep -E "USE_MULTI_CROP_MODEL|MULTI_CROP_MODEL|MODEL_CHANNELS"
```

**Check 3: Worker is running**
```bash
# Check if background worker is running
ps aux | grep background_worker.py
# OR if using systemd
systemctl status background-worker
# OR if using PM2
pm2 list
```

**Solution**: 
- Train a model using `train_multi_crop_model_v2.py`
- Set environment variables in `python_processing/.env`
- Restart the background worker

### Issue: No Recent Predictions

**Check 1: Are images being processed?**
```bash
# Check worker logs
tail -f ~/Capstone_Interface/python_processing/background_worker.log
```

**Check 2: Database has predictions?**
```sql
-- Connect to database
psql -U drone_user -d drone_analytics

-- Check for predictions
SELECT COUNT(*) FROM analyses WHERE confidence IS NOT NULL;

-- Check recent predictions
SELECT image_id, health_status, confidence, processed_at 
FROM analyses 
WHERE confidence IS NOT NULL 
ORDER BY processed_at DESC 
LIMIT 10;
```

**Check 3: Model is loaded in worker?**
- Check worker startup logs for "✓ Model loaded successfully"
- If not, check model file path and permissions

**Solution**:
- Ensure model is available (see above)
- Upload images via the web interface
- Verify worker processes them (check logs)
- Wait for processing to complete

### Issue: Predictions Missing Fields (crop_type, etc.)

**Check: Database schema**
```sql
-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'analyses' 
  AND column_name IN ('crop_type', 'crop_confidence', 'heuristic_fusion_score');
```

**Solution**:
- Run migrations if columns are missing:
  ```bash
  psql -U drone_user -d drone_analytics -f server/database/migration_add_crop_type.sql
  psql -U drone_user -d drone_analytics -f server/database/migration_add_ml_fields.sql
  ```
- Restart worker after migrations

### Issue: Frontend Shows Old/Incorrect Status

**Check 1: Browser cache**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

**Check 2: Backend endpoint**
```bash
# Test endpoint directly
curl http://localhost:5050/api/ml/status
curl http://localhost:5050/api/ml/recent?limit=5
```

**Check 3: Netlify deployment**
- Verify latest frontend code is deployed
- Check Netlify build logs for errors

## Verification Steps

### 1. Verify Model Status Endpoint
```bash
curl http://your-ec2-host:5050/api/ml/status
```

Expected response if model exists:
```json
{
  "model_available": true,
  "model_type": "multi_crop",
  "model_path": "/path/to/model.h5",
  "model_version": "...",
  "channels": 3
}
```

### 2. Verify Recent Predictions Endpoint
```bash
curl http://your-ec2-host:5050/api/ml/recent?limit=5
```

Expected response if predictions exist:
```json
{
  "predictions": [...],
  "count": 5,
  "available_fields": {...}
}
```

### 3. Verify Worker Configuration
```bash
# On EC2
cd ~/Capstone_Interface/python_processing
cat .env | grep MODEL
```

Should show:
```
USE_MULTI_CROP_MODEL=true
MULTI_CROP_MODEL_DIR=./models/multi_crop
MODEL_CHANNELS=3
```

### 4. Verify Model File
```bash
# On EC2
ls -lh ~/Capstone_Interface/python_processing/models/multi_crop/*_final.h5
```

Should show model file(s) with reasonable size (typically 10-100MB).

## Training a Model

If no model is available, train one:

```bash
cd ~/Capstone_Interface/python_processing

# Prepare training data (organize images by crop type and health status)
# Then train:
python train_multi_crop_model_v2.py \
  --data-dir ./training_data \
  --output-dir ./models/multi_crop \
  --epochs 50

# Model will be saved to ./models/multi_crop/
# Set environment variables and restart worker
```

## Quick Checklist

- [ ] Model file exists in `./models/multi_crop/` or configured path
- [ ] Environment variables set in `python_processing/.env`
- [ ] Background worker is running
- [ ] Worker logs show "✓ Model loaded successfully"
- [ ] Database has `analyses` table with ML columns
- [ ] Images are being processed (check worker logs)
- [ ] `/api/ml/status` returns `model_available: true`
- [ ] `/api/ml/recent` returns predictions
- [ ] Frontend displays correct status

## Additional Resources

- Training script: `python_processing/train_multi_crop_model_v2.py`
- Worker script: `python_processing/background_worker.py`
- Database migrations: `server/database/migration_*.sql`
- Model directory: `python_processing/models/multi_crop/`
