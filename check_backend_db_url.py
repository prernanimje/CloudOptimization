import sys
import os

# Add backend to path
sys.path.insert(0, 'e:\\cloudptimization\\backend')

# Import the config
from app.config import DATABASE_URL

print(f"🔗 Backend DATABASE_URL: {DATABASE_URL}")

# Parse it
from urllib.parse import urlparse
parsed = urlparse(DATABASE_URL)
print(f"  Host: {parsed.hostname}")
print(f"  Port: {parsed.port}")
print(f"  Database: {parsed.path.lstrip('/')}")
print(f"  User: {parsed.username}")
