# Capstone Interface

Web stack, API, and Python processing services for multispectral field imagery, vegetation indices, and crop-health scoring.

The system ingests camera images (including MAPIR Survey3W captures), stores them in PostgreSQL with optional S3 object storage, and runs NDVI/SAVI/GNDVI extraction plus optional TensorFlow-based classification. A React client provides upload, maps, analytics, and ML status views. The intended deployment splits a static Netlify frontend, an EC2-hosted Node API, and a Python worker/Flask layer on the same or a related host.

## Tech stack

- **Client:** React (Vite), deployed to Netlify (`netlify.toml`).
- **API:** Node.js (Express), PostgreSQL via `pg`, optional AWS S3 uploads.
- **Processing:** Python 3 (Flask API, `background_worker.py`, OpenCV/NumPy/TensorFlow as configured).
- **Edge:** Raspberry Pi scripts for PWM camera trigger, interval capture, and SD card sync.

## Architecture

The browser talks to the Node server for uploads, listings, insights, and telemetry. Node writes uploaded files to disk (and optionally S3) and records rows in Postgres. `background_worker.py` polls for `uploaded` images, calls the shared processing code, and updates analysis fields. Flask (`flask_api_db.py`) can process images on demand and is used for synchronous `/api/process` style calls that Node triggers after upload. Environment variables align paths, database credentials, and model locations across all three runtimes.

## Local development

From the repository root:

```bash
./run-local.sh
```

Stop services:

```bash
./stop-local.sh
```

Restart client, Node, Flask, and worker (when using the provided scripts):

```bash
./restart-all.sh
```

Typical manual flow:

```bash
# Terminal 1 — API (from server/)
cd server && npm install && npm run dev   # or: node src/server.js

# Terminal 2 — Flask (from python_processing/)
cd python_processing && pip install -r requirements.txt && python3 flask_api_db.py

# Terminal 3 — worker
cd python_processing && python3 background_worker.py

# Terminal 4 — client
cd client && npm install && npm run dev
```

Point the client at the API origin configured in `ORIGIN` / Vite proxy as appropriate for your machine.

## Environment variables

**`server/` (Node)** — set in `server/.env` or the process environment:

- `PORT`
- `NODE_ENV`
- `ORIGIN`
- `UPLOAD_DIR`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- `FLASK_PROCESS_URL`
- `USE_MULTI_CROP_MODEL`, `MULTI_CROP_MODEL_PATH`, `MULTI_CROP_MODEL_DIR`, `ONION_MODEL_PATH`, `MODEL_CHANNELS`

**`python_processing/`** — set in `python_processing/.env` or `EnvironmentFile` for systemd:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `UPLOAD_FOLDER`, `PROCESSED_FOLDER`
- `FLASK_PORT`, `FLASK_DEBUG`
- `WORKER_POLL_INTERVAL`, `WORKER_BATCH_SIZE`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- `USE_MULTI_CROP_MODEL`, `MULTI_CROP_MODEL_PATH`, `MULTI_CROP_MODEL_DIR`, `ONION_MODEL_PATH`
- `MAPIR_DATASET_NAME` (multispectral band layout / dataset id for loaders)

## Deployment

- **EC2:** Ubuntu-style layout with the repo under e.g. `/home/ubuntu/Capstone_Interface`. Install Node and Python dependencies, apply SQL migrations under `server/database/`, and configure `.env` files for `server/` and `python_processing/`.
- **PM2:** `server/ecosystem.config.js` defines the `drone-backend` app (`node src/server.js`). Start with `pm2 start ecosystem.config.js` (or `.cjs` if used on the instance), then `pm2 save` and `pm2 startup` for persistence.
- **Python worker:** `python_processing/background_worker.service` is a systemd unit example pointing at `background_worker.py` with `EnvironmentFile` for secrets.
- **Netlify:** Connect the `client/` directory as the publish root per `netlify.toml`; set build command and environment for the production API base URL.

## Hardware (MAPIR Survey3W on Raspberry Pi)

PWM control lives in `python_processing/mapir_survey3w_pwm.py`. Defaults use **BCM GPIO 18** (physical pin 12), **50 Hz** (20 ms period), with pulse widths **1000 µs** idle, **1500 µs** SD mount/unmount, **2000 µs** shutter trigger, and at least **~1.6 s** between triggers. After a flight, mount the camera SD (USB or reader) and run `sync_mapir_sdcard.py` to copy `DCIM` content into a mission folder, then upload via the web UI or `POST /api/images`.

## RAW processing

MAPIR RAW files are handled by `mapir_raw_converter.py` and integrated with `multispectral_loader.py` so RAW inputs can be unpacked/demosaiced to TIFF on ingest for index and model pipelines. Demosaicing favors robustness over maximum quality; see module docstrings for Bayer layout assumptions.

## Documentation

Additional API notes, schema, and deployment detail live under `Documentation/` (for example `Documentation/api/`, `Documentation/database/`, `Documentation/deployment/`).

## License / academic use

This repository is submitted as a capstone academic project. Reuse and redistribution are subject to your institution’s policies and any third-party licenses of bundled dependencies (TensorFlow, AWS SDKs, etc.).
