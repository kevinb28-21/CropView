-- =====================================================
-- PostgreSQL Database Schema for Drone Crop Health Platform
-- =====================================================
-- This schema stores image metadata, GPS coordinates, 
-- timestamps, processing status, telemetry, and geofences
-- =====================================================

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MISSIONS TABLE
-- =====================================================
-- Stores mission/flight session information
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- IMAGES TABLE
-- =====================================================
-- Stores image metadata and file information
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512), -- Local path (if not using S3)
    s3_url VARCHAR(512), -- S3 URL if stored in S3
    s3_key VARCHAR(512), -- S3 object key
    s3_stored BOOLEAN DEFAULT FALSE,
    file_size BIGINT, -- Size in bytes
    mime_type VARCHAR(100), -- image/jpeg, image/png, etc.
    
    -- Timestamps
    captured_at TIMESTAMP WITH TIME ZONE, -- When image was captured by drone
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, analyzed, completed, failed
    processed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- IMAGE_GPS TABLE
-- =====================================================
-- Stores GPS coordinates and location data for each image
CREATE TABLE IF NOT EXISTS image_gps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID UNIQUE REFERENCES images(id) ON DELETE CASCADE,
    
    -- GPS coordinates
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(10, 2), -- Altitude in meters
    accuracy DECIMAL(10, 2), -- GPS accuracy in meters
    
    -- Flight data
    heading DECIMAL(5, 2), -- Bearing/heading in degrees (0-360)
    ground_speed DECIMAL(10, 2), -- Speed in m/s
    speed DECIMAL(10, 2), -- Alternative speed field
    
    -- Timestamps
    captured_at TIMESTAMP WITH TIME ZONE, -- GPS timestamp from capture
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYSES TABLE
-- =====================================================
-- Stores crop health analysis results
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID UNIQUE REFERENCES images(id) ON DELETE CASCADE,
    
    -- NDVI values
    ndvi DECIMAL(5, 3), -- Mean NDVI value (0-1)
    ndvi_mean DECIMAL(5, 3), -- Mean NDVI
    ndvi_std DECIMAL(5, 3), -- Standard deviation
    ndvi_min DECIMAL(5, 3), -- Minimum NDVI
    ndvi_max DECIMAL(5, 3), -- Maximum NDVI
    
    -- SAVI values (Soil-Adjusted Vegetation Index)
    savi DECIMAL(5, 3), -- Mean SAVI value
    savi_mean DECIMAL(5, 3),
    savi_std DECIMAL(5, 3),
    savi_min DECIMAL(5, 3),
    savi_max DECIMAL(5, 3),
    
    -- Health metrics
    health_score DECIMAL(5, 2), -- Overall health score (0-100)
    health_status VARCHAR(50), -- healthy, attention_needed, stressed, critical
    
    -- Analysis summary
    summary TEXT, -- Text summary of analysis
    analysis_type VARCHAR(50) DEFAULT 'placeholder', -- placeholder, opencv, tensorflow
    
    -- Model information
    model_version VARCHAR(50), -- ML model version used
    confidence DECIMAL(5, 3), -- Confidence score (0-1)
    
    -- Processed image
    processed_image_path VARCHAR(512), -- Path to processed/annotated image
    processed_s3_url VARCHAR(512), -- S3 URL for processed image
    
    -- Timestamps
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STRESS_ZONES TABLE
-- =====================================================
-- Stores detailed stress zone grid data for each analysis
CREATE TABLE IF NOT EXISTS stress_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    
    -- Grid coordinates
    grid_x INTEGER NOT NULL, -- X coordinate in grid (0-100)
    grid_y INTEGER NOT NULL, -- Y coordinate in grid (0-100)
    
    -- Stress metrics
    severity DECIMAL(5, 2) NOT NULL, -- Stress severity (0-1)
    ndvi_value DECIMAL(5, 3), -- NDVI value at this grid point
    savi_value DECIMAL(5, 3), -- SAVI value at this grid point
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique grid points per analysis
    UNIQUE (analysis_id, grid_x, grid_y)
);

-- =====================================================
-- TELEMETRY TABLE
-- =====================================================
-- Stores current drone position and state
CREATE TABLE IF NOT EXISTS telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Position
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(10, 2), -- Altitude in meters
    
    -- Flight data
    heading DECIMAL(5, 2), -- Heading in degrees
    ground_speed DECIMAL(10, 2), -- Speed in m/s
    battery_level DECIMAL(5, 2), -- Battery percentage (0-100)
    
    -- Status
    status VARCHAR(50) DEFAULT 'idle', -- idle, flying, landing, error
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ROUTE_POINTS TABLE
-- =====================================================
-- Stores drone flight path/route points
CREATE TABLE IF NOT EXISTS route_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Position
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(10, 2),
    
    -- Sequence
    sequence INTEGER NOT NULL, -- Order in route (0, 1, 2, ...)
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GEOFENCES TABLE
-- =====================================================
-- Stores geofence definitions
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GEOFENCE_POINTS TABLE
-- =====================================================
-- Stores individual points that define geofence boundaries
CREATE TABLE IF NOT EXISTS geofence_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geofence_id UUID REFERENCES geofences(id) ON DELETE CASCADE,
    
    -- Position
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Sequence (order of points to form polygon)
    sequence INTEGER NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique sequence per geofence
    UNIQUE (geofence_id, sequence)
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_mission_id ON images(mission_id);
CREATE INDEX IF NOT EXISTS idx_images_captured_at ON images(captured_at);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_images_processing_status ON images(processing_status);
CREATE INDEX IF NOT EXISTS idx_images_s3_stored ON images(s3_stored);

-- GPS indexes
CREATE INDEX IF NOT EXISTS idx_image_gps_image_id ON image_gps(image_id);
CREATE INDEX IF NOT EXISTS idx_image_gps_location ON image_gps(latitude, longitude);

-- Analyses indexes
CREATE INDEX IF NOT EXISTS idx_analyses_image_id ON analyses(image_id);
CREATE INDEX IF NOT EXISTS idx_analyses_health_status ON analyses(health_status);
CREATE INDEX IF NOT EXISTS idx_analyses_processed_at ON analyses(processed_at);

-- Stress zones indexes
CREATE INDEX IF NOT EXISTS idx_stress_zones_analysis_id ON stress_zones(analysis_id);
CREATE INDEX IF NOT EXISTS idx_stress_zones_severity ON stress_zones(severity);

-- Telemetry indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_status ON telemetry(status);

-- Route points indexes
CREATE INDEX IF NOT EXISTS idx_route_points_sequence ON route_points(sequence);
CREATE INDEX IF NOT EXISTS idx_route_points_timestamp ON route_points(timestamp);

-- Geofence indexes
CREATE INDEX IF NOT EXISTS idx_geofences_is_active ON geofences(is_active);
CREATE INDEX IF NOT EXISTS idx_geofence_points_geofence_id ON geofence_points(geofence_id);
CREATE INDEX IF NOT EXISTS idx_geofence_points_sequence ON geofence_points(geofence_id, sequence);

-- =====================================================
-- TRIGGERS for updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_gps_updated_at
    BEFORE UPDATE ON image_gps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at
    BEFORE UPDATE ON analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geofences_updated_at
    BEFORE UPDATE ON geofences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert default telemetry record
INSERT INTO telemetry (latitude, longitude, altitude, heading, ground_speed, battery_level, status)
VALUES (43.6532, -79.3832, 100.0, 0.0, 0.0, 90.0, 'idle')
ON CONFLICT DO NOTHING;

-- Insert default geofence (Toronto area)
INSERT INTO geofences (name, description, is_active)
VALUES ('Default Geofence', 'Initial geofence around Toronto area', TRUE)
ON CONFLICT DO NOTHING;

-- Insert default geofence points
INSERT INTO geofence_points (geofence_id, sequence, latitude, longitude)
SELECT 
    (SELECT id FROM geofences WHERE name = 'Default Geofence' LIMIT 1),
    sequence,
    latitude,
    longitude
FROM (VALUES
    (0, 43.6555, -79.391),
    (1, 43.6505, -79.391),
    (2, 43.6505, -79.3755),
    (3, 43.6555, -79.3755)
) AS points(sequence, latitude, longitude)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE images IS 'Stores image metadata including file paths, S3 URLs, and processing status';
COMMENT ON TABLE image_gps IS 'Stores GPS coordinates and location data for each captured image';
COMMENT ON TABLE analyses IS 'Stores crop health analysis results including NDVI, SAVI, and health scores';
COMMENT ON TABLE stress_zones IS 'Stores detailed stress zone grid data for visualization';
COMMENT ON TABLE telemetry IS 'Stores current drone position and flight state';
COMMENT ON TABLE route_points IS 'Stores historical flight path points';
COMMENT ON TABLE geofences IS 'Stores geofence boundary definitions';
COMMENT ON TABLE geofence_points IS 'Stores individual points that form geofence polygons';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

