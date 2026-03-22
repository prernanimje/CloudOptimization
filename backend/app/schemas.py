"""Data validation schemas using Pydantic"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============ USER SCHEMAS ============

class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ============ INSTANCE SCHEMAS ============

class MetricBase(BaseModel):
    """Base metric data"""
    cpu_usage: float = Field(..., ge=0, le=100)
    ram_usage: float = Field(..., ge=0, le=100)
    storage_usage: float = Field(..., ge=0, le=100)
    timestamp: Optional[datetime] = None


class MetricResponse(MetricBase):
    """Metric response with ID"""
    id: int
    instance_id: int

    class Config:
        from_attributes = True


class InstanceBase(BaseModel):
    """Base instance data for creation"""
    name: str
    cpu_usage: float = Field(default=0, ge=0, le=100)
    ram_usage: float = Field(default=0, ge=0, le=100)
    storage_usage: float = Field(default=0, ge=0, le=100)
    storage_capacity: float = Field(default=50, gt=0)
    uptime_hours: int = Field(default=0, ge=0)
    downtime_hours: int = Field(default=0, ge=0)
    region: str
    monthly_cost: float = Field(default=0, ge=0)
    status: str = "healthy"


class InstanceCreate(InstanceBase):
    """Schema for creating an instance"""
    pass


class InstanceUpdate(BaseModel):
    """Schema for updating instance"""
    cpu_usage: Optional[float] = None
    ram_usage: Optional[float] = None
    storage_usage: Optional[float] = None
    uptime_hours: Optional[int] = None
    downtime_hours: Optional[int] = None
    status: Optional[str] = None


class InstanceResponse(InstanceBase):
    """Instance response with ID and metadata"""
    id: int
    created_at: datetime
    updated_at: datetime
    metrics: List[MetricResponse] = []

    class Config:
        from_attributes = True


# ============ HEALTH ALERT SCHEMAS ============

class HealthAlertResponse(BaseModel):
    """Health alert response"""
    id: int
    instance_id: int
    alert_type: str
    severity: str
    message: str
    email_sent: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ ANALYSIS & RECOMMENDATIONS SCHEMAS ============

class RecommendationItem(BaseModel):
    """Single optimization recommendation"""
    type: str  # 'resize', 'terminate', 'move_region', 'schedule_shutdown'
    action: str  # Human-readable action
    savings: float  # Estimated monthly savings in dollars
    confidence: float  # 0-100% confidence
    reason: str  # Why this recommendation


class AnalysisResult(BaseModel):
    """Complete analysis result"""
    instance_id: int
    instance_name: str
    utilization_score: float  # 0-100 (100 = properly utilized)
    waste_percentage: float  # % of unused resources
    recommendations: List[RecommendationItem]
    monthly_waste: float  # Dollar amount wasted per month
    ai_summary: str  # AI generated summary


# ============ COST SUMMARY SCHEMAS ============

class RegionCostBreakdown(BaseModel):
    """Cost breakdown by region"""
    region: str
    total_cost: float
    instance_count: int


class CostSummaryResponse(BaseModel):
    """Monthly cost summary"""
    total_cost: float
    total_waste: float
    waste_percentage: float
    by_region: List[RegionCostBreakdown]
    by_resource: dict  # {'cpu': %, 'ram': %, 'storage': %}
    top_waste_instances: List[dict]  # Top 5 wasteful instances


# ============ UPLOAD SCHEMAS ============

class UploadResponse(BaseModel):
    """Response from file upload"""
    success: bool
    message: str
    instances_created: int
    instances_updated: int
    errors: List[str] = []


# ============ DASHBOARD SCHEMA ============

class DashboardData(BaseModel):
    """Complete data for dashboard of one instance"""
    instance: InstanceResponse
    metrics: List[MetricResponse]
    health_alerts: List[HealthAlertResponse]
    analysis: Optional[AnalysisResult] = None
    region_costs: Optional[List[RegionCostBreakdown]] = None
