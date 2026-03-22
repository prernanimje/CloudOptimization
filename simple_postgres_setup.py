"""
Simple PostgreSQL Database and Tables Setup
"""
import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Parse DATABASE_URL
database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/cloud_optimization"
)

# Extract credentials from URL
# Format: postgresql://user:password@host:port/dbname
parts = database_url.replace("postgresql://", "").split("@")
password = parts[0].split(":")[1]
user = parts[0].split(":")[0]
host_port_db = parts[1]
host = host_port_db.split(":")[0]
port = host_port_db.split(":")[1].split("/")[0]
dbname = host_port_db.split("/")[1]

print(f"🚀 PostgreSQL Database Setup")
print(f"📍 Host: {host}")
print(f"📍 Port: {port}")
print(f"📍 Database: {dbname}")
print(f"📍 User: {user}\n")

try:
    # Connect to default postgres database to create new database
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database="postgres"
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{dbname}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"📦 Creating database '{dbname}'...")
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(dbname)))
        print(f"✅ Database '{dbname}' created successfully\n")
    else:
        print(f"✅ Database '{dbname}' already exists\n")
    
    cursor.close()
    conn.close()
    
    # Connect to the new database and create tables
    print("📊 Creating tables...")
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=dbname
    )
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ Table 'users' created")
    
    # Create instances table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS instances (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            cpu_usage FLOAT DEFAULT 0,
            ram_usage FLOAT DEFAULT 0,
            storage_usage FLOAT DEFAULT 0,
            storage_capacity FLOAT DEFAULT 50,
            uptime_hours INTEGER DEFAULT 0,
            downtime_hours INTEGER DEFAULT 0,
            region VARCHAR(255),
            monthly_cost FLOAT DEFAULT 0,
            status VARCHAR(50) DEFAULT 'healthy',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ Table 'instances' created")
    
    # Create metrics table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
            id SERIAL PRIMARY KEY,
            instance_id INTEGER NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
            cpu_usage FLOAT,
            ram_usage FLOAT,
            storage_usage FLOAT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ Table 'metrics' created")
    
    # Create health_alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS health_alerts (
            id SERIAL PRIMARY KEY,
            instance_id INTEGER NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
            alert_type VARCHAR(50),
            severity VARCHAR(50),
            message TEXT,
            email_sent BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        )
    """)
    print("✅ Table 'health_alerts' created")
    
    # Create indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_instances_name ON instances(name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_instances_region ON instances(region)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_instance_id ON metrics(instance_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_health_alerts_instance_id ON health_alerts(instance_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
    print("✅ Indexes created")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("\n🔍 Verification - Tables in PostgreSQL:")
    
    # Verify tables
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=dbname
    )
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    
    tables = cursor.fetchall()
    for table in tables:
        print(f"   ✅ {table[0]}")
    
    cursor.close()
    conn.close()
    
    print("\n✨ Setup complete! PostgreSQL database and tables are ready.")
    
except psycopg2.OperationalError as e:
    print(f"❌ Connection Error: {e}")
    print("\nPlease check:")
    print("  • PostgreSQL is running")
    print("  • Credentials in .env are correct (DATABASE_URL)")
    print("  • Host and port are accessible")
except Exception as e:
    print(f"❌ Error: {e}")
