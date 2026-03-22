import requests
import json

API_URL = "http://localhost:8000/api/auth/register"

test_user = {
    "email": "testuser@example.com",
    "username": "testuser123",
    "password": "TestPassword123!"
}

try:
    response = requests.post(API_URL, json=test_user)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {str(e)}")
