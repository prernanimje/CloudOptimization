from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """System User for Authentication"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Instance(Base):
    """Cloud server instance"""
    __tablename__ = "instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    cpu_usage = Column(Float, default=0)           # 0-100%
    ram_usage = Column(Float, default=0)           # 0-100%
    storage_usage = Column(Float, default=0)       # 0-100%
    storage_capacity = Column(Float, default=50)   # In GB
    uptime_hours = Column(Integer, default=0)      # Total uptime hours
    downtime_hours = Column(Integer, default=0)    # Total downtime hours
    region = Column(String, index=True)            # us-east-1, eu-west-1, etc.
    monthly_cost = Column(Float, default=0)        # Dollar amount
    status = Column(String, default="healthy")     # healthy, warning, critical
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    metrics = relationship("Metric", back_populates="instance", cascade="all, delete-orphan")
    health_alerts = relationship("HealthAlert", back_populates="instance", cascade="all, delete-orphan")


class Metric(Base):
    """Historical metrics for tracking trends"""
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    instance_id = Column(Integer, ForeignKey("instances.id"), index=True)
    cpu_usage = Column(Float)
    ram_usage = Column(Float)
    storage_usage = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    instance = relationship("Instance", back_populates="metrics")


class HealthAlert(Base):
    """Server health alerts and notifications"""
    __tablename__ = "health_alerts"

    id = Column(Integer, primary_key=True, index=True)
    instance_id = Column(Integer, ForeignKey("instances.id"), index=True)
    alert_type = Column(String)  # 'down', 'high_cpu', 'high_ram', 'high_storage'
    severity = Column(String)     # 'warning', 'critical'
    message = Column(Text)
    email_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    instance = relationship("Instance", back_populates="health_alerts")