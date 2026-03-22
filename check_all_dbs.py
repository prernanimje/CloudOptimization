import psycopg2

databases = ['cloud_optimization', 'Backend', 'arithpipe']

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
        
        # Check if users table exists
        cur.execute(f"SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users' AND table_schema='public')")
        table_exists = cur.fetchone()[0]
        
        if table_exists:
            cur.execute('SELECT COUNT(*) FROM users')
            count = cur.fetchone()[0]
            print(f"📊 Database '{db_name}': {count} users")
            
            # Show users
            cur.execute('SELECT id, username, email FROM users ORDER BY id')
            users = cur.fetchall()
            for user in users:
                print(f"   └─ ID {user[0]}: {user[1]} ({user[2]})")
        else:
            print(f"📊 Database '{db_name}': no 'users' table")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Database '{db_name}': Error - {str(e)}")
