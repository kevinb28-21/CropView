# Python Image Processing Service

This directory contains the Python-based image processing pipeline for onion crop health monitoring.

> 📚 **For complete documentation, see [Documentation/ml/README.md](../Documentation/ml/README.md)**

## Components

- `image_processor.py`: Core image processing functions (NDVI, SAVI, GNDVI calculation, TensorFlow integration)
- `flask_api_db.py`: Flask REST API with database integration
- `background_worker.py`: Automated image processing worker
- `db_utils.py`: Database utilities
- `s3_utils.py`: S3 storage utilities
- `batch_test_ndvi.py`: Batch testing script for vegetation indices
- `train_model.py`: ML model training script
- `requirements.txt`: Python dependencies
- `mapir_survey3w_pwm.py`: MAPIR Survey3(W) PWM trigger controller (Pi-only)
- `capture_mapir_survey3w_interval.py`: MAPIR interval trigger + optional MAVLink GPS logging (Pi-only)
- `sync_mapir_sdcard.py`: Copy images from mounted SD (DCIM) into mission folder

## Setup

1. Install dependencies:
```bash
cd python_processing
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run the Flask server:
```bash
python3 flask_api_db.py
```

Or with gunicorn for production:
```bash
gunicorn -w 4 -b 0.0.0.0:5001 flask_api_db:app
```

## Testing Image Processing

Test the NDVI calculation directly:
```bash
python image_processor.py path/to/test_image.jpg
```

## API Endpoints

- `POST /api/upload`: Upload image (multipart/form-data)
  - Fields: `image` (file), `gps` (optional JSON string)
  - Returns: Image ID and analysis results

- `GET /api/data`: Get processed images
  - Query: `?image_id=<id>` for single, or omit for all
  - Returns: List of images with analysis data

- `GET /uploads/<filename>`: Serve uploaded images

## Integration with Node.js Backend

The Node.js backend can proxy to this Flask service:

```javascript
// In Node.js server
app.post('/api/images', upload.single('image'), async (req, res) => {
  // Forward to Flask
  const formData = new FormData();
  formData.append('image', req.file.buffer, req.file.originalname);
  const flaskRes = await fetch('http://localhost:5001/api/upload', {
    method: 'POST',
    body: formData
  });
  const data = await flaskRes.json();
  res.json(data);
});
```

## Next Steps

1. Add PostgreSQL integration for persistent storage
2. Add S3 integration for image storage
3. Load TensorFlow model when available
4. Add background job worker for automated processing
5. Integrate with Raspberry Pi upload script

## MAPIR Survey3W Notes

If you are using a **MAPIR Survey3W**, capture is typically done via **PWM trigger** (not `picamera2`).
See:
- `Documentation/ml/IMAGE_CAPTURE.md` (MAPIR section)
- `python_processing/mapir_survey3w_pwm.py`
- `python_processing/capture_mapir_survey3w_interval.py`

For multispectral variants (e.g., NGB = NIR+Green+Blue), set the schema on the processing machine:

```bash
export MAPIR_DATASET_NAME=mapir_survey3w_ngb   # or mapir_survey3w_rgb
```