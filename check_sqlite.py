import sqlite3

db_path = "e:\\cloudptimization\\backend\\cloud_optimization.db"

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all users
    cur.execute('SELECT id, username, email, created_at FROM users ORDER BY id')
    users = cur.fetchall()
    
    print(f"✅ Total users in SQLite database: {len(users)}\n")
    
    if users:
        print('Users saved in cloud_optimization.db:')
        for user in users:
            print(f'  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Created: {user[3]}')
    
    cur.close()
    conn.close()
except Exception as e:
    print(f'Error: {str(e)}')
