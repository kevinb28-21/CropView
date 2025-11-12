"""
Database Utilities for PostgreSQL
Handles database connections and queries for image processing
"""
import psycopg2
import psycopg2.extras
from psycopg2.pool import SimpleConnectionPool
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Database connection pool
_pool = None


def get_db_pool():
    """Get or create database connection pool"""
    global _pool
    if _pool is None:
        try:
            _pool = SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'drone_analytics'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
            logger.info("Database connection pool created")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise
    return _pool


def get_db_connection():
    """Get a database connection from the pool"""
    pool = get_db_pool()
    return pool.getconn()


def return_db_connection(conn):
    """Return a connection to the pool"""
    pool = get_db_pool()
    pool.putconn(conn)


def get_pending_images(limit: int = 10) -> List[Dict]:
    """
    Get images that are pending processing
    
    Returns:
        List of image records with status 'uploaded'
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, filename, original_name, file_path, s3_url, s3_key, s3_stored,
                       captured_at, uploaded_at, processing_status
                FROM images
                WHERE processing_status = 'uploaded'
                ORDER BY uploaded_at ASC
                LIMIT %s
            """, (limit,))
            return cur.fetchall()
    except Exception as e:
        logger.error(f"Error fetching pending images: {e}")
        return []
    finally:
        if conn:
            return_db_connection(conn)


def update_image_status(image_id: str, status: str) -> bool:
    """
    Update image processing status
    
    Args:
        image_id: UUID of the image
        status: New status (uploaded, processing, completed, failed)
    
    Returns:
        True if successful, False otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE images
                SET processing_status = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (status, image_id))
            conn.commit()
            return cur.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating image status: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            return_db_connection(conn)


def set_processing_started(image_id: str) -> bool:
    """Mark image as processing started"""
    return update_image_status(image_id, 'processing')


def set_processing_completed(image_id: str) -> bool:
    """Mark image as processing completed"""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE images
                SET processing_status = 'completed',
                    processed_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (image_id,))
            conn.commit()
            return cur.rowcount > 0
    except Exception as e:
        logger.error(f"Error marking image as completed: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            return_db_connection(conn)


def set_processing_failed(image_id: str, error_message: str = None) -> bool:
    """Mark image processing as failed"""
    return update_image_status(image_id, 'failed')


def save_analysis(image_id: str, analysis_data: Dict) -> bool:
    """
    Save analysis results to database
    
    Args:
        image_id: UUID of the image
        analysis_data: Dictionary with analysis results
    
    Returns:
        True if successful, False otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Insert or update analysis
            cur.execute("""
                INSERT INTO analyses (
                    image_id, ndvi_mean, ndvi_std, ndvi_min, ndvi_max,
                    savi_mean, savi_std, savi_min, savi_max,
                    health_score, health_status, summary,
                    analysis_type, model_version, confidence,
                    processed_image_path, processed_s3_url,
                    processed_at
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (image_id) DO UPDATE SET
                    ndvi_mean = EXCLUDED.ndvi_mean,
                    ndvi_std = EXCLUDED.ndvi_std,
                    ndvi_min = EXCLUDED.ndvi_min,
                    ndvi_max = EXCLUDED.ndvi_max,
                    savi_mean = EXCLUDED.savi_mean,
                    savi_std = EXCLUDED.savi_std,
                    savi_min = EXCLUDED.savi_min,
                    savi_max = EXCLUDED.savi_max,
                    health_score = EXCLUDED.health_score,
                    health_status = EXCLUDED.health_status,
                    summary = EXCLUDED.summary,
                    analysis_type = EXCLUDED.analysis_type,
                    model_version = EXCLUDED.model_version,
                    confidence = EXCLUDED.confidence,
                    processed_image_path = EXCLUDED.processed_image_path,
                    processed_s3_url = EXCLUDED.processed_s3_url,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                image_id,
                analysis_data.get('ndvi_mean'),
                analysis_data.get('ndvi_std'),
                analysis_data.get('ndvi_min'),
                analysis_data.get('ndvi_max'),
                analysis_data.get('savi_mean'),
                analysis_data.get('savi_std'),
                analysis_data.get('savi_min'),
                analysis_data.get('savi_max'),
                analysis_data.get('health_score'),
                analysis_data.get('health_status'),
                analysis_data.get('summary'),
                analysis_data.get('analysis_type', 'opencv'),
                analysis_data.get('model_version'),
                analysis_data.get('confidence'),
                analysis_data.get('processed_image_path'),
                analysis_data.get('processed_s3_url'),
            ))
            
            # Save stress zones if provided
            if 'stress_zones' in analysis_data and analysis_data['stress_zones']:
                # Get analysis ID
                cur.execute("SELECT id FROM analyses WHERE image_id = %s", (image_id,))
                analysis_result = cur.fetchone()
                if analysis_result:
                    analysis_id = analysis_result[0]
                    # Delete existing stress zones
                    cur.execute("DELETE FROM stress_zones WHERE analysis_id = %s", (analysis_id,))
                    # Insert new stress zones
                    for zone in analysis_data['stress_zones']:
                        cur.execute("""
                            INSERT INTO stress_zones (
                                analysis_id, grid_x, grid_y, severity, ndvi_value, savi_value
                            ) VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (analysis_id, grid_x, grid_y) DO UPDATE SET
                                severity = EXCLUDED.severity,
                                ndvi_value = EXCLUDED.ndvi_value,
                                savi_value = EXCLUDED.savi_value
                        """, (
                            analysis_id,
                            zone.get('x', zone.get('grid_x', 0)),
                            zone.get('y', zone.get('grid_y', 0)),
                            zone.get('severity', 0.5),
                            zone.get('ndvi', zone.get('ndvi_value')),
                            zone.get('savi', zone.get('savi_value'))
                        ))
            
            conn.commit()
            return True
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            return_db_connection(conn)


def get_image_path(image_record: Dict) -> Optional[str]:
    """
    Get local file path for an image record
    
    Returns:
        Local file path or None if not available
    """
    # Try S3 URL first (download needed)
    if image_record.get('s3_stored') and image_record.get('s3_url'):
        # For now, return None - would need to download from S3
        # In production, you might want to download temporarily
        return None
    
    # Try local file path
    if image_record.get('file_path'):
        return image_record['file_path']
    
    # Try constructing from filename
    if image_record.get('filename'):
        upload_folder = os.getenv('UPLOAD_FOLDER', './uploads')
        return os.path.join(upload_folder, image_record['filename'])
    
    return None


def test_connection() -> bool:
    """Test database connection"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
        return_db_connection(conn)
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

