import os
import sys
import json
import threading
import subprocess
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from cryptography.fernet import Fernet
import requests
import webview  # <-- NEW IMPORT

CLOUD_API_URL = "https://aravindtupakula.pythonanywhere.com" # Replace with your live URL

# --- 1. SETUP PATHS FOR PYINSTALLER ---
if getattr(sys, 'frozen', False):
    # This points to the hidden temp folder for your React UI assets
    base_dir = sys._MEIPASS
    # This points to the actual folder where the user placed the .exe
    exe_dir = os.path.dirname(sys.executable)
else:
    base_dir = os.path.abspath(".")
    exe_dir = base_dir

static_folder = os.path.join(base_dir, 'out')
# Now the data file saves permanently right next to the .exe file
data_file_path = os.path.join(exe_dir, 'cv-data.json')
license_file_path = os.path.join(os.path.expanduser("~"), '.my_app_license.enc')

app = Flask(__name__, static_folder=static_folder, static_url_path='')
CORS(app)

# --- 2. ENCRYPTION & HWID SECURITY ---
SECRET_KEY = b'gznDWrZhYODah_QAWOjobM86d6gjB8j29rOJvCRwJiA=' 
cipher = Fernet(SECRET_KEY)

def save_encrypted_license(license_key):
    encrypted_key = cipher.encrypt(license_key.encode())
    with open(license_file_path, "wb") as f:
        f.write(encrypted_key)

def load_encrypted_license():
    if not os.path.exists(license_file_path):
        return None
    try:
        with open(license_file_path, "rb") as f:
            decrypted_str = cipher.decrypt(f.read()).decode('utf-8')
            # Parse the JSON string and return ONLY the token value for syncing
            return json.loads(decrypted_str).get("token")
    except:
        return None

def get_hwid():
    try:
        hwid = subprocess.check_output('wmic csproduct get uuid').decode().split('\n')[1].strip()
        return hwid
    except Exception:
        return "fallback-hwid-error"


def silent_startup_sync():
    key = load_encrypted_license()
    if not key or not os.path.exists(data_file_path):
        return
        
    try:
        with open(data_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        requests.post(f"{CLOUD_API_URL}/admin/sync", json={
            "license_key": key,
            "cv_data": json.dumps(data)
        }, timeout=10)
    except:
        pass # Fails silently if offline, as requested 

# --- 3. FLASK API ROUTES ---
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    clean_path = path.rstrip('/')
    
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
        
    if os.path.exists(os.path.join(app.static_folder, clean_path + '.html')):
        return send_from_directory(app.static_folder, clean_path + '.html')
        
    if os.path.exists(os.path.join(app.static_folder, clean_path, 'index.html')):
        return send_from_directory(app.static_folder, os.path.join(clean_path, 'index.html'))
        
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/auth/verify', methods=['POST'])
def verify_with_cloud():
    data = request.json
    license_key = data.get("token")
    
    try:
        response = requests.post(f"{CLOUD_API_URL}/verify", json={
            "license_key": license_key,
            "hwid": get_hwid()
        }, timeout=5)
        
        result = response.json()
        return jsonify(result)
        
    except requests.exceptions.RequestException:
        return jsonify({"authorized": False, "message": "Could not connect to verification server. Check your internet."})

@app.route('/api/auth/save', methods=['POST'])
def save_license():
    data = request.json
    token_data = {
        "token": data.get("token"),
        "hwid": get_hwid()
    }
    try:
        encrypted_data = cipher.encrypt(json.dumps(token_data).encode('utf-8'))
        with open(license_file_path, 'wb') as f:
            f.write(encrypted_data)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/cv-data', methods=['GET'])
def get_cv_data():
    try:
        if not os.path.exists(data_file_path):
            return jsonify({"success": True, "data": None})
        with open(data_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        print("Error reading CV data:", e)
        return jsonify({"success": False, "error": "Failed to read data"}), 500

@app.route('/api/cv-data', methods=['POST'])
def save_cv_data():
    try:
        data = request.json
        with open(data_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500



# --- 4. SERVER THREADING & LAUNCHER LOGIC ---
def run_flask():
    # Running on 127.0.0.1 is safer for local bindings
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def create_launcher():
    # 1. Trigger the silent cloud backup in the background
    threading.Thread(target=silent_startup_sync, daemon=True).start()

    # 2. Start Flask in a background daemon thread
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Give Flask a fraction of a second to spin up before the UI connects
    time.sleep(1)
    
    # 2. Create the native desktop window pointing to the Flask server
    window = webview.create_window(
        title="",
        url="http://127.0.0.1:5000",
        width=1300,
        height=850,
        min_size=(900, 700),
        text_select=True # Allows users to highlight/copy their text on the CV canvas
    )
    
    # 3. Start the window loop
    # CRITICAL: debug=False completely disables F12 / Inspect Element
    webview.start(debug=False, private_mode=False)

if __name__ == '__main__':
    create_launcher()