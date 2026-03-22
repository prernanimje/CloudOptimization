import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        database='cloud_optimization',
        user='postgres',
        password='Postgres@123'
    )
    cur = conn.cursor()
    
    # Check if users table exists
    cur.execute("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users')")
    table_exists = cur.fetchone()[0]
    print(f'Users table exists: {table_exists}')
    
    if table_exists:
        # Count users
        cur.execute('SELECT COUNT(*) FROM users')
        user_count = cur.fetchone()[0]
        print(f'Total users in database: {user_count}')
        
        # Show all users
        cur.execute('SELECT id, username, email, created_at FROM users')
        users = cur.fetchall()
        if users:
            print('\nUsers in database:')
            for user in users:
                print(f'  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Created: {user[3]}')
        else:
            print('No users found in database')
    
    cur.close()
    conn.close()
except Exception as e:
    print(f'Error: {str(e)}')
