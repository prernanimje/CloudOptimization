import psycopg2

try:
    conn = psycopg2.connect(
        host='localhost',
        database='cloud_optimization',
        user='postgres',
        password='Postgres@123'
    )
    cur = conn.cursor()
    
    # Get ALL users
    cur.execute('SELECT id, username, email, created_at FROM users ORDER BY id')
    users = cur.fetchall()
    
    print(f'✅ Total users in database: {len(users)}\n')
    
    if users:
        print('All users:')
        for user in users:
            print(f'  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Created: {user[3]}')
    
    cur.close()
    conn.close()
except Exception as e:
    print(f'Error: {str(e)}')
