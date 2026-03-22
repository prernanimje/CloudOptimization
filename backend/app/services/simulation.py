import asyncio
import random
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Instance, Metric
from .optimizer import OptimizerService

logger = logging.getLogger(__name__)

class SimulationEngine:
    """
    Real-Time Cloud Cost Simulation & Optimization Engine
    Combines:
    1. Auto metric generator (simulated telemetry)
    2. Background cost calculation
    3. Auto optimisation engine
    """

    def __init__(self, interval_seconds: int = 15):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task = None

    def start(self):
        """Start the background simulation loop"""
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._simulation_loop())
            logger.info(f"🚀 Started Real-Time Simulation Engine (Interval: {self.interval_seconds}s)")

    def stop(self):
        """Stop the background simulation loop"""
        self.is_running = False
        if self._task:
            self._task.cancel()
            logger.info("🛑 Stopped Real-Time Simulation Engine")

    async def _simulation_loop(self):
        while self.is_running:
            try:
                await self._run_simulation_cycle()
            except Exception as e:
                logger.error(f"Error in simulation cycle: {str(e)}")
            
            await asyncio.sleep(self.interval_seconds)

    async def _run_simulation_cycle(self):
        """Run a single cycle of telemetry, cost calc, and optimization"""
        db: Session = SessionLocal()
        try:
            instances = db.query(Instance).all()
            if not instances:
                return

            for instance in instances:
                # 1. Auto Metric Generator (Simulated Telemetry)
                # Introduce slight random variations based on current usage
                # Keep values within 0-100%
                cpu_delta = random.uniform(-10.0, 10.0)
                ram_delta = random.uniform(-5.0, 5.0)
                # Simulate storage growth, with occasional cleanup when it gets too high
                if getattr(instance, 'storage_usage', 0) > 85.0:
                    storage_delta = random.uniform(-30.0, -10.0) # Simulate log rotation / cleanup
                else:
                    storage_delta = random.uniform(-1.0, 2.0)
                
                new_cpu = max(0.0, min(100.0, instance.cpu_usage + cpu_delta))
                new_ram = max(0.0, min(100.0, instance.ram_usage + ram_delta))
                new_storage = max(0.0, min(100.0, instance.storage_usage + storage_delta))
                
                # Create a metric record
                metric = Metric(
                    instance_id=instance.id,
                    cpu_usage=new_cpu,
                    ram_usage=new_ram,
                    storage_usage=new_storage,
                    timestamp=datetime.utcnow()
                )
                db.add(metric)
                
                # Update instance metrics
                instance.cpu_usage = new_cpu
                instance.ram_usage = new_ram
                instance.storage_usage = new_storage
                
                # 2. Background Cost Calculation
                # Base cost purely on instance type/storage, or for simulation, fluctuate it
                # Example: Calculate a dynamic per-minute cost based on actual CPU/RAM usage 
                # (Simulating an auto-scaling environment where cost depends on usage)
                base_hourly_rate = 0.05
                usage_multiplier = 1.0 + (new_cpu / 100.0)
                simulated_cost_increment = (base_hourly_rate * usage_multiplier) * (self.interval_seconds / 3600.0)
                
                # Add it to monthly_cost or another dynamic property
                instance.monthly_cost += simulated_cost_increment
                
                # 3. Auto Optimisation Engine
                # We can call the optimizer to see if state changed, e.g. update health status or logs
                analysis_result = OptimizerService.analyze_instance(instance)
                
                # If waste is too high, set status to warning
                if analysis_result.waste_percentage > 50:
                    instance.status = "warning"
                elif new_cpu >= 90 or new_ram >= 90:
                    instance.status = "critical"
                else:
                    instance.status = "healthy"
                
                logger.debug(f"Simulated {instance.name}: CPU {new_cpu:.1f}%, Cost ${instance.monthly_cost:.4f}, Waste {analysis_result.waste_percentage:.1f}%")

            db.commit()
            logger.info(f"✅ Simulation cycle completed for {len(instances)} instances.")
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

# Global instance
simulation_engine = SimulationEngine()
