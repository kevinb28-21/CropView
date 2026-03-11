#!/usr/bin/env python3
"""
Upload images + optional GPS metadata after mission completion.

Supports:
- Node backend (recommended for current dashboard): POST /api/images (default port 5050)
- Flask processing API (legacy/docs): POST /api/upload (default port 5001)

Examples:
  # Upload to Node backend (current app)
  python3 upload_images.py --api node --server http://192.168.1.100:5050 --directory /home/pi/drone_images

  # Upload to Flask API (legacy)
  python3 upload_images.py --api flask --server http://192.168.1.100:5001 --directory /home/pi/drone_images
"""

import requests
import argparse
import json
from pathlib import Path
from time import sleep
import mimetypes

def _normalize_gps(gps_obj: dict) -> dict:
    """
    Normalize GPS metadata keys to the format expected by the Node backend DB layer.

    Node `saveImage()` expects at minimum:
      - latitude
      - longitude

    It also accepts optional:
      - altitude
      - bearing / heading
      - speed
      - accuracy
      - timestamp (ms)
    """
    if not isinstance(gps_obj, dict):
        return {}

    # Already normalized
    if "latitude" in gps_obj and "longitude" in gps_obj:
        return gps_obj

    out = {}
    # Common variants from existing scripts: lat/lng
    if "lat" in gps_obj and "lng" in gps_obj:
        out["latitude"] = gps_obj.get("lat")
        out["longitude"] = gps_obj.get("lng")
    elif "lat" in gps_obj and "lon" in gps_obj:
        out["latitude"] = gps_obj.get("lat")
        out["longitude"] = gps_obj.get("lon")

    # Optional fields
    if "altitude" in gps_obj:
        out["altitude"] = gps_obj.get("altitude")
    if "bearing" in gps_obj:
        out["bearing"] = gps_obj.get("bearing")
    if "heading" in gps_obj and "bearing" not in out:
        out["bearing"] = gps_obj.get("heading")
    if "ground_speed" in gps_obj and "speed" not in out:
        out["speed"] = gps_obj.get("ground_speed")
    if "speed" in gps_obj:
        out["speed"] = gps_obj.get("speed")
    if "accuracy" in gps_obj:
        out["accuracy"] = gps_obj.get("accuracy")
    if "timestamp" in gps_obj:
        out["timestamp"] = gps_obj.get("timestamp")

    # Only return if we have minimum viable coordinates
    if out.get("latitude") is None or out.get("longitude") is None:
        return {}
    return out


def upload_images(server_url, image_dir, delete_after_upload=False, api_type="node"):
    """
    Upload images and metadata to server.
    
    Args:
        server_url: Base URL of API (e.g., http://192.168.1.100:5050)
        image_dir: Directory containing images
        delete_after_upload: Whether to delete images after successful upload
        api_type: 'node' (POST /api/images) or 'flask' (POST /api/upload)
    """
    image_dir = Path(image_dir)
    api_type = (api_type or "node").lower().strip()
    if api_type not in ("node", "flask"):
        raise ValueError(f"Unsupported --api value: {api_type}. Use 'node' or 'flask'.")

    endpoint = "/api/images" if api_type == "node" else "/api/upload"
    upload_url = f"{server_url.rstrip('/')}{endpoint}"
    
    # Support common mission outputs (MAPIR may produce JPG + other formats depending on settings)
    exts = [".jpg", ".jpeg", ".png", ".tif", ".tiff"]
    image_files = []
    for ext in exts:
        image_files.extend(image_dir.glob(f"*{ext}"))
    image_files = sorted(image_files)
    total = len(image_files)
    
    print(f"Found {total} images to upload")
    print(f"Server: {server_url}")
    print(f"API: {api_type} ({endpoint})")
    
    uploaded = 0
    failed = 0
    
    for idx, img_file in enumerate(image_files, 1):
        metadata_file = img_file.with_suffix('.json')
        
        try:
            # Read image
            with open(img_file, 'rb') as f:
                mime_type, _ = mimetypes.guess_type(str(img_file))
                mime_type = mime_type or "application/octet-stream"
                files = {'image': (img_file.name, f, mime_type)}
                
                # Read GPS metadata if available
                data = {}
                if metadata_file.exists():
                    with open(metadata_file, 'r') as m:
                        gps_data = json.load(m)
                        # Support both formats:
                        # - { gps: { lat/lng/... } } from capture_gps_triggered.py
                        # - already-normalized gps dict
                        gps_obj = gps_data.get("gps", gps_data) if isinstance(gps_data, dict) else {}
                        gps_obj = _normalize_gps(gps_obj)
                        if gps_obj:
                            data['gps'] = json.dumps(gps_obj)
                
                # Upload
                response = requests.post(upload_url, files=files, data=data, timeout=30)
                
                if response.status_code in (200, 201, 202):
                    result = response.json()
                    uploaded += 1
                    # Node response shape differs from Flask; try to show something meaningful
                    analysis = result.get('analysis') if isinstance(result, dict) else None
                    ndvi = None
                    if isinstance(analysis, dict):
                        ndvi = (analysis.get('ndvi') or {}).get('mean') if isinstance(analysis.get('ndvi'), dict) else analysis.get('ndvi')
                    print(f"[{idx}/{total}] ✓ {img_file.name} (status: {response.status_code}, id: {result.get('id', 'n/a')}, NDVI: {ndvi if ndvi is not None else 'n/a'})")
                    
                    # Delete if requested
                    if delete_after_upload:
                        img_file.unlink()
                        if metadata_file.exists():
                            metadata_file.unlink()
                else:
                    failed += 1
                    print(f"[{idx}/{total}] ✗ {img_file.name}: {response.status_code}")
        
        except Exception as e:
            failed += 1
            print(f"[{idx}/{total}] ✗ {img_file.name}: {e}")
        
        # Small delay to avoid overwhelming server
        sleep(0.5)
    
    print(f"\nUpload complete: {uploaded} succeeded, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload images to Flask server")
    parser.add_argument("--api", type=str, default="node", choices=["node", "flask"],
                       help="API type: node (/api/images) or flask (/api/upload). Default: node")
    parser.add_argument("--server", type=str, default="http://localhost:5050",
                       help="Server base URL (default: http://localhost:5050)")
    parser.add_argument("--directory", type=str, default="/home/pi/drone_images",
                       help="Image directory (default: /home/pi/drone_images)")
    parser.add_argument("--delete", action="store_true",
                       help="Delete images after successful upload")
    
    args = parser.parse_args()
    
    upload_images(args.server, args.directory, args.delete, api_type=args.api)

