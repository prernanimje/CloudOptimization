import psycopg2
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

try:
    conn = psycopg2.connect(
        host='localhost',
        database='cloud_optimization',
        user='postgres',
        password='Postgres@123'
    )
    cur = conn.cursor()
    
    # Insert a test user
    hashed_pwd = get_password_hash("TestPass123!")
    cur.execute(
        "INSERT INTO users (email, username, hashed_password, is_active) VALUES (%s, %s, %s, %s)",
        ('directtest@example.com', 'directtest', hashed_pwd, True)
    )
    conn.commit()
    print("✅ Test user inserted successfully")
    
    # Verify it was inserted
    cur.execute("SELECT COUNT(*) FROM users")
    count = cur.fetchone()[0]
    print(f"Total users now: {count}")
    
    # Show the new user
    cur.execute("SELECT id, username, email FROM users WHERE email='directtest@example.com'")
    user = cur.fetchone()
    if user:
        print(f"Inserted user: ID={user[0]}, Username={user[1]}, Email={user[2]}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
