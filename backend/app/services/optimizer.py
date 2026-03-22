"""Cost optimization analyzer service with AI integration"""
import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models import Instance
from ..schemas import RecommendationItem, AnalysisResult
from ..config import (
    OPENAI_API_KEY,
    UNDERUTILIZED_CPU_THRESHOLD,
    OVERPROVISIONED_RAM_THRESHOLD,
    UNDERUTILIZED_STORAGE_THRESHOLD
)

logger = logging.getLogger(__name__)


class OptimizerService:
    """Service for analyzing instances and generating recommendations"""
    
    @staticmethod
    def analyze_instance(instance: Instance) -> AnalysisResult:
        """
        Analyze single instance and generate recommendations
        
        Args:
            instance: Instance object to analyze
            
        Returns:
            AnalysisResult with recommendations
        """
        logger.info(f"Analyzing instance: {instance.name}")
        
        utilization_score = OptimizerService._calculate_utilization_score(instance)
        waste_percentage = 100 - utilization_score
        monthly_waste = (instance.monthly_cost * waste_percentage) / 100
        
        recommendations = OptimizerService._generate_recommendations(instance)
        
        ai_summary = OptimizerService._generate_ai_summary(instance, recommendations)
        
        return AnalysisResult(
            instance_id=instance.id,
            instance_name=instance.name,
            utilization_score=utilization_score,
            waste_percentage=waste_percentage,
            recommendations=recommendations,
            monthly_waste=monthly_waste,
            ai_summary=ai_summary
        )
    
    @staticmethod
    def _calculate_utilization_score(instance: Instance) -> float:
        """
        Calculate utilization score (0-100)
        
        Based on:
        - CPU usage average
        - RAM usage average
        - Storage usage
        - Uptime consistency
        """
        # Average resource usage
        avg_usage = (instance.cpu_usage + instance.ram_usage + instance.storage_usage) / 3
        
        # Uptime factor (servers that go down frequently = lower score)
        total_hours = instance.uptime_hours + instance.downtime_hours
        if total_hours > 0:
            uptime_percentage = (instance.uptime_hours / total_hours) * 100
        else:
            uptime_percentage = 100
        
        # Calculate score: Higher usage = higher score (more utilized)
        # But also need good uptime
        score = (avg_usage * 0.7) + (uptime_percentage * 0.3)
        
        return round(score, 2)
    
    @staticmethod
    def _generate_recommendations(instance: Instance) -> List[RecommendationItem]:
        """Generate optimization recommendations"""
        recommendations = []
        
        # Resize recommendation
        if instance.cpu_usage < UNDERUTILIZED_CPU_THRESHOLD:
            savings = instance.monthly_cost * 0.4  # Assume 40% cost reduction
            recommendations.append(RecommendationItem(
                type="resize",
                action=f"Downsize Instance - CPU at {instance.cpu_usage}%",
                savings=round(savings, 2),
                confidence=85.0,
                reason=f"CPU usage is only {instance.cpu_usage}%. Downsizing can save cost."
            ))
        
        # Terminate recommendation
        if (instance.cpu_usage < 10 and 
            instance.ram_usage < 15 and 
            instance.storage_usage < 20):
            savings = instance.monthly_cost * 0.95
            recommendations.append(RecommendationItem(
                type="terminate",
                action="Terminate Instance",
                savings=round(savings, 2),
                confidence=90.0,
                reason="Instance is barely used. Can be safely terminated."
            ))
        
        # Move region recommendation
        cost_reduction = OptimizerService._estimate_region_savings(instance)
        if cost_reduction > 10:
            recommendations.append(RecommendationItem(
                type="move_region",
                action=f"Move to cheaper region (e.g., ap-south-1)",
                savings=round(cost_reduction, 2),
                confidence=75.0,
                reason=f"Moving region can save ${cost_reduction:.2f}/month"
            ))
        
        # Schedule shutdown recommendation
        if instance.uptime_hours > 500 and instance.downtime_hours < 50:
            # Server is running 24/7, could benefit from scheduled shutdowns
            savings = instance.monthly_cost * 0.15
            recommendations.append(RecommendationItem(
                type="schedule_shutdown",
                action="Enable Auto-shutdown 10PM-6AM",
                savings=round(savings, 2),
                confidence=70.0,
                reason="Server runs 24/7. Scheduled shutdowns during off-hours can save 15%"
            ))
        
        # Storage optimization
        if instance.storage_usage > 85:
            recommendations.append(RecommendationItem(
                type="cleanup",
                action="Clean up stored data",
                savings=0,  # No cost savings, but prevents problems
                confidence=80.0,
                reason="Storage at 85%+. Cleanup prevents slowdowns and failures."
            ))
        
        return recommendations
    
    @staticmethod
    def _estimate_region_savings(instance: Instance) -> float:
        """Estimate cost savings from region change"""
        # This is simplified - in reality, check pricing API
        region_multipliers = {
            "us-east-1": 1.0,
            "us-west-2": 1.05,
            "eu-west-1": 1.15,
            "ap-south-1": 0.75,  # Cheaper
            "ap-southeast-1": 0.85,
        }
        
        current_multiplier = region_multipliers.get(instance.region, 1.0)
        cheapest_multiplier = min(region_multipliers.values())
        
        if current_multiplier > cheapest_multiplier:
            savings = instance.monthly_cost * (current_multiplier - cheapest_multiplier)
            return round(savings, 2)
        
        return 0
    
    @staticmethod
    def _generate_ai_summary(instance: Instance, recommendations: List[RecommendationItem]) -> str:
        """Generate AI-powered summary using pattern recognition"""
        
        # Analyze patterns without external API (fallback method)
        summary_parts = []
        
        # Utilization analysis
        if instance.cpu_usage < 30:
            summary_parts.append(f"🔍 CPU is underutilized at {instance.cpu_usage}%. ")
        elif instance.cpu_usage > 80:
            summary_parts.append(f"⚠️ CPU usage is high at {instance.cpu_usage}%. ")
        
        if instance.ram_usage < 30:
            summary_parts.append(f"Memory is underutilized at {instance.ram_usage}%. ")
        
        if instance.storage_usage > 80:
            summary_parts.append(f"⚠️ Storage nearly full at {instance.storage_usage}%. ")
        
        # Recommendations summary
        if recommendations:
            total_savings = sum(r.savings for r in recommendations)
            summary_parts.append(f"💰 Total potential savings: ${total_savings:.2f}/month. ")
            summary_parts.append(f"Top recommendation: {recommendations[0].action}")
        else:
            summary_parts.append("✅ Instance is well-optimized. No changes recommended.")
        
        # Uptime analysis
        if instance.downtime_hours > 0:
            uptime_pct = (instance.uptime_hours / (instance.uptime_hours + instance.downtime_hours)) * 100
            summary_parts.append(f"⏱️ Availability: {uptime_pct:.1f}%")
        
        return " ".join(summary_parts) if summary_parts else "No analysis available"
    
    @staticmethod
    def call_openai_api(instance: Instance, recommendations: List[RecommendationItem]) -> str:
        """Call OpenAI API for advanced analysis (optional premium feature)"""
        try:
            import openai
            openai.api_key = OPENAI_API_KEY
            
            if OPENAI_API_KEY == "your-openai-api-key-here":
                logger.warning("OpenAI API key not configured")
                return None
            
            prompt = f"""
            Analyze this cloud server instance and provide recommendations in simple language:
            
            Instance: {instance.name}
            CPU Usage: {instance.cpu_usage}%
            RAM Usage: {instance.ram_usage}%
            Storage Usage: {instance.storage_usage}%
            Monthly Cost: ${instance.monthly_cost}
            Region: {instance.region}
            Uptime: {instance.uptime_hours} hours
            
            Recommendations:
            {chr(10).join([f"- {r.action}: Save ${r.savings}" for r in recommendations])}
            
            Provide a 2-3 sentence summary suitable for non-technical users.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return None