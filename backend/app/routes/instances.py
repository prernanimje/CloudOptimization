"""Routes for managing cloud instances"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from ..database import get_db
from ..schemas import InstanceCreate, InstanceUpdate, InstanceResponse
from ..models import Instance

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/instances", response_model=List[InstanceResponse])
async def list_instances(db: Session = Depends(get_db)):
    """
    Get all cloud instances
    
    Returns list of all instances with their current metrics
    """
    instances = db.query(Instance).all()
    return instances


@router.post("/instances", response_model=InstanceResponse)
async def create_instance(instance: InstanceCreate, db: Session = Depends(get_db)):
    """
    Create a new cloud instance
    
    Args:
        instance: Instance data (name, CPU%, RAM%, Storage%, region, cost, etc.)
        
    Returns:
        Created instance with ID
    """
    # Check if instance already exists
    existing = db.query(Instance).filter(Instance.name == instance.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Instance with name '{instance.name}' already exists"
        )
    
    try:
        db_instance = Instance(**instance.dict())
        db.add(db_instance)
        db.commit()
        db.refresh(db_instance)
        logger.info(f"Created instance: {instance.name}")
        return db_instance
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating instance: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating instance")


@router.get("/instances/{instance_id}", response_model=InstanceResponse)
async def get_instance(instance_id: int, db: Session = Depends(get_db)):
    """
    Get details of a specific instance
    
    Args:
        instance_id: ID of the instance
        
    Returns:
        Instance details with all metrics
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return instance


@router.put("/instances/{instance_id}", response_model=InstanceResponse)
async def update_instance(
    instance_id: int,
    instance_data: InstanceUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an instance's metrics
    
    Args:
        instance_id: ID of the instance to update
        instance_data: New metrics (CPU%, RAM%, Storage%, status, etc.)
        
    Returns:
        Updated instance
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    # Update only provided fields
    update_data = instance_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(instance, key, value)
    
    try:
        db.commit()
        db.refresh(instance)
        logger.info(f"Updated instance: {instance.name}")
        return instance
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating instance: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating instance")


@router.delete("/instances/{instance_id}")
async def delete_instance(instance_id: int, db: Session = Depends(get_db)):
    """
    Delete an instance
    
    Args:
        instance_id: ID of the instance to delete
        
    Returns:
        Success message
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        instance_name = instance.name
        db.delete(instance)
        db.commit()
        logger.info(f"Deleted instance: {instance_name}")
        return {"message": f"Instance '{instance_name}' deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting instance: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting instance")
