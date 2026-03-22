import requests
import json

API_URL = "http://localhost:8000/api/auth/register"

test_user = {
    "email": "apitest@example.com",
    "username": "apitest",
    "password": "ApiTest123!"
}

try:
    print("🚀 Testing registration API...")
    response = requests.post(API_URL, json=test_user, timeout=5)
    print(f"✅ Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("\n✅ Registration successful via API!")
except requests.exceptions.ConnectionError as e:
    print(f"❌ Cannot connect to backend at {API_URL}")
    print(f"Error: {str(e)}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
