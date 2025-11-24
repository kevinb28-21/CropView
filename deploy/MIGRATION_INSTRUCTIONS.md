# Database Migration Instructions

## GNDVI Column Migration

The database needs GNDVI (Green Normalized Difference Vegetation Index) columns added to the `analyses` table.

### Option 1: Run Migration Remotely (Recommended)

From your local machine:

```bash
cd /Users/kevinbhatt/Desktop/Projects/Capstone_Interface
./deploy/run-migration-remote.sh ~/Downloads/MS04_ID.pem ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com
```

### Option 2: Run Migration Directly on EC2

1. SSH into EC2:
```bash
ssh -i ~/Downloads/MS04_ID.pem ubuntu@ec2-18-223-169-5.us-east-2.compute.amazonaws.com
```

2. Navigate to project directory:
```bash
cd ~/Capstone_Interface
```

3. Run the migration script:
```bash
./deploy/run-migration.sh
```

### Option 3: Manual Migration

If the scripts don't work, run the SQL directly:

```bash
# SSH into EC2 first, then:
cd ~/Capstone_Interface

# Load environment variables
source python_processing/.env  # or export them manually

# Run migration
psql -U "$DB_USER" -d "$DB_NAME" -h "${DB_HOST:-localhost}" \
  -f python_processing/database_migration_add_gndvi.sql
```

### Verify Migration

After running the migration, verify it worked:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='analyses' AND column_name LIKE 'gndvi%'
ORDER BY column_name;
```

You should see:
- gndvi
- gndvi_mean
- gndvi_std
- gndvi_min
- gndvi_max

### Restart Services

After migration, restart the backend services:

```bash
pm2 restart server
pm2 restart flask-api
pm2 restart background-worker
```

## Troubleshooting

### Error: "column does not exist"
- Make sure the migration SQL file exists: `python_processing/database_migration_add_gndvi.sql`
- Check database connection settings in `python_processing/.env`
- Verify you have the correct database user permissions

### Error: "permission denied"
- Make sure the database user has ALTER TABLE permissions
- You may need to run as postgres superuser:
```bash
sudo -u postgres psql -d drone_analytics -f python_processing/database_migration_add_gndvi.sql
```

### Connection Timeout
- Check EC2 instance is running
- Verify security group allows SSH (port 22)
- Check if the public IP has changed

