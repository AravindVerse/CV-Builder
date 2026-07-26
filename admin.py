import requests
import secrets
from datetime import datetime, timedelta

# 1. Put the live Render URL here once you deploy cloud_api.py
CLOUD_API_URL = "https://aravindtupakula.pythonanywhere.com"  # Replace with your live URL
ADMIN_SECRET = "super_secret_admin_password_123"

def generate_key(customer_name, days_valid):
    new_key = "CV-" + secrets.token_hex(6).upper() 
    expiry_date = datetime.now() + timedelta(days=days_valid)
    
    try:
        response = requests.post(f"{CLOUD_API_URL}/admin/create", json={
            "admin_secret": ADMIN_SECRET,
            "license_key": new_key,
            "customer_name": customer_name,
            "expiry_date": expiry_date.isoformat()
        }, timeout=10)
        
        if response.json().get('success'):
            print(f"\n=========================================")
            print(f"Success! Give this key to {customer_name}:")
            print(f"KEY: {new_key}")
            print(f"Expires on: {expiry_date.strftime('%Y-%m-%d')}")
            print(f"=========================================\n")
        else:
            print("Server error:", response.json().get('error'))
    except Exception as e:
        print("Failed to connect to the cloud database server:", e)

# Run it to generate a 30-day key for a user
generate_key("Test User", 30)