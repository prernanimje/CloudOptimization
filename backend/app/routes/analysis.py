"""Routes for analysis and recommendations"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Instance
from ..services.optimizer import OptimizerService
from ..schemas import AnalysisResult

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze/{instance_id}", response_model=AnalysisResult)
async def analyze_instance(instance_id: int, db: Session = Depends(get_db)):
    """
    Analyze a specific instance and get optimization recommendations
    
    Args:
        instance_id: ID of the instance to analyze
        
    Returns:
        Analysis result with AI-powered recommendations
    """
    instance = db.query(Instance).filter(Instance.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        analysis = OptimizerService.analyze_instance(instance)
        logger.info(f"Analysis complete for instance: {instance.name}")
        return analysis
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.get("/analyze/instance/{instance_name}", response_model=AnalysisResult)
async def analyze_by_name(instance_name: str, db: Session = Depends(get_db)):
    """
    Analyze instance by name
    
    Args:
        instance_name: Name of the instance
        
    Returns:
        Analysis result
    """
    instance = db.query(Instance).filter(Instance.name == instance_name).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    try:
        analysis = OptimizerService.analyze_instance(instance)
        return analysis
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.post("/recommendations")
async def get_all_recommendations(db: Session = Depends(get_db)):
    """
    Get recommendations for all instances
    
    Returns:
        List of analyses for all instances with recommendations
    """
    instances = db.query(Instance).all()
    
    if not instances:
        raise HTTPException(status_code=404, detail="No instances found")
    
    try:
        analyses = []
        total_savings = 0
        
        for instance in instances:
            analysis = OptimizerService.analyze_instance(instance)
            analyses.append(analysis)
            total_savings += sum(r.savings for r in analysis.recommendations)
        
        logger.info(f"Analyzed {len(instances)} instances. Total potential savings: ${total_savings:.2f}")
        
        return {
            "total_instances": len(instances),
            "total_potential_savings": round(total_savings, 2),
            "analyses": analyses
        }
        
    except Exception as e:
        logger.error(f"Bulk analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Bulk analysis failed")