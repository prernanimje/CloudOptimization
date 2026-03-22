-- PostgreSQL Database and Tables Setup Script
-- This script creates the cloud_optimization database and all required tables

-- Create database if it doesn't exist
CREATE DATABASE cloud_optimization;

-- Connect to cloud_optimization database via separate command

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create instances table  
CREATE TABLE IF NOT EXISTS instances (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    cpu_usage FLOAT DEFAULT 0,
    ram_usage FLOAT DEFAULT 0,
    storage_usage FLOAT DEFAULT 0,
    storage_capacity FLOAT DEFAULT 50,
    uptime_hours INTEGER DEFAULT 0,
    downtime_hours INTEGER DEFAULT 0,
    region VARCHAR(255),
    monthly_cost FLOAT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    cpu_usage FLOAT,
    ram_usage FLOAT,
    storage_usage FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health_alerts table
CREATE TABLE IF NOT EXISTS health_alerts (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    alert_type VARCHAR(50),
    severity VARCHAR(50),
    message TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_instances_name ON instances(name);
CREATE INDEX IF NOT EXISTS idx_instances_region ON instances(region);
CREATE INDEX IF NOT EXISTS idx_metrics_instance_id ON metrics(instance_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_alerts_instance_id ON health_alerts(instance_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Verify tables were created
\dt
