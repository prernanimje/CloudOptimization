"""
PostgreSQL Database Setup Script
Creates the cloud_optimization database and all tables
"""
import os
import sys
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from app.models import Base
from app.config import DATABASE_URL

def create_database():
    """Create the database if it doesn't exist"""
    # Parse the DATABASE_URL to extract connection info
    # Format: postgresql://user:password@host:port/dbname
    
    # Extract base URL without database name
    if DATABASE_URL.startswith('postgresql://'):
        parts = DATABASE_URL.replace('postgresql://', '').split('/')
        db_name = parts[-1]
        base_url = 'postgresql://' + '/'.join(parts[:-1]) + '/postgres'
    else:
        print("❌ Invalid DATABASE_URL format")
        return False
    
    try:
        # Connect to default postgres database
        engine = create_engine(base_url, echo=False)
        with engine.connect() as conn:
            conn.execution_options(autocommit=True)
            
            # Check if database exists
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
            if not result.fetchone():
                print(f"📦 Creating database '{db_name}'...")
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                print(f"✅ Database '{db_name}' created successfully")
            else:
                print(f"✅ Database '{db_name}' already exists")
        
        engine.dispose()
        return True
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def create_tables():
    """Create all tables using SQLAlchemy models"""
    try:
        print("\n📊 Creating tables...")
        engine = create_engine(DATABASE_URL, echo=False)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Tables created successfully:")
        print("   • users")
        print("   • instances")
        print("   • metrics")
        print("   • health_alerts")
        
        engine.dispose()
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def verify_setup():
    """Verify the database and tables exist"""
    try:
        engine = create_engine(DATABASE_URL, echo=False)
        
        with engine.connect() as conn:
            # Get list of tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            
            tables = [row[0] for row in result.fetchall()]
            
            if tables:
                print("\n🔍 Verification - Tables found:")
                for table in sorted(tables):
                    print(f"   ✅ {table}")
                return True
            else:
                print("\n⚠️  No tables found")
                return False
        
        engine.dispose()
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        return False

if __name__ == "__main__":
    print("🚀 PostgreSQL Database Setup")
    print(f"📍 Using: {DATABASE_URL}\n")
    
    # Step 1: Create database
    if not create_database():
        sys.exit(1)
    
    # Step 2: Create tables
    if not create_tables():
        sys.exit(1)
    
    # Step 3: Verify
    verify_setup()
    
    print("\n✨ Setup complete! Your PostgreSQL database is ready.")
