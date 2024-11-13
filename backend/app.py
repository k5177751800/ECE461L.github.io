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
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

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

@app.before_request
def handle_options_requests():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS preflight success"}), 200


# Assuming `db` is your MongoDB instance from PyMongo
hardware_sets_collection = db['HardwareSets']
projects_collection = db['Projects']

# Initialize with some sample hardware sets (run once, then remove or comment out)
# if hardware_sets_collection.count_documents({}) == 0:
#     hardware_sets_collection.insert_many([
#         {"name": "HWSet1", "available": 100, "capacity": 100},
#         {"name": "HWSet2", "available": 100, "capacity": 100},
#         {"name": "HWSet3", "available": 100, "capacity": 100}
#     ])



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
        "password": generate_password_hash(password),
        "num_projects": 0
    }

    try:
        users_collection.insert_one(new_user)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"message": "Registration failed", "error": str(e)}), 500


@app.route('/hardware/checkin', methods=['POST'])
def check_in():
    data = request.json
    hwset_name = data.get('name')
    amount = data.get('amount')
    projectid = data.get('projectId')
    hw_set = db['HardwareSets'].find_one({"name": hwset_name})

    if hwset_name and amount:
        # Find and update hardware set quantity
        current_available = hw_set["available"]
        max_capacity = hw_set["capacity"]

        # calculate new available amount, making sure to not exceed capacity
        new_available = min(current_available + amount, max_capacity)

        update_hardware_result = db.HardwareSets.find_one_and_update(
            {"name": hwset_name},
            {"$set": {"available": new_available}},
            return_document=True
        )

        update_project_result = projects_collection.find_one_and_update(
            {"id": projectid},
            {
                "$inc": {f"hardware.{hwset_name}": -amount}
            }
        )

        if update_project_result and update_hardware_result:
            return jsonify({
                "message": "Check-in successful", 
                "available": update_hardware_result["available"],
                "checked_out": max(0, update_project_result["hardware"].get(hwset_name, 0))
                }), 200
    return jsonify({"message": "Check-in failed"}), 400


@app.route('/hardware/checkout', methods=['POST', 'OPTIONS'])
def check_out():
    if request.method == 'OPTIONS':
        # Send appropriate headers in the response to pass the preflight check
        response = jsonify({"message": "CORS preflight success"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    # Handle the POST request
    data = request.json
    hwset_name = data.get('name')
    amount = data.get('amount')
    projectid = data.get('projectId')

    if hwset_name and amount:
        # Ensure enough quantity is available
        update_hardware_result = db.HardwareSets.find_one_and_update(
            {"name": hwset_name, "available": {"$gte": amount}},
            {"$inc": {"available": -amount}},
            return_document=True
        )

        # add quantity to project list
        update_project_result = projects_collection.find_one_and_update(
            {"id": projectid},
            {
                "$inc": {f"hardware.{hwset_name}": amount}
            },
            return_document=True
        )

        if update_hardware_result and update_project_result:
            return jsonify({
                "message": "Check-out successful", 
                "available": update_hardware_result["available"],
                "checked_out": update_project_result["hardware"].get(hwset_name, 0)
                }), 200
    return jsonify({"message": "Check-out failed"}), 400

# retrieve hardware set from database
@app.route('/hardware', methods=['GET'])
def get_hardware_sets():
    try:
        hardware_sets = list(hardware_sets_collection.find({}, {"_id": 0}))  # Exclude MongoDB ID
        return jsonify({"hardwareSets": hardware_sets}), 200
    except Exception as e:
        print(f"Error retrieving hardware sets: {e}")
        return jsonify({"hardwareSets": [], "error": "Failed to retrieve hardware sets"}), 500
    
# retrieve projects from database
@app.route('/projects/<string:user_id>', methods=['GET'])
def get_projects(user_id):
    try:
        projects = list(projects_collection.find({"users": user_id}, {"_id": 0} ))

        # remove projects with 0 hardware allocated
        for project in projects:
            project['hardware'] = {k: v for k, v in project['hardware'].items() if v > 0}

        return jsonify({"projects": projects}), 200
    except Exception as e:
        print(f"Error retrieving projects: {e}")
        return jsonify({"projects": [], "error": "Failed to retrieve projects"}), 500
    
@app.route('/projects/addproject', methods=['POST'])
def add_project():
    data = request.json
    project_name = data.get("name") or "New project"
    description = data.get("description") or "Default Description"
    user = data.get("user")

    try:
        curr_numprojects = users_collection.find_one({"username": user})['num_projects']

        new_project = {
            "name": project_name,
            "users": [user],
            "description": description,
            "hardware": {},
            "id": f"{user}_{curr_numprojects + 1}",
            "joined": False
        }

        result = projects_collection.insert_one(new_project)
        if not result.acknowledged:
            raise Exception("Failed to insert project")
        
        users_collection.update_one(
            {"username": user},
            {"$set": {"num_projects": curr_numprojects + 1}}
        )
        projects = list(projects_collection.find({"users": user}, {"_id": 0} ))

        return jsonify({"projects": projects}), 200
    except Exception as e:
        print(f"Error updating projects: {e}")
        return jsonify({"projects": [], "error": "Failed to update projects"}), 500

@app.route('/projects/toggleproject', methods=['POST'])
def toggle_project():
    data = request.json
    user = data.get("user")
    project_id = data.get("projectid")
    curr_status = projects_collection.find_one({"id": project_id})["joined"]

    try:
        result = projects_collection.find_one_and_update(
            {"id": project_id},
            {"$set": {"joined": not curr_status}})
        projects = list(projects_collection.find({"user": user}, {"_id": 0}))
        if result:
            return jsonify({"new_status": curr_status}), 200
    except Exception as e:
        print(f"Error toggling project status: {e}")
        return jsonify({"projects": [], "error": "Failed to update projects"}), 500

# protected route for user info
@app.route('/home/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        current_username = get_jwt_identity()
        user = users_collection.find_one({"username": current_username})
        
        if user:
            return jsonify({
                "username": user['username']
            }), 200
        
        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f'Error in get_user: {str(e)}')
        return jsonify({"message": "An error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)


