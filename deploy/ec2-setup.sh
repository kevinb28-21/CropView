#!/bin/bash
# EC2 Setup Script for Drone Crop Health Platform
# Run this script on your EC2 instance after connecting via SSH

set -e  # Exit on error

echo "=========================================="
echo "EC2 Setup Script - Drone Crop Health Platform"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as ubuntu or ec2-user
if [ "$USER" != "ubuntu" ] && [ "$USER" != "ec2-user" ]; then
    print_warning "This script is designed for ubuntu/ec2-user. Current user: $USER"
fi

# Detect OS and use appropriate package manager
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

# Step 1: Update system
echo ""
echo "Step 1: Updating system packages..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt update && sudo apt upgrade -y
elif [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    sudo yum update -y
else
    print_warning "Unknown OS, trying apt..."
    sudo apt update && sudo apt upgrade -y 2>/dev/null || sudo yum update -y
fi
print_status "System updated"

# Step 2: Install Node.js 20.x
echo ""
echo "Step 2: Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    fi
    print_status "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Step 3: Install Python 3
echo ""
echo "Step 3: Installing Python 3..."
if ! command -v python3 &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt install -y python3 python3-pip python3-venv
    else
        sudo yum install -y python3 python3-pip
    fi
    print_status "Python 3 installed: $(python3 --version)"
else
    print_status "Python 3 already installed: $(python3 --version)"
fi

# Step 4: Install PostgreSQL
echo ""
echo "Step 4: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt install -y postgresql postgresql-contrib
    else
        sudo amazon-linux-extras install postgresql14 -y
        sudo yum install -y postgresql-server postgresql-contrib
    fi
    print_status "PostgreSQL installed"
else
    print_status "PostgreSQL already installed"
fi

# Step 5: Initialize PostgreSQL (if not already done)
echo ""
echo "Step 5: Initializing PostgreSQL..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    # Ubuntu/Debian PostgreSQL is auto-initialized
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "PostgreSQL started and enabled"
else
    if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
        sudo postgresql-setup initdb
        print_status "PostgreSQL initialized"
    else
        print_status "PostgreSQL already initialized"
    fi
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "PostgreSQL started and enabled"
fi

# Step 6: Install Git
echo ""
echo "Step 6: Installing Git..."
if ! command -v git &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt install -y git
    else
        sudo yum install -y git
    fi
    print_status "Git installed: $(git --version)"
else
    print_status "Git already installed: $(git --version)"
fi

# Step 7: Install PM2
echo ""
echo "Step 7: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Step 8: Install Nginx
echo ""
echo "Step 8: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt install -y nginx
    else
        sudo amazon-linux-extras install nginx1 -y
    fi
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Step 9: Install build tools
echo ""
echo "Step 9: Installing build tools..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt install -y build-essential python3-dev libpq-dev
else
    sudo yum groupinstall -y "Development Tools" 2>/dev/null || print_warning "Development Tools may already be installed"
    sudo yum install -y python3-devel postgresql-devel
fi
print_status "Build tools installed"

# Step 10: Setup PostgreSQL database
echo ""
echo "Step 10: Setting up PostgreSQL database..."
echo "Please enter a secure password for the database user:"
read -s DB_PASSWORD
echo ""

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE drone_analytics;
CREATE USER drone_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE drone_analytics TO drone_user;
\q
EOF

print_status "Database and user created"

# Configure PostgreSQL to allow connections
echo ""
echo "Configuring PostgreSQL authentication..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    PG_HBA_FILE="/etc/postgresql/14/main/pg_hba.conf"
    if [ ! -f "$PG_HBA_FILE" ]; then
        PG_HBA_FILE="/etc/postgresql/*/main/pg_hba.conf"
    fi
    sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' $PG_HBA_FILE 2>/dev/null || true
    sudo sed -i 's/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/' $PG_HBA_FILE 2>/dev/null || true
    if ! grep -q "drone_analytics" $PG_HBA_FILE 2>/dev/null; then
        echo "host    drone_analytics    drone_user    127.0.0.1/32    md5" | sudo tee -a $PG_HBA_FILE
    fi
else
    sudo sed -i 's/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/' /var/lib/pgsql/data/pg_hba.conf
    if ! grep -q "drone_analytics" /var/lib/pgsql/data/pg_hba.conf; then
        echo "host    drone_analytics    drone_user    127.0.0.1/32    md5" | sudo tee -a /var/lib/pgsql/data/pg_hba.conf
    fi
fi

sudo systemctl restart postgresql
print_status "PostgreSQL configured and restarted"

# Step 11: Clone repository (if not already cloned)
echo ""
echo "Step 11: Cloning repository..."
if [ ! -d "$HOME/Capstone_Interface" ]; then
    cd ~
    git clone https://github.com/kevinb28-21/Capstone_Interface.git
    print_status "Repository cloned"
else
    print_status "Repository already exists, skipping clone"
fi

# Step 12: Setup Node.js backend
echo ""
echo "Step 12: Setting up Node.js backend..."
cd ~/Capstone_Interface/server
npm install
print_status "Node.js dependencies installed"

# Step 13: Setup Python environment
echo ""
echo "Step 13: Setting up Python environment..."
cd ~/Capstone_Interface/python_processing
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
deactivate
print_status "Python environment created and dependencies installed"

# Create directories
mkdir -p uploads processed models logs
print_status "Directories created"

# Step 14: Create environment files
echo ""
echo "Step 14: Creating environment files..."
echo ""
print_warning "You need to manually edit the .env files with your actual values:"
echo "  - ~/Capstone_Interface/server/.env"
echo "  - ~/Capstone_Interface/python_processing/.env"
echo ""
echo "The template files have been created. Please edit them now."
echo "Press Enter to continue after editing the .env files..."
read

# Step 15: Run database migrations
echo ""
echo "Step 15: Running database migrations..."
export PGPASSWORD=$DB_PASSWORD
psql -U drone_user -d drone_analytics -h localhost -f ~/Capstone_Interface/server/database/schema.sql
psql -U drone_user -d drone_analytics -h localhost -f ~/Capstone_Interface/python_processing/database_migration_add_gndvi.sql
print_status "Database migrations completed"

# Step 16: Setup PM2
echo ""
echo "Step 16: Setting up PM2..."
cd ~/Capstone_Interface/server
mkdir -p logs
pm2 start ecosystem.config.js || print_warning "PM2 config may need to be created first"
pm2 save

cd ~/Capstone_Interface/python_processing
mkdir -p logs
pm2 start ecosystem.config.js || print_warning "PM2 config may need to be created first"
pm2 start worker.config.js || print_warning "PM2 config may need to be created first"
pm2 save

# Setup PM2 startup
pm2 startup | tail -1 | sudo bash || print_warning "PM2 startup command may need manual execution"
print_status "PM2 configured"

# Step 17: Configure Nginx
echo ""
echo "Step 17: Configuring Nginx..."
sudo cp ~/Capstone_Interface/deploy/nginx.conf /etc/nginx/conf.d/drone-backend.conf
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
print_status "Nginx configured and started"

echo ""
echo "=========================================="
print_status "Setup completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit ~/Capstone_Interface/server/.env with your configuration"
echo "2. Edit ~/Capstone_Interface/python_processing/.env with your configuration"
echo "3. Restart services: pm2 restart all"
echo "4. Check status: pm2 status"
echo "5. View logs: pm2 logs"
echo ""
echo "Your backend should be accessible at:"
echo "  - Node.js: http://18.224.7.31:5050"
echo "  - Flask API: http://18.224.7.31:5001"
echo ""

