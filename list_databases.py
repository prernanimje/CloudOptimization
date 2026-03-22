import psycopg2

try:
    # Connect to default postgres database to list all databases
    conn = psycopg2.connect(
        host='localhost',
        database='postgres',
        user='postgres',
        password='Postgres@123'
    )
    cur = conn.cursor()
    
    # List all databases
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    databases = cur.fetchall()
    
    print("📊 Available databases:")
    for db in databases:
        print(f"  - {db[0]}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f'Error: {str(e)}')
