"""Routes for metrics and historical data"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import Instance, Metric
from ..schemas import MetricResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/metrics/{instance_id}")
async def record_metric(
    instance_id: int,
    cpu_usage: float,
    ram_usage: float,
    storage_usage: float,
    db: Session = Depends(get_db)
):
    """
    Record a new metric snapshot for an instance
    
    Called periodically to track system metrics over time
    
    Args:
        instance_id: ID of the instance
        cpu_usage: CPU usage percentage (0-100)
        ram_usage: RAM usage percentage (0-100)
        storage_usage: Storage usage percentage (0-100)
        
    Returns:
        Created metric
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        # Validate ranges
        if not (0 <= cpu_usage <= 100) or not (0 <= ram_usage <= 100) or not (0 <= storage_usage <= 100):
            raise ValueError("Metrics must be between 0 and 100")
        
        # Create metric record
        metric = Metric(
            instance_id=instance_id,
            cpu_usage=cpu_usage,
            ram_usage=ram_usage,
            storage_usage=storage_usage
        )
        
        db.add(metric)
       # Update instance current values
        instance.cpu_usage = cpu_usage
        instance.ram_usage = ram_usage
        instance.storage_usage = storage_usage
        
        db.commit()
        db.refresh(metric)
        
        logger.info(f"Recorded metric for instance {instance.name}: CPU={cpu_usage}%, RAM={ram_usage}%, Storage={storage_usage}%")
        return {"id": metric.id, "message": "Metric recorded"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error recording metric: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics/{instance_id}", response_model=List[MetricResponse])
async def get_metrics(
    instance_id: int,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """
    Get historical metrics for an instance
    
    Args:
        instance_id: ID of the instance
        hours: Number of hours to retrieve (default 24)
        
    Returns:
        List of metrics from the last N hours
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        since = datetime.utcnow() - timedelta(hours=hours)
        
        metrics = db.query(Metric).filter(
            Metric.instance_id == instance_id,
            Metric.timestamp >= since
        ).order_by(desc(Metric.timestamp)).all()
        
        logger.info(f"Retrieved {len(metrics)} metrics for instance {instance.name} from last {hours} hours")
        return metrics
        
    except Exception as e:
        logger.error(f"Error retrieving metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving metrics")


@router.get("/metrics/{instance_id}/latest", response_model=MetricResponse)
async def get_latest_metric(instance_id: int, db: Session = Depends(get_db)):
    """
    Get the latest metric for an instance
    
    Args:
        instance_id: ID of the instance
        
    Returns:
        Most recent metric
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        metric = db.query(Metric).filter(
            Metric.instance_id == instance_id
        ).order_by(desc(Metric.timestamp)).first()
        
        if not metric:
            raise HTTPException(status_code=404, detail="No metrics found for this instance")
        
        return metric
        
    except Exception as e:
        logger.error(f"Error retrieving latest metric: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving metric")


@router.get("/metrics-summary/{instance_id}")
async def get_metrics_summary(instance_id: int, hours: int = 24, db: Session = Depends(get_db)):
    """
    Get summary statistics for metrics
    
    Args:
        instance_id: ID of the instance
        hours: Period to analyze
        
    Returns:
        Min, max, average for CPU, RAM, Storage
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        since = datetime.utcnow() - timedelta(hours=hours)
        
        metrics = db.query(Metric).filter(
            Metric.instance_id == instance_id,
            Metric.timestamp >= since
        ).all()
        
        if not metrics:
            return {
                "instance_id": instance_id,
                "period_hours": hours,
                "count": 0,
                "cpu": {"min": 0, "max": 0, "avg": 0},
                "ram": {"min": 0, "max": 0, "avg": 0},
                "storage": {"min": 0, "max": 0, "avg": 0}
            }
        
        cpu_values = [m.cpu_usage for m in metrics]
        ram_values = [m.ram_usage for m in metrics]
        storage_values = [m.storage_usage for m in metrics]
        
        summary = {
            "instance_id": instance_id,
            "instance_name": instance.name,
            "period_hours": hours,
            "count": len(metrics),
            "cpu": {
                "min": round(min(cpu_values), 2),
                "max": round(max(cpu_values), 2),
                "avg": round(sum(cpu_values) / len(cpu_values), 2)
            },
            "ram": {
                "min": round(min(ram_values), 2),
                "max": round(max(ram_values), 2),
                "avg": round(sum(ram_values) / len(ram_values), 2)
            },
            "storage": {
                "min": round(min(storage_values), 2),
                "max": round(max(storage_values), 2),
                "avg": round(sum(storage_values) / len(storage_values), 2)
            }
        }
        
        logger.info(f"Generated metrics summary for {instance.name}")
        return summary
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating summary")
