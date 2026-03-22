"""Configuration and environment variables"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (parent of backend directory)
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, verbose=True)

# Database - PostgreSQL connection (REQUIRED)
# Must be set in .env file with DATABASE_URL variable
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please ensure .env file contains DATABASE_URL with PostgreSQL connection string."
    )

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "your-sendgrid-api-key-here")

# Email Configuration
EMAIL_FROM = os.getenv("EMAIL_FROM", "alerts@cloudoptimization.com")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")

# Frontend URL (for CORS)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Application Settings
DEBUG = os.getenv("DEBUG", "True") == "True"
APP_TITLE = "Real-Time Cloud Cost Simulation & Optimization Engine"
APP_VERSION = "1.0.0"

# Alert Thresholds
CPU_WARNING_THRESHOLD = 75  # %
CPU_CRITICAL_THRESHOLD = 90  # %
RAM_WARNING_THRESHOLD = 75  # %
RAM_CRITICAL_THRESHOLD = 90  # %
STORAGE_WARNING_THRESHOLD = 80  # %
STORAGE_CRITICAL_THRESHOLD = 95  # %

# Recommendation Thresholds
UNDERUTILIZED_CPU_THRESHOLD = 30  # % - instance using less than this
OVERPROVISIONED_RAM_THRESHOLD = 20  # % - instance using less than this
UNDERUTILIZED_STORAGE_THRESHOLD = 40  # % - instance using less than this
