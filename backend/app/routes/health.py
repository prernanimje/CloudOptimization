"""Routes for health monitoring and alerts"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Instance, HealthAlert
from ..schemas import HealthAlertResponse
from ..services.email_service import EmailService, EmailServiceFallback
from ..config import (
    CPU_WARNING_THRESHOLD, CPU_CRITICAL_THRESHOLD,
    RAM_WARNING_THRESHOLD, RAM_CRITICAL_THRESHOLD,
    STORAGE_WARNING_THRESHOLD, STORAGE_CRITICAL_THRESHOLD
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/health/check/{instance_id}")
async def check_instance_health(instance_id: int, db: Session = Depends(get_db)):
    """
    Check health status of an instance
    
    Creates alerts if thresholds exceeded
    
    Args:
        instance_id: ID of the instance
        
    Returns:
        Health status and alerts
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        health_status = {
            "instance_id": instance.id,
            "instance_name": instance.name,
            "status": instance.status,
            "alerts": []
        }
        
        # Check CPU
        if instance.cpu_usage >= CPU_CRITICAL_THRESHOLD:
            alert = HealthAlert(
                instance_id=instance.id,
                alert_type="high_cpu",
                severity="critical",
                message=f"CPU usage critical: {instance.cpu_usage}%"
            )
            db.add(alert)
            health_status["alerts"].append({
                "type": "high_cpu",
                "severity": "critical",
                "message": f"CPU at {instance.cpu_usage}%"
            })
            instance.status = "critical"
        elif instance.cpu_usage >= CPU_WARNING_THRESHOLD:
            alert = HealthAlert(
                instance_id=instance.id,
                alert_type="high_cpu",
                severity="warning",
                message=f"CPU usage warning: {instance.cpu_usage}%"
            )
            db.add(alert)
            health_status["alerts"].append({
                "type": "high_cpu",
                "severity": "warning",
                "message": f"CPU at {instance.cpu_usage}%"
            })
            if instance.status != "critical":
                instance.status = "warning"
        
        # Check RAM
        if instance.ram_usage >= RAM_CRITICAL_THRESHOLD:
            alert = HealthAlert(
                instance_id=instance.id,
                alert_type="high_ram",
                severity="critical",
                message=f"RAM usage critical: {instance.ram_usage}%"
            )
            db.add(alert)
            health_status["alerts"].append({
                "type": "high_ram",
                "severity": "critical",
                "message": f"RAM at {instance.ram_usage}%"
            })
            instance.status = "critical"
        elif instance.ram_usage >= RAM_WARNING_THRESHOLD:
            alert = HealthAlert(
                instance_id=instance.id,
                alert_type="high_ram",
                severity="warning",
                message=f"RAM usage warning: {instance.ram_usage}%"
            )
            db.add(alert)
            health_status["alerts"].append({
                "type": "high_ram",
                "severity": "warning",
                "message": f"RAM at {instance.ram_usage}%"
            })
        
        # Check Storage
        if instance.storage_usage >= STORAGE_CRITICAL_THRESHOLD:
            alert = HealthAlert(
                instance_id=instance.id,
                alert_type="high_storage",
                severity="critical",
                message=f"Storage usage critical: {instance.storage_usage}%"
            )
            db.add(alert)
            health_status["alerts"].append({
                "type": "high_storage",
                "severity": "critical",
                "message": f"Storage at {instance.storage_usage}%"
            })
            instance.status = "critical"
        elif instance.storage_usage >= STORAGE_WARNING_THRESHOLD:
            alert = HealthAlert(
                instance_id=instance.id,
                alert_type="high_storage",
                severity="warning",
                message=f"Storage usage warning: {instance.storage_usage}%"
            )
            db.add(alert)
            health_status["alerts"].append({
                "type": "high_storage",
                "severity": "warning",
                "message": f"Storage at {instance.storage_usage}%"
            })
        
        # Save instance status and alerts
        db.commit()
        
        # Send email alerts if there are critical issues
        if health_status["alerts"] and any(a["severity"] == "critical" for a in health_status["alerts"]):
            alert_msg = ", ".join([a["message"] for a in health_status["alerts"]])
            EmailService.send_alert(
                instance.name,
                "critical",
                alert_msg
            )
        
        logger.info(f"Health check for {instance.name}: {len(health_status['alerts'])} alerts")
        return health_status
        
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")


@router.get("/health/check")
async def check_all_health(db: Session = Depends(get_db)):
    """
    Check health status of all instances
    
    Returns:
        Health status for all instances
    """
    instances = db.query(Instance).all()
    
    all_health = {
        "total_instances": len(instances),
        "healthy": 0,
        "warning": 0,
        "critical": 0,
        "instances": []
    }
    
    for instance in instances:
        health = {
            "id": instance.id,
            "name": instance.name,
            "status": instance.status,
            "cpu": instance.cpu_usage,
            "ram": instance.ram_usage,
            "storage": instance.storage_usage
        }
        all_health["instances"].append(health)
        
        if instance.status == "healthy":
            all_health["healthy"] += 1
        elif instance.status == "warning":
            all_health["warning"] += 1
        elif instance.status == "critical":
            all_health["critical"] += 1
    
    return all_health


@router.get("/alerts/{instance_id}", response_model=List[HealthAlertResponse])
async def get_instance_alerts(instance_id: int, db: Session = Depends(get_db)):
    """
    Get all alerts for a specific instance
    
    Args:
        instance_id: ID of the instance
        
    Returns:
        List of alerts
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    alerts = db.query(HealthAlert).filter(HealthAlert.instance_id == instance_id).all()
    return alerts


from pydantic import BaseModel

class EmailConfigConfig(BaseModel):
    recipient: str
    enabled: bool

@router.post("/alerts/email")
async def configure_email_alerts(config: EmailConfigConfig, db: Session = Depends(get_db)):
    """
    Configure email alerts receiving logic 
    (Placeholder settings endpoint)
    """
    logger.info(f"Email alerts configured for {config.recipient}. Enabled: {config.enabled}")
    return {"status": "success", "message": "Email preferences updated"}

@router.get("/alerts", response_model=List[HealthAlertResponse])
async def get_all_alerts(db: Session = Depends(get_db)):
    """
    Get all recent alerts
    
    Returns:
        List of all unresolved alerts
    """
    alerts = db.query(HealthAlert).filter(HealthAlert.resolved_at == None).all()
    return alerts
