"""
Flask API Server for Image Processing (Database Version)
Receives images from Raspberry Pi and saves to database with 'uploaded' status.
Background worker processes them automatically.
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from pathlib import Path
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from s3_utils import upload_to_s3, generate_s3_key
from db_utils import test_connection
import json
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
PROCESSED_FOLDER = os.getenv('PROCESSED_FOLDER', './processed')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tiff', 'tif'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'drone_analytics'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    db_status = 'connected' if test_connection() else 'disconnected'
    return jsonify({
        'status': 'ok',
        'service': 'flask-image-processor',
        'database': db_status
    })


@app.route('/api/upload', methods=['POST'])
def upload_image():
    """
    Upload endpoint for images from Raspberry Pi.
    Saves image to database with status 'uploaded'.
    Background worker will process it automatically.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    conn = None
    try:
        # Save uploaded file locally
        filename = secure_filename(file.filename)
        timestamp = datetime.now()
        unique_filename = f"{int(timestamp.timestamp() * 1000)}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(filepath)
        
        # Get GPS metadata if provided
        gps_data = None
        if 'gps' in request.form:
            try:
                gps_data = json.loads(request.form['gps'])
            except:
                pass
        
        # Upload to S3 (or use local path if S3 disabled)
        s3_key = generate_s3_key(unique_filename)
        content_type = 'image/jpeg'
        if filename.lower().endswith('.png'):
            content_type = 'image/png'
        elif filename.lower().endswith('.tiff') or filename.lower().endswith('.tif'):
            content_type = 'image/tiff'
        
        image_url = upload_to_s3(filepath, s3_key, content_type=content_type)
        
        # Use S3 URL if available, otherwise local path
        if image_url:
            image_path = image_url
            s3_stored = True
        else:
            image_path = filepath
            s3_stored = False
        
        # Save to database with status 'uploaded'
        conn = get_db_connection()
        image_id = str(uuid.uuid4())
        
        with conn.cursor() as cur:
            # Insert image record
            cur.execute("""
                INSERT INTO images (
                    id, filename, original_name, file_path, s3_url, s3_key, s3_stored,
                    file_size, mime_type, captured_at, uploaded_at, processing_status
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, 'uploaded'
                )
                RETURNING id, uploaded_at
            """, (
                image_id,
                unique_filename,
                filename,
                image_path if not s3_stored else None,
                image_url,
                s3_key if s3_stored else None,
                s3_stored,
                os.path.getsize(filepath),
                content_type,
                datetime.fromisoformat(gps_data['timestamp'] / 1000) if gps_data and 'timestamp' in gps_data else timestamp,
                timestamp
            ))
            
            result = cur.fetchone()
            
            # Insert GPS data if provided
            if gps_data and gps_data.get('latitude') and gps_data.get('longitude'):
                cur.execute("""
                    INSERT INTO image_gps (
                        image_id, latitude, longitude, altitude, accuracy,
                        heading, ground_speed, speed, captured_at
                    ) VALUES (
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s
                    )
                """, (
                    image_id,
                    gps_data.get('latitude'),
                    gps_data.get('longitude'),
                    gps_data.get('altitude'),
                    gps_data.get('accuracy'),
                    gps_data.get('bearing'),
                    gps_data.get('speed'),
                    gps_data.get('speed'),
                    datetime.fromtimestamp(gps_data['timestamp'] / 1000) if 'timestamp' in gps_data else timestamp
                ))
            
            conn.commit()
        
        return jsonify({
            'id': image_id,
            'filename': unique_filename,
            'path': image_path,
            's3_url': image_url,
            's3_stored': s3_stored,
            'processing_status': 'uploaded',
            'message': 'Image uploaded successfully. Processing will begin shortly.',
            'gps': gps_data
        })
        
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Retrieve processed image data and analyses.
    Query params: ?image_id=<id> for single image, or omit for all
    """
    image_id = request.args.get('image_id')
    conn = None
    
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if image_id:
                # Get single image
                cur.execute("""
                    SELECT i.*, 
                           g.latitude, g.longitude, g.altitude,
                           a.ndvi_mean, a.savi_mean, a.health_status, a.summary
                    FROM images i
                    LEFT JOIN image_gps g ON i.id = g.image_id
                    LEFT JOIN analyses a ON i.id = a.image_id
                    WHERE i.id = %s
                """, (image_id,))
                result = cur.fetchone()
                if not result:
                    return jsonify({'error': 'Image not found'}), 404
                return jsonify(dict(result))
            else:
                # Get all images
                cur.execute("""
                    SELECT i.id, i.filename, i.original_name, i.s3_url, i.file_path,
                           i.uploaded_at, i.processing_status,
                           g.latitude, g.longitude,
                           a.ndvi_mean, a.savi_mean, a.health_status, a.summary
                    FROM images i
                    LEFT JOIN image_gps g ON i.id = g.image_id
                    LEFT JOIN analyses a ON i.id = a.image_id
                    ORDER BY i.uploaded_at DESC
                    LIMIT 100
                """)
                results = cur.fetchall()
                return jsonify({'images': [dict(r) for r in results]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()


@app.route('/uploads/<filename>', methods=['GET'])
def serve_image(filename):
    """Serve uploaded images"""
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return jsonify({'error': 'File not found'}), 404


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)

