from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Dummy users for login
users = {
    "testuser": "password123"
}

@app.route('/')
def index():
    return "Welcome to the Flask server!"

@app.route('/login', methods=['POST', 'OPTIONS'])  # Explicitly allow OPTIONS
def login():
    if request.method == 'OPTIONS':
        # Preflight request
        return jsonify({"message": "CORS preflight success"}), 200

    # For POST request
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if the credentials are valid
    if username in users and users[username] == password:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True)
