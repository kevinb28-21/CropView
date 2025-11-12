"""
S3 Utility Functions for Python
Handles uploading images to Amazon S3
"""
import boto3
import os
from datetime import datetime
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()

# S3 Configuration
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

S3_ENABLED = bool(S3_BUCKET_NAME and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)

# Initialize S3 client if configured
s3_client = None
if S3_ENABLED:
    s3_client = boto3.client(
        's3',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )


def generate_s3_key(filename, prefix='images'):
    """
    Generate S3 key (path) for an image
    Organizes by date: images/2024/11/07/filename.jpg
    """
    date = datetime.now()
    year = date.year
    month = f"{date.month:02d}"
    day = f"{date.day:02d}"
    
    return f"{prefix}/{year}/{month}/{day}/{filename}"


def upload_to_s3(file_path, s3_key=None, content_type='image/jpeg'):
    """
    Upload file to S3
    
    Args:
        file_path: Local file path to upload
        s3_key: S3 object key (path in bucket). If None, generates from filename
        content_type: MIME type (default: 'image/jpeg')
    
    Returns:
        S3 URL if successful, None if S3 disabled or error
    """
    if not S3_ENABLED:
        print("S3 not configured, using local storage")
        return None
    
    if s3_key is None:
        filename = os.path.basename(file_path)
        s3_key = generate_s3_key(filename)
    
    try:
        # Read file
        with open(file_path, 'rb') as file_data:
            # Upload to S3
            s3_client.upload_fileobj(
                file_data,
                S3_BUCKET_NAME,
                s3_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'Metadata': {
                        'uploaded-at': datetime.now().isoformat()
                    }
                }
            )
        
        # Return S3 URL
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        print(f"✓ Uploaded to S3: {s3_url}")
        return s3_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error uploading to S3: {e}")
        return None


def get_signed_url(s3_key, expiration=3600):
    """
    Generate signed URL for private S3 object
    
    Args:
        s3_key: S3 object key
        expiration: URL expiration time in seconds (default: 1 hour)
    
    Returns:
        Signed URL or None if error
    """
    if not S3_ENABLED:
        return None
    
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        print(f"Error generating signed URL: {e}")
        return None


def is_s3_enabled():
    """Check if S3 is enabled"""
    return S3_ENABLED


def get_bucket_name():
    """Get S3 bucket name"""
    return S3_BUCKET_NAME if S3_ENABLED else None

