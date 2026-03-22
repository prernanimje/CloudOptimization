"""Routes for file upload"""
import csv
import logging
from io import StringIO
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Instance
from ..schemas import UploadResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_instances(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload CSV file with instance data
    
    Expected CSV format:
    name,cpu_usage,ram_usage,storage_usage,uptime_hours,region,monthly_cost,status
    web-server-1,45,60,70,720,us-east-1,150.00,healthy
    
    Args:
        file: CSV file upload
        
    Returns:
        Upload result with count of created/updated instances
    """
    try:
        # Read uploaded file
        contents = await file.read()
        content_string = contents.decode("utf-8")
        
        # Parse CSV
        reader = csv.DictReader(StringIO(content_string))
        
        instances_created = 0
        instances_updated = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
            try:
                # Validate required fields
                if not row.get('name'):
                    errors.append(f"Row {row_num}: Missing instance name")
                    continue
                
                instance_name = row['name'].strip()
                
                # Check if instance exists
                existing = db.query(Instance).filter(Instance.name == instance_name).first()
                
                # Parse and validate numeric fields
                cpu_usage = float(row.get('cpu_usage', 0))
                ram_usage = float(row.get('ram_usage', 0))
                storage_usage = float(row.get('storage_usage', 0))
                uptime_hours = int(float(row.get('uptime_hours', 0)))
                monthly_cost = float(row.get('monthly_cost', 0))
                
                # Validate ranges
                if not (0 <= cpu_usage <= 100):
                    errors.append(f"Row {row_num}: CPU usage must be 0-100%")
                    continue
                if not (0 <= ram_usage <= 100):
                    errors.append(f"Row {row_num}: RAM usage must be 0-100%")
                    continue
                if not (0 <= storage_usage <= 100):
                    errors.append(f"Row {row_num}: Storage usage must be 0-100%")
                    continue
                
                if existing:
                    # Update existing instance
                    existing.cpu_usage = cpu_usage
                    existing.ram_usage = ram_usage
                    existing.storage_usage = storage_usage
                    existing.uptime_hours = uptime_hours
                    existing.region = row.get('region', existing.region).strip()
                    existing.monthly_cost = monthly_cost
                    existing.status = row.get('status', 'healthy').strip()
                    db.add(existing)
                    instances_updated += 1
                else:
                    # Create new instance
                    new_instance = Instance(
                        name=instance_name,
                        cpu_usage=cpu_usage,
                        ram_usage=ram_usage,
                        storage_usage=storage_usage,
                        storage_capacity=float(row.get('storage_capacity', 50)),
                        uptime_hours=uptime_hours,
                        downtime_hours=int(float(row.get('downtime_hours', 0))),
                        region=row.get('region', 'us-east-1').strip(),
                        monthly_cost=monthly_cost,
                        status=row.get('status', 'healthy').strip()
                    )
                    db.add(new_instance)
                    instances_created += 1
                    
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        # Commit all changes
        db.commit()
        
        logger.info(f"Upload completed: {instances_created} created, {instances_updated} updated")
        
        return UploadResponse(
            success=True,
            message=f"Successfully processed {instances_created + instances_updated} instances",
            instances_created=instances_created,
            instances_updated=instances_updated,
            errors=errors
        )
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")


@router.get("/upload/example")
async def download_example_csv():
    """
    Get example CSV format for debugging
    
    Returns CSV content as string
    """
    example_csv = """name,cpu_usage,ram_usage,storage_usage,storage_capacity,uptime_hours,downtime_hours,region,monthly_cost,status
web-server-1,45,60,70,50,720,0,us-east-1,150.00,healthy
web-server-2,15,20,80,100,700,20,us-west-2,120.00,healthy
db-server-1,85,92,90,500,650,70,eu-west-1,300.00,healthy
cache-server,8,10,30,50,720,0,ap-south-1,80.00,healthy
mail-server,35,45,50,100,690,30,us-east-1,100.00,healthy"""
    
    return {"example": example_csv}