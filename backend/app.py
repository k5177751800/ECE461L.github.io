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
    
# allow new users to register accounts
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # check if username and password are non-empty
    if not username or not password: 
        return jsonify({"message": "Username and password are both required"}), 400
    
    # check if user already exists
    if username in users:
        return jsonify({"message": "User already exists"}), 409
    
    users[username] = password
    return jsonify({"message": "User registered successfully"}), 201

if __name__ == '__main__':
    app.run(debug=True)
