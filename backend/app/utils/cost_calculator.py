"""Cost calculation utilities"""
import logging

logger = logging.getLogger(__name__)


class CostCalculator:
    """Calculate cloud costs based on resource usage"""
    
    # Typical pricing per hour (simplified)
    PRICING = {
        "cpu_per_hour": 0.05,      # $0.05 per CPU core per hour
        "ram_per_gb_hour": 0.01,   # $0.01 per GB RAM per hour
        "storage_per_gb_month": 0.023,  # $0.023 per GB per month
    }
    
    @staticmethod
    def estimate_monthly_cost(cpus: int, ram_gb: int, storage_gb: int) -> float:
        """
        Estimate monthly cost for resources
        
        Args:
            cpus: Number of CPU cores
            ram_gb: RAM in GB
            storage_gb: Storage in GB
            
        Returns:
            Estimated monthly cost in dollars
        """
        hours_per_month = 730  # Average hours in a month
        
        cpu_cost = cpus * CostCalculator.PRICING['cpu_per_hour'] * hours_per_month
        ram_cost = ram_gb * CostCalculator.PRICING['ram_per_gb_hour'] * hours_per_month
        storage_cost = storage_gb * CostCalculator.PRICING['storage_per_gb_month']
        
        return round(cpu_cost + ram_cost + storage_cost, 2)
    
    @staticmethod
    def calculate_daily_cost(monthly_cost: float) -> float:
        """Convert monthly cost to daily"""
        return round(monthly_cost / 30, 2)
    
    @staticmethod
    def calculate_hourly_cost(monthly_cost: float) -> float:
        """Convert monthly cost to hourly"""
        return round(monthly_cost / 730, 4)
    
    @staticmethod
    def calculate_waste(usage_percentage: float, monthly_cost: float) -> float:
        """
        Calculate wasted cost based on usage percentage
        
        Args:
            usage_percentage: Resource usage 0-100%
            monthly_cost: Monthly cost in dollars
            
        Returns:
            Estimated wasted cost
        """
        waste_percentage = max(0, 100 - usage_percentage)
        return round(monthly_cost * (waste_percentage / 100), 2)
    
    @staticmethod
    def estimate_savings_from_downsize(current_cost: float, downsize_percent: float = 0.4) -> float:
        """
        Estimate savings from downsizing instance
        
        Args:
            current_cost: Current monthly cost
            downsize_percent: Cost reduction percentage (default 40%)
            
        Returns:
            Estimated monthly savings
        """
        return round(current_cost * downsize_percent, 2)
    
    @staticmethod
    def estimate_savings_from_region_change(current_cost: float, current_region: str, target_region: str) -> float:
        """
        Estimate savings from changing region
        
        Args:
            current_cost: Current monthly cost
            current_region: Current region
            target_region: Target region
            
        Returns:
            Estimated monthly savings
        """
        # Regional cost multipliers (relative to us-east-1)
        region_multipliers = {
            "us-east-1": 1.0,
            "us-west-2": 1.05,
            "eu-west-1": 1.15,
            "ap-south-1": 0.75,
            "ap-southeast-1": 0.85,
        }
        
        current_mult = region_multipliers.get(current_region, 1.0)
        target_mult = region_multipliers.get(target_region, 1.0)
        
        if target_mult < current_mult:
            cost_reduction = current_cost * (current_mult - target_mult)
            return round(cost_reduction, 2)
        
        return 0.0
