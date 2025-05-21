import os
import json
import logging
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_key")

# Define path for database file
DB_FILE = 'progress_data.txt'

@app.route('/')
def index():
    """Render the main page of the progress tracker."""
    return render_template('index.html')

@app.route('/api/save-progress', methods=['POST'])
def save_progress():
    """Save progress data to the text file database."""
    try:
        data = request.json
        with open(DB_FILE, 'w') as f:
            json.dump(data, f)
        return jsonify({"success": True, "message": "Progress saved successfully"}), 200
    except Exception as e:
        logging.error(f"Error saving progress: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/load-progress', methods=['GET'])
def load_progress():
    """Load progress data from the text file database."""
    try:
        if os.path.exists(DB_FILE):
            with open(DB_FILE, 'r') as f:
                data = json.load(f)
            return jsonify({"success": True, "data": data}), 200
        else:
            # Return empty data if file doesn't exist yet
            return jsonify({"success": True, "data": {}}), 200
    except Exception as e:
        logging.error(f"Error loading progress: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)