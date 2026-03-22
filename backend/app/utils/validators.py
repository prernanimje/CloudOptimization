"""Data validation utilities"""
import logging
import re

logger = logging.getLogger(__name__)


class InstanceValidator:
    """Validate instance data"""
    
    @staticmethod
    def validate_instance_name(name: str) -> bool:
        """
        Validate instance name
        
        Requirements:
        - 3-50 characters
        - Alphanumeric, hyphens, underscores
        - No spaces
        
        Args:
            name: Instance name to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not name or not isinstance(name, str):
            return False
        
        if len(name) < 3 or len(name) > 50:
            return False
        
        # Allow alphanumeric, hyphens, underscores
        pattern = r'^[a-zA-Z0-9\-_]+$'
        return bool(re.match(pattern, name))
    
    @staticmethod
    def validate_cpu_usage(cpu: float) -> bool:
        """Validate CPU usage percentage"""
        try:
            cpu_float = float(cpu)
            return 0 <= cpu_float <= 100
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_ram_usage(ram: float) -> bool:
        """Validate RAM usage percentage"""
        try:
            ram_float = float(ram)
            return 0 <= ram_float <= 100
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_storage_usage(storage: float) -> bool:
        """Validate storage usage percentage"""
        try:
            storage_float = float(storage)
            return 0 <= storage_float <= 100
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_region(region: str) -> bool:
        """
        Validate AWS region code
        
        Args:
            region: Region code (e.g., 'us-east-1')
            
        Returns:
            True if valid, False otherwise
        """
        valid_regions = [
            "us-east-1", "us-east-2", "us-west-1", "us-west-2",
            "eu-west-1", "eu-west-2", "eu-central-1",
            "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
            "ca-central-1", "sa-east-1"
        ]
        return region.strip() in valid_regions
    
    @staticmethod
    def validate_monthly_cost(cost: float) -> bool:
        """Validate monthly cost"""
        try:
            cost_float = float(cost)
            return cost_float >= 0
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_instance_data(data: dict) -> tuple[bool, list]:
        """
        Validate complete instance data
        
        Args:
            data: Dictionary with instance data
            
        Returns:
            (is_valid, list_of_errors)
        """
        errors = []
        
        # Validate name
        if 'name' not in data or not InstanceValidator.validate_instance_name(data['name']):
            errors.append("Invalid instance name")
        
        # Validate CPU
        if 'cpu_usage' in data and not InstanceValidator.validate_cpu_usage(data['cpu_usage']):
            errors.append("Invalid CPU usage percentage")
        
        # Validate RAM
        if 'ram_usage' in data and not InstanceValidator.validate_ram_usage(data['ram_usage']):
            errors.append("Invalid RAM usage percentage")
        
        # Validate Storage
        if 'storage_usage' in data and not InstanceValidator.validate_storage_usage(data['storage_usage']):
            errors.append("Invalid storage usage percentage")
        
        # Validate Region
        if 'region' in data and not InstanceValidator.validate_region(data['region']):
            errors.append("Invalid region")
        
        # Validate Cost
        if 'monthly_cost' in data and not InstanceValidator.validate_monthly_cost(data['monthly_cost']):
            errors.append("Invalid monthly cost")
        
        return len(errors) == 0, errors
