#!/bin/bash
# Script to fix processing issues on EC2
# This ensures .env exists, fixes database paths, and restarts services

set -e

echo "=========================================="
echo "Fixing EC2 Processing Issues"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if we're in the project directory
if [ ! -d "python_processing" ]; then
    print_error "python_processing directory not found!"
    print_warning "Make sure you're in the Capstone_Interface directory"
    exit 1
fi

# Step 1: Ensure .env file exists
echo "Step 1: Checking .env file..."
cd python_processing

if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    
    # Check if template exists
    if [ -f "../deploy/env-templates/python.env.template" ]; then
        cp ../deploy/env-templates/python.env.template .env
        print_warning "Created .env from template. Please edit it with your EC2 database credentials!"
        print_warning "Run: nano python_processing/.env"
    else
        print_error "Template not found. Creating basic .env..."
        cat > .env << 'EOF'
# Python Flask API Environment Variables
FLASK_PORT=5001
FLASK_DEBUG=False

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drone_analytics
DB_USER=drone_user
DB_PASSWORD=CHANGE_ME

# File Paths
UPLOAD_FOLDER=./uploads
PROCESSED_FOLDER=./processed

# Background Worker Configuration
WORKER_POLL_INTERVAL=10
WORKER_BATCH_SIZE=5

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
S3_BUCKET_NAME=ms04-image-db
S3_ENABLED=True

# ML Model Configuration (optional)
ONION_MODEL_PATH=./models/onion_crop_health_model.h5
EOF
        print_warning "Created basic .env. Please edit it with your credentials!"
    fi
else
    print_status ".env file exists"
fi

cd ..

# Step 2: Fix database file paths for failed images
echo ""
echo "Step 2: Fixing database file paths for failed images..."

# Get database password from .env
if [ -f "python_processing/.env" ]; then
    DB_PASSWORD=$(grep "^DB_PASSWORD=" python_processing/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    DB_USER=$(grep "^DB_USER=" python_processing/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'" | head -1)
    DB_NAME=$(grep "^DB_NAME=" python_processing/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'" | head -1)
    
    if [ -n "$DB_PASSWORD" ] && [ "$DB_PASSWORD" != "CHANGE_ME" ] && [ "$DB_PASSWORD" != "your-database-password-here" ]; then
        # Get the project directory path
        PROJECT_DIR=$(pwd)
        UPLOAD_DIR="$PROJECT_DIR/server/uploads"
        
        echo "Fixing file paths in database..."
        PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -d "$DB_NAME" -c "
            UPDATE images 
            SET file_path = '$UPLOAD_DIR/' || filename,
                s3_stored = false 
            WHERE processing_status = 'failed' AND (file_path IS NULL OR file_path = '');
            
            UPDATE images 
            SET processing_status = 'uploaded' 
            WHERE processing_status = 'failed';
        " 2>/dev/null && print_status "Database paths fixed" || print_warning "Could not fix database paths (may need manual fix)"
    else
        print_warning "Database password not configured. Skipping database fix."
    fi
else
    print_warning ".env file not found. Skipping database fix."
fi

# Step 3: Restart PM2 services
echo ""
echo "Step 3: Restarting PM2 services..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    print_status "PM2 services restarted"
    
    echo ""
    echo "PM2 Status:"
    pm2 status
    
    echo ""
    echo "Recent logs (last 10 lines):"
    pm2 logs --lines 10 --nostream
else
    print_warning "PM2 not found. Services may need to be started manually"
fi

echo ""
echo "=========================================="
print_status "EC2 processing fix complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify .env file has correct database credentials"
echo "2. Check PM2 logs: pm2 logs"
echo "3. Test image upload and processing"
echo "4. Monitor worker: pm2 logs background-worker --lines 50"

