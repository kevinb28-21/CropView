# Capstone Interface — Drone Crop Health Dashboard: Complete Project Context

*Use this document to onboard Claude or any other AI: copy everything below this line in one go.*

---

## 1. Project Intent & Purpose

**Capstone Interface** is an academic capstone project that builds a **full-stack web application for monitoring onion crop health using drone-captured multispectral imagery**. The platform automates the end-to-end pipeline: a Raspberry Pi mounted on a drone captures images (using either a standard Pi Camera or a MAPIR Survey3W multispectral camera), uploads them to a web server, processes them with vegetation indices (NDVI, SAVI, GNDVI) and TensorFlow-based machine learning models, stores results in PostgreSQL, and displays crop health analytics on a React dashboard with interactive Leaflet maps.

The crop focus is **Onion (Allium cepa)** with 8 health classification categories: Very Healthy, Healthy, Moderate, Poor, Very Poor, Diseased, Stressed, and Weeds. The system is designed to expand to multi-crop support (cherry tomato, corn) via a band-aware multi-output ML model.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
│              (Vite + React-Leaflet Dashboard)                │
│              Deployed on Netlify                            │
└───────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST API (proxied)
                         │
┌───────────────────────▼─────────────────────────────────────┐
│                   Node.js Backend                           │
│              (Express.js API Server, port 5050)              │
│              Deployed on EC2 with Nginx + PM2                │
└───────────────┬───────────────────────┬─────────────────────┘
                │                       │
┌───────────────▼──────────┐  ┌────────▼──────────────────────┐
│    Python Background     │  │    PostgreSQL Database        │
│    Worker + Flask API    │  │    (drone_analytics)          │
│    (Image Processing)    │  │                                │
└───────────────┬──────────┘  └───────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│                    AWS S3 Storage                             │
│              (Image & Processed File Storage)                 │
└──────────────────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│              Raspberry Pi 4 (on drone)                        │
│    MAPIR Survey3W (PWM) / PiCamera2 + Pixhawk GPS            │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
Capstone_Interface/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx                  # React Router setup
│   │   ├── main.jsx                 # Entry point
│   │   ├── utils/api.js             # API client (get, post, upload)
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Dashboard metrics, recent activity
│   │   │   ├── Map.jsx              # Drone telemetry map, geofence
│   │   │   ├── Analytics.jsx        # Image upload, gallery, analysis
│   │   │   ├── ML.jsx               # ML predictions, model status
│   │   │   └── Drone.jsx            # Drone telemetry view
│   │   ├── components/
│   │   │   ├── chrome/Header.jsx     # Navigation bar
│   │   │   ├── DashboardMap.jsx      # Leaflet map with markers/route/geofence
│   │   │   ├── MapControls.jsx      # Map interaction controls
│   │   │   ├── UploadPanel.jsx      # Drag-and-drop image upload
│   │   │   ├── ProcessingStatus.jsx # Image processing status display
│   │   │   ├── VegetationIndexMaps.jsx  # NDVI/SAVI/GNDVI visualizations
│   │   │   ├── MLExplanation.jsx     # ML model explanation
│   │   │   └── ModelTraining.jsx     # ML model status display
│   │   └── styles/                  # Design tokens, typography, animations
│   ├── vite.config.js               # Dev server port 5182, proxy to :5050
│   ├── netlify.toml                 # Netlify build + API proxy to EC2
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── server.js                # Main Express app, all routes
│   │   ├── server-enhanced.js       # Enhanced version with extra middleware
│   │   ├── routes/
│   │   │   ├── images.js            # Image CRUD routes
│   │   │   ├── telemetry.js         # Drone telemetry routes
│   │   │   └── statistics.js       # Statistics routes
│   │   ├── middleware/
│   │   │   ├── logger.js            # Request logging
│   │   │   ├── errorHandler.js     # Error handling
│   │   │   └── validator.js        # Request validation
│   │   ├── db-utils.js              # PostgreSQL connection pool + helpers
│   │   └── s3-utils.js              # S3 upload, presigned URLs
│   ├── database/                    # Schema SQL files
│   ├── uploads/                     # Local upload directory
│   ├── ecosystem.config.cjs         # PM2 config
│   └── package.json
│
├── python_processing/               # Python image processing & ML
│   ├── image_processor.py           # NDVI/SAVI/GNDVI calculation + TensorFlow inference
│   ├── multispectral_loader.py      # Load & standardize multispectral images (tifffile/rasterio/OpenCV)
│   ├── background_worker.py         # Polls DB for 'uploaded' images, runs analysis pipeline
│   ├── flask_api_db.py              # Flask API with DB integration
│   ├── db_utils.py                  # PostgreSQL helpers (psycopg2)
│   ├── s3_utils.py                  # S3 upload/download (boto3)
│   ├── upload_images.py             # Upload mission images to Node or Flask API
│   ├── mapir_survey3w_pwm.py        # MAPIR Survey3W PWM camera trigger (RPi.GPIO)
│   ├── capture_mapir_survey3w_interval.py  # Interval capture + GPS logging
│   ├── sync_mapir_sdcard.py         # Copy images from MAPIR SD card
│   ├── capture_interval.py          # PiCamera2 interval capture
│   ├── capture_gps_triggered.py     # GPS waypoint-triggered capture (DroneKit)
│   ├── train_model.py               # Single-crop (onion) model training
│   ├── train_multi_crop_model.py    # Multi-crop model v1
│   ├── train_multi_crop_model_v2.py # Multi-crop band-aware model v2
│   ├── evaluate_model.py            # Model evaluation
│   ├── batch_test_ndvi.py           # Batch NDVI testing
│   ├── process_sample_images.py     # Sample image processing
│   ├── training_config.yaml         # ML training hyperparameters
│   ├── datasets/
│   │   ├── dataset_registry.yaml    # Band order & schema definitions per dataset
│   │   ├── label_mapping.py         # Dataset labels → unified health classes
│   │   ├── parse_plantvillage.py    # PlantVillage dataset parser
│   │   ├── parse_tom2024.py         # TOM2024 dataset parser
│   │   ├── download_plantvillage.py # PlantVillage downloader
│   │   └── download_tom2024.py      # TOM2024 downloader
│   ├── models/                      # Saved model weights
│   │   └── multi_crop/              # Multi-crop model directory
│   ├── requirements.txt             # Python dependencies
│   └── ecosystem.config.cjs         # PM2 config for Flask + worker
│
├── deploy/                          # EC2 deployment scripts & configs
│   ├── ec2-setup.sh                 # Main EC2 setup (Node, Python, PostgreSQL, Nginx, PM2)
│   ├── auto-setup.sh                # Automated EC2 setup via SCP
│   ├── nginx.conf                   # Nginx reverse proxy config
│   ├── nginx-https.conf             # HTTPS Nginx config
│   ├── fix-502-bad-gateway.sh       # 502 troubleshooting
│   ├── fix-ec2-processing.sh        # Processing fixes
│   ├── run-migration.sh             # DB migration runner
│   ├── deploy-via-git.sh            # Git-based deployment
│   ├── env-templates/               # .env templates for server and python
│   └── *.md                         # Deployment guides
│
├── Documentation/                   # Comprehensive docs
│   ├── getting-started/             # Quick start, project overview
│   ├── development/                 # Local setup, testing
│   ├── api/                         # Node.js and Flask API docs
│   ├── database/                    # Schema (SCHEMA.md), migrations
│   ├── deployment/                  # EC2, Netlify, S3, CORS guides
│   ├── architecture/                # System design, S3 integration
│   ├── ml/                          # ML pipeline, training, datasets, image capture
│   ├── backend/                     # Backend integration notes
│   └── misc/                        # Security, UI, multispectral fixes
│
├── run-local.sh                     # Start all services locally
├── stop-local.sh                    # Stop local services
├── README.md                        # Project overview
└── .gitignore
```

---

## 4. Technology Stack

### Frontend
- **React 18** with **Vite 5** (dev server port 5182)
- **React Router DOM** for client-side routing
- **React-Leaflet** / **Leaflet** for interactive maps
- **Tailwind CSS 4** with PostCSS and Autoprefixer
- Deployed on **Netlify** with API proxy to EC2

### Backend (Node.js)
- **Express.js 4** on port 5050
- **Multer** for multipart file uploads
- **pg** (node-postgres) for PostgreSQL connection pooling
- **AWS SDK (S3)** for image storage and presigned URLs
- **CORS**, **dotenv**, **nanoid**, **uuid**
- **Nodemon** for dev, **PM2** for production
- Deployed on **AWS EC2** behind **Nginx** reverse proxy

### Python Processing
- **Flask 3** REST API
- **TensorFlow 2.15** for ML inference and training
- **OpenCV** (cv2) for image processing
- **NumPy**, **Pillow** for array/image operations
- **scikit-learn** for ML utilities
- **psycopg2-binary** for PostgreSQL
- **boto3** for S3
- **rasterio**, **tifffile** for multispectral TIFF loading
- **PyYAML** for config
- **watchdog** for file watching
- **RPi.GPIO** (Raspberry Pi only) for hardware PWM
- **DroneKit** / **pymavlink** for Pixhawk flight controller GPS

### Database
- **PostgreSQL** (database name: `drone_analytics`)

### Storage
- **AWS S3** for image and processed file storage
- Keys structured as `images/YYYY/MM/DD/filename.ext`

### Infrastructure
- **Nginx** reverse proxy on EC2
- **PM2** process manager for Node and Python services
- **Netlify** for frontend hosting with redirects proxy

---

## 5. Database Schema (PostgreSQL: drone_analytics)

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **missions** | Flight sessions | id (UUID), name, start_time, end_time, status |
| **images** | Image metadata & file info | id (UUID), mission_id, filename, s3_url, s3_key, s3_stored, file_path, processing_status, captured_at, uploaded_at |
| **image_gps** | GPS per image (1:1) | image_id, latitude, longitude, altitude, accuracy, heading, ground_speed |
| **analyses** | Crop health analysis results (1:1 with image) | image_id, ndvi/ndvi_mean/ndvi_std/ndvi_min/ndvi_max, savi/savi_mean/savi_std/savi_min/savi_max, gndvi_mean/gndvi_std/gndvi_min/gndvi_max, health_score (0-100), health_status, analysis_type, model_version, confidence, crop_type, band_schema |
| **stress_zones** | Grid-based stress data (1:many with analysis) | analysis_id, grid_x, grid_y, severity (0-1), ndvi_value, savi_value |
| **telemetry** | Current drone state | latitude, longitude, altitude, heading, ground_speed, battery_level, status |
| **route_points** | Flight path history | latitude, longitude, altitude, sequence, timestamp |
| **geofences** | Geofence definitions | name, description, is_active |
| **geofence_points** | Geofence boundary polygons (1:many) | geofence_id, latitude, longitude, sequence |

### Relationships
```
missions
  └── images (mission_id)
        ├── image_gps (image_id) [1:1]
        └── analyses (image_id) [1:1]
              └── stress_zones (analysis_id) [1:many]

geofences
  └── geofence_points (geofence_id) [1:many]

telemetry [standalone - current drone state]
route_points [standalone - historical flight path]
```

### Processing Status Flow
`uploaded` → `processing` → `completed` (or `failed`)

---

## 6. API Endpoints

### Node.js Backend (port 5050)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check with DB status and GNDVI column availability |
| POST | `/api/images` | Upload image (multipart `image` field), optional GPS; saves to DB + S3 |
| GET | `/api/images` | List images with pagination (page, offset, limit) and filters (status, hasAnalysis, minHealthScore) |
| GET | `/api/images/:id` | Single image with analysis |
| GET | `/api/telemetry` | Current drone position, route, geofence |
| POST | `/api/telemetry` | Update drone position/route/geofence |
| GET | `/api/ml/status` | ML model status (multi/single crop, paths, version) |
| GET | `/api/ml/recent` | Recent ML predictions from DB |
| GET | `/uploads/*` | Static file serving for local uploads |

### Python Flask API (port 5001, legacy)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Alternative upload endpoint |
| POST | `/api/process` | Trigger processing |
| GET | `/api/status` | Processing status |

---

## 7. Image Processing Pipeline

### Data Flow
1. **Capture**: Raspberry Pi captures image (PiCamera2 or MAPIR Survey3W via PWM trigger)
2. **Upload**: `upload_images.py` sends to Node `POST /api/images` with GPS sidecar data
3. **Storage**: Server saves to local `uploads/` dir + optional S3, inserts DB record with `processing_status = 'uploaded'`
4. **Background Worker**: `background_worker.py` polls DB every 10s for `uploaded` images
5. **Processing**: For each image:
   - Load via `multispectral_loader.py` (handles RGB, TIFF, band reordering)
   - Calculate **NDVI**: `(NIR - Red) / (NIR + Red)` — requires NIR band
   - Calculate **SAVI**: `((NIR - Red) / (NIR + Red + L)) * (1 + L)` — soil-adjusted, requires NIR
   - Calculate **GNDVI**: `(NIR - Green) / (NIR + Green)` — works with NGB cameras (no Red needed)
   - Optional **TensorFlow inference** for health classification
   - Generate stress zone grid
6. **Storage**: Results written to `analyses` and `stress_zones` tables, status set to `completed`
7. **Display**: React frontend fetches results via `/api/images` and renders on dashboard

### Vegetation Indices
- **NDVI** (Normalized Difference Vegetation Index): Standard vegetation health. Range -1 to 1. Requires Red + NIR bands.
- **SAVI** (Soil-Adjusted Vegetation Index): Better for sparse vegetation / visible soil. Requires Red + NIR bands.
- **GNDVI** (Green Normalized Difference Vegetation Index): Uses Green instead of Red. Works with NGB cameras that lack a Red band.

---

## 8. Machine Learning Pipeline

### Models
1. **Single-crop (legacy)**: Onion-only classifier, 8 health classes
2. **Multi-crop (current)**: Band-aware multi-output model supporting cherry tomato, onion, corn

### Multi-Crop Model Architecture (v2)
- **Input**: 224×224 images, 3 channels (RGB) or 4 channels (RGB+NIR)
- **Base**: EfficientNetB0 with transfer learning
- **Additional inputs**: Band mask (which bands are present), index features (12 vegetation index stats)
- **Outputs**: Health class (8 categories) + crop type
- **Loss weights**: health_class: 1.0, crop_type: 0.5

### Training Config
- Batch size: 32, Epochs: 50, LR: 0.001
- Validation split: 0.2, Test split: 0.1
- Data augmentation: rotation, shifts, flips, zoom, brightness
- Early stopping: patience 10, monitoring val_health_class_accuracy
- LR reduction: factor 0.5, patience 5
- Random seed: 42 for reproducibility

### Health Classification Categories
`very_healthy`, `healthy`, `moderate`, `poor`, `very_poor`, `diseased`, `stressed`, `weeds`

### Training Datasets

| Dataset | Bands | Domain | Notes |
|---------|-------|--------|-------|
| PlantVillage | RGB (3ch) | Leaf close-ups | Domain mismatch with UAV |
| TOM2024 | RGB (3ch) | Mixed | Domain mismatch with UAV |
| Cherry Tomato Dryad | R,G,B,NIR (4ch, B zero-filled) | UAV | Original order: G,R,NIR |
| WeedsGalore | R,G,B,NIR (4ch, RE dropped) | UAV | Original: R,G,B,RE,NIR |
| MAPIR Survey3W RGB | RGB (3ch) | UAV | Standard visible |
| MAPIR Survey3W NGB | R,G,B,NIR (4ch, R zero-filled) | UAV | Source: NIR,G,B |

### Band Standardization
All datasets are standardized to a canonical 4-channel order: **[R, G, B, NIR]** (indices 0,1,2,3). Missing bands are zero-filled with a band mask tracking which bands are real vs. filled. Red-Edge (RE) bands are dropped for cost-effective CPU inference.

---

## 9. Hardware Integration

### Raspberry Pi 4
- Runs on the drone as the onboard computer
- Default image output: `/home/pi/drone_images`
- Runs capture scripts and optionally the upload pipeline

### MAPIR Survey3W Camera
- Multispectral camera with two variants:
  - **RGB**: Standard visible light (3 channels)
  - **NGB**: NIR + Green + Blue (3 channels, no Red)
- Controlled via **hardware PWM** on GPIO BCM18 (physical pin 12)
- PWM signals:
  - **1000µs**: Idle
  - **1500µs**: Mount/unmount SD card
  - **2000µs**: Trigger photo capture
- Images stored on camera's internal SD card, synced via `sync_mapir_sdcard.py`

### Pixhawk Flight Controller
- Connected via MAVLink serial (`/dev/ttyUSB0` or `/dev/serial0`, 57600 baud)
- Provides GPS data: latitude, longitude, altitude, bearing, speed
- Used by `capture_gps_triggered.py` for waypoint-triggered capture
- Optional GPS logging during interval capture via `capture_mapir_survey3w_interval.py`

### Capture Workflow
1. `mapir_survey3w_pwm.py` sends PWM pulses to trigger MAPIR camera
2. `capture_mapir_survey3w_interval.py` triggers at fixed intervals, logs GPS to JSONL sidecar files
3. `sync_mapir_sdcard.py` copies images from mounted SD card (`/media/pi/*/DCIM`) to mission folder
4. `upload_images.py` uploads images + GPS metadata to the server

---

## 10. Frontend Pages & Components

### Routes
| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Dashboard with metrics, recent activity |
| `/map` | Map | Interactive Leaflet map with drone telemetry, route polyline, geofence polygon |
| `/analytics` | Analytics | Image upload (drag-and-drop), gallery, per-image analysis results |
| `/ml` | ML Insights | ML predictions display, model status |
| `/drone` | Drone | Drone telemetry view |

### Key Components
- **Header**: Navigation across all pages
- **DashboardMap**: Leaflet map with markers, route lines, geofence polygons
- **UploadPanel**: Drag-and-drop image upload via `api.upload('/api/images', formData)`
- **ProcessingStatus**: Real-time image processing status
- **VegetationIndexMaps**: NDVI/SAVI/GNDVI visualization
- **ModelTraining**: ML model status display via `/api/ml/status`

### API Client (client/src/utils/api.js)
- `api.get(endpoint)` — GET with credentials
- `api.post(endpoint, data)` — POST JSON
- `api.upload(endpoint, formData)` — POST multipart
- Base URL: `http://localhost:5050` in dev, relative in production (Netlify proxy)

---

## 11. Deployment Architecture

### Frontend (Netlify)
- Build: `npm install && npm run build` from `client/`
- Publish: `dist/`
- Node 20
- Redirects proxy `/api/*` and `/uploads/*` to EC2

### Backend (AWS EC2)
- EC2 instance: `ec2-3-144-192-19.us-east-2.compute.amazonaws.com:5050`
- **Nginx** reverse proxy in front of Node.js
- **PM2** manages Node server (`drone-backend`), Flask API, and background worker
- PostgreSQL runs on the same EC2 instance

### Local Development
- `run-local.sh`: Starts PostgreSQL, Node backend, Python worker, React frontend
- `stop-local.sh`: Stops all services
- Vite proxy routes `/api` and `/uploads` to `localhost:5050`

### Environment Variables

**Server (.env)**:
- `PORT=5050`, `ORIGIN` (CORS origins)
- `UPLOAD_DIR`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- `USE_MULTI_CROP_MODEL`, `MULTI_CROP_MODEL_PATH`, `MODEL_CHANNELS`

**Python (.env)**:
- `FLASK_PORT=5001`, DB credentials, S3 credentials, worker polling interval

---

## 12. Authentication & Security
- **No authentication** currently implemented (no JWT, sessions, or login)
- CORS restricts origins to known Netlify domains and localhost
- S3 uses presigned URLs for private object access
- No user-level access control

---

## 13. Current Development Status
- Core image processing (NDVI, SAVI, GNDVI) — complete
- PostgreSQL database integration — complete
- S3 storage integration — complete
- Background worker pipeline — complete
- React frontend dashboard — complete
- ML model training pipeline — complete
- MAPIR Survey3W hardware integration — complete
- GPS/MAVLink integration — complete
- ML model integration into production — in progress
- Production deployment optimization — in progress
- No CI/CD pipeline (deployment is manual via scripts or git pull)

---

## 14. Key Design Decisions
1. **Decoupled processing**: Background worker polls DB rather than synchronous processing, so the upload API returns immediately
2. **Band-aware ML**: Multi-crop model accepts variable input channels (3 or 4) with band masks, so it works with both RGB-only and multispectral imagery
3. **Canonical band order**: All datasets standardized to [R, G, B, NIR] regardless of source format, with zero-filling for missing bands
4. **Dual storage**: Local filesystem as fallback, S3 as primary — controlled by env vars
5. **PWM camera control**: Hardware PWM for precise MAPIR trigger timing rather than software GPIO
6. **GPS sidecar files**: GPS metadata stored as JSONL alongside images for reliable correlation during upload
7. **Schema evolution**: Database supports optional GNDVI columns, crop_type, band_schema fields added via migrations

---

*End of project context document.*
