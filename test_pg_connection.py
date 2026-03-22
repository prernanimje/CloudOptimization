import os
import sys
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

load_dotenv()

url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres%40123@localhost:5432/cloud_optimization")

print(f"Testing connection with URL: {url}")

try:
    parsed = urlparse(url)
    conn = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip("/")
    )
    print("✅ Connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)
