-- =====================================================
-- Database Migration: Add GNDVI Support
-- =====================================================
-- This migration adds GNDVI (Green Normalized Difference Vegetation Index)
-- columns to the analyses table for onion crop health monitoring.
-- =====================================================

-- Add GNDVI columns to analyses table
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS gndvi DECIMAL(5, 3),
ADD COLUMN IF NOT EXISTS gndvi_mean DECIMAL(5, 3),
ADD COLUMN IF NOT EXISTS gndvi_std DECIMAL(5, 3),
ADD COLUMN IF NOT EXISTS gndvi_min DECIMAL(5, 3),
ADD COLUMN IF NOT EXISTS gndvi_max DECIMAL(5, 3);

-- Add GNDVI to stress_zones table
ALTER TABLE stress_zones
ADD COLUMN IF NOT EXISTS gndvi_value DECIMAL(5, 3);

-- Add index for GNDVI queries
CREATE INDEX IF NOT EXISTS idx_analyses_gndvi_mean ON analyses(gndvi_mean);

-- Add comment
COMMENT ON COLUMN analyses.gndvi_mean IS 'Mean GNDVI (Green Normalized Difference Vegetation Index) value for onion crop health assessment';
COMMENT ON COLUMN stress_zones.gndvi_value IS 'GNDVI value at this stress zone grid point';

-- =====================================================
-- Migration Complete
-- =====================================================
-- Run this migration with:
-- psql -U postgres -d drone_analytics -f database_migration_add_gndvi.sql
-- =====================================================

