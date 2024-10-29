from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from werkzeug.security import check_password_hash, generate_password_hash
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['JWT_SECRET_KEY'] = 'secret' # key for JWT
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase" # MongoDB Connection

# MongoDB Configuration
mongo = PyMongo(app)
uri = "mongodb+srv://albertbw011:608OWGVxf3weg5qD@cluster0.tubyi.mongodb.net/"

# mongo db password: 608OWGVxf3weg5qD

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['HaaS']
users_collection = db['Users']

# Initialize JWT
jwt = JWTManager(app)

@app.route('/')
def index():
    return "Welcome to the Flask server!"

# test user
# username: testuser
# password: password123

@app.route('/login', methods=['POST', 'OPTIONS'])  # Explicitly allow OPTIONS
def login():
    if request.method == 'OPTIONS':
        # Preflight request
        return jsonify({"message": "CORS preflight success"}), 200

    # For POST request
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Find user in database
    user = users_collection.find_one({"username": username})

    # Check if the credentials are valid
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username)
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "username": username
        }), 200
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
    
    # Basic validation for username and password (adjust as needed)
    if len(username) < 3:
        return jsonify({"message": "Username must be at least 3 characters long"}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400
    
    # check if user already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 409
    
    # Create new user
    new_user = {
        "username": username,
        "password": generate_password_hash(password)
    }

    try:
        users_collection.insert_one(new_user)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"message": "Registration failed", "error": str(e)}), 500

# protected route for user info
@app.route('/home/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()
    user = users_collection.find_one({"_id": ObjectId(current_user_id)})
    
    if user:
        return jsonify({
            "username": user['username']
        }), 200
    
    return jsonify({"message": "User not found"}), 200

if __name__ == '__main__':
    app.run(debug=True)
