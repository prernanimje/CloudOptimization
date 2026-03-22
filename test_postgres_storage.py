"""
Test PostgreSQL Connection and Verify Database Storage
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import SessionLocal, init_db
from app.config import DATABASE_URL
from app.models import User, Instance
from app.utils.security import get_password_hash

print("🚀 PostgreSQL Connection & Storage Test\n")
print(f"📍 Database URL: {DATABASE_URL}\n")

try:
    # Step 1: Initialize database
    print("1️⃣  Initializing database...")
    init_db()
    print("   ✅ Database initialized\n")
    
    # Step 2: Test connection
    print("2️⃣  Testing connection...")
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"   ✅ PostgreSQL Version: {version.split(',')[0]}\n")
    
    # Step 3: Check existing tables
    print("3️⃣  Checking tables...")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result.fetchall()]
        for table in tables:
            print(f"   ✅ {table}")
    print()
    
    # Step 4: Test data insertion
    print("4️⃣  Testing data insertion...")
    db = SessionLocal()
    
    # Create a test user
    test_user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    print(f"   ✅ Created test user: {test_user.username} (ID: {test_user.id})\n")
    
    # Create a test instance
    test_instance = Instance(
        name="server-prod-01",
        region="us-east-1",
        cpu_usage=45.5,
        ram_usage=62.3,
        storage_usage=75.8,
        monthly_cost=250.50,
        status="healthy"
    )
    db.add(test_instance)
    db.commit()
    db.refresh(test_instance)
    print(f"   ✅ Created test instance: {test_instance.name} (ID: {test_instance.id})")
    print(f"      - CPU: {test_instance.cpu_usage}%, RAM: {test_instance.ram_usage}%, Storage: {test_instance.storage_usage}%")
    print(f"      - Region: {test_instance.region}, Cost: ${test_instance.monthly_cost}\n")
    
    # Step 5: Verify data retrieval
    print("5️⃣  Verifying data retrieval...")
    all_users = db.query(User).all()
    all_instances = db.query(Instance).all()
    print(f"   ✅ Found {len(all_users)} user(s) in database")
    print(f"   ✅ Found {len(all_instances)} instance(s) in database\n")
    
    # List all users
    print("   📋 Users:")
    for user in all_users:
        print(f"      - {user.username} ({user.email})")
    print()
    
    # List all instances
    print("   📋 Instances:")
    for instance in all_instances:
        print(f"      - {instance.name} ({instance.region}) - {instance.status}")
    print()
    
    db.close()
    
    print("✨ All tests passed! PostgreSQL is connected and storing data correctly.\n")
    print("📊 Summary:")
    print("   ✅ PostgreSQL connected")
    print("   ✅ Database initialized")
    print("   ✅ All tables created")
    print("   ✅ Data insertion working")
    print("   ✅ Data retrieval working")
    
except Exception as e:
    print(f"❌ Error: {e}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)
