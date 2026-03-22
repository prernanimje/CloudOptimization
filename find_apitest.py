import psycopg2

databases = ['cloud_optimization', 'arithpipe']

for db_name in databases:
    try:
        conn = psycopg2.connect(
            host='localhost',
            database=db_name,
            user='postgres',
            password='Postgres@123',
            connect_timeout=3
        )
        cur = conn.cursor()
        
        # Check for apitest user
        cur.execute('SELECT id, email, created_at FROM users WHERE username = %s', ('apitest',))
        user = cur.fetchone()
        
        if user:
            print(f"✅ Found 'apitest' in database '{db_name}'")
            print(f"   ID: {user[0]}, Email: {user[1]}, Created: {user[2]}")
        else:
            cur.execute('SELECT COUNT(*) FROM users')
            count = cur.fetchone()[0]
            print(f"❌ 'apitest' NOT in '{db_name}' ({count} total users)")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"⚠️  Error checking '{db_name}': {str(e)}")
