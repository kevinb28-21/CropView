/**
 * S3 Utility Functions
 * Handles uploading images to Amazon S3
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// S3 Configuration
const S3_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
};

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_ENABLED = !!(BUCKET_NAME && S3_CONFIG.credentials);

// Initialize S3 client if configured
const s3Client = S3_ENABLED ? new S3Client(S3_CONFIG) : null;

/**
 * Upload file to S3
 * @param {string} filePath - Local file path
 * @param {string} s3Key - S3 object key (path in bucket)
 * @param {string} contentType - MIME type (e.g., 'image/jpeg')
 * @returns {Promise<string>} S3 URL or local path if S3 disabled
 */
export async function uploadToS3(filePath, s3Key, contentType = 'image/jpeg') {
  if (!S3_ENABLED) {
    console.log('S3 not configured, using local storage');
    return `/uploads/${s3Key.split('/').pop()}`;
  }

  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      // Optional: Add metadata
      Metadata: {
        'uploaded-at': new Date().toISOString()
      }
    });

    await s3Client.send(command);
    
    // Return S3 URL
    const s3Url = `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${s3Key}`;
    console.log(`✓ Uploaded to S3: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Generate S3 key (path) for an image
 * @param {string} filename - Original filename
 * @param {string} prefix - Optional prefix (e.g., 'images', 'processed')
 * @returns {string} S3 key
 */
export function generateS3Key(filename, prefix = 'images') {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Organize by date: images/2024/11/07/filename.jpg
  return `${prefix}/${year}/${month}/${day}/${filename}`;
}

/**
 * Get signed URL for private S3 object (expires in 1 hour)
 * @param {string} s3Key - S3 object key
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedS3Url(s3Key) {
  if (!S3_ENABLED) {
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

/**
 * Check if S3 is enabled
 * @returns {boolean}
 */
export function isS3Enabled() {
  return S3_ENABLED;
}

/**
 * Get S3 bucket name
 * @returns {string|null}
 */
export function getBucketName() {
  return BUCKET_NAME;
}

// Export for use in server.js
export { BUCKET_NAME };

