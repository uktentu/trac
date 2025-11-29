from flask import Flask, request, jsonify
from flask_cors import CORS
import database as db

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize database on startup
db.init_database()

# ============ Habit Routes ============

@app.route('/api/habits', methods=['GET'])
def get_habits():
    """Get all habits."""
    try:
        habits = db.get_all_habits()
        return jsonify(habits), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/habits/<habit_id>', methods=['GET'])
def get_habit(habit_id):
    """Get a specific habit."""
    try:
        habit = db.get_habit_by_id(habit_id)
        if habit:
            return jsonify(habit), 200
        return jsonify({'error': 'Habit not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/habits', methods=['POST'])
def create_habit():
    """Create a new habit."""
    try:
        habit_data = request.json
        
        # Validate required fields
        if not habit_data.get('id') or not habit_data.get('name') or not habit_data.get('color'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        habit = db.create_habit(habit_data)
        return jsonify(habit), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/habits/<habit_id>', methods=['PUT'])
def update_habit(habit_id):
    """Update an existing habit."""
    try:
        habit_data = request.json
        
        # Validate required fields
        if not habit_data.get('name') or not habit_data.get('color'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        habit = db.update_habit(habit_id, habit_data)
        if habit:
            return jsonify(habit), 200
        return jsonify({'error': 'Habit not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/habits/<habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    """Delete a habit."""
    try:
        success = db.delete_habit(habit_id)
        if success:
            return jsonify({'message': 'Habit deleted successfully'}), 200
        return jsonify({'error': 'Habit not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ Commit Routes ============

@app.route('/api/commits', methods=['GET'])
def get_commits():
    """Get all commits."""
    try:
        commits = db.get_all_commits()
        return jsonify(commits), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/commits/habit/<habit_id>', methods=['GET'])
def get_habit_commits(habit_id):
    """Get all commits for a specific habit."""
    try:
        commits = db.get_commits_by_habit(habit_id)
        return jsonify(commits), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/commits', methods=['POST'])
def create_commit():
    """Create a new commit."""
    try:
        commit_data = request.json
        
        # Validate required fields
        if not commit_data.get('id') or not commit_data.get('habitId') or not commit_data.get('date'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        commit = db.create_commit(commit_data)
        if commit:
            return jsonify(commit), 201
        return jsonify({'error': 'Commit already exists for this habit today'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/commits/today/<date>', methods=['GET'])
def get_today_commits(date):
    """Get all commits for a specific date."""
    try:
        commits = db.get_commits_for_today(date)
        return jsonify(commits), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ Health Check ============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'HabitCommit API is running'
    }), 200

# ============ Server Startup ============

if __name__ == '__main__':
    import os
    import sys
    
    try:
        port = int(os.environ.get('PORT', 5001))
        
        print("🚀 Starting HabitCommit API Server...")
        print(f"📊 Database: {db.DATABASE_PATH}")
        print(f"🌐 Server: http://0.0.0.0:{port}")
        print(f"🐍 Python version: {sys.version}")
        print("📡 API Endpoints:")
        print("   - GET    /api/habits")
        print("   - POST   /api/habits")
        print("   - PUT    /api/habits/<id>")
        print("   - DELETE /api/habits/<id>")
        print("   - GET    /api/commits")
        print("   - POST   /api/commits")
        print("\n✨ Starting server...\n")
        
        # Bind to 0.0.0.0 for Railway deployment
        app.run(host='0.0.0.0', debug=False, port=port)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


