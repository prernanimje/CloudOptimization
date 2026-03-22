import os
import requests
import json

api_key = "AIzaSyC8znkKbp9PceaGVWp0WQiCfLBNg8VDsq8"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    print("Available Models:")
    models = response.json().get('models', [])
    for m in models:
        print(f"{m['name']} - {m['version']}")
except Exception as e:
    print(f"Error: {e}")
