from flask import Flask, request, jsonify
import subprocess
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize on first run
_initialized = False

@app.before_request
def initialize():
    global _initialized
    if not _initialized:
        # Activate conda environment and change directory
        try:
            subprocess.run("conda activate animated_drawings", shell=True, check=True)
            subprocess.run("cd ../examples", shell=True, check=True)
            _initialized = True
        except subprocess.CalledProcessError as e:
            print(f"Initialization failed: {str(e)}")

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_BASE = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_BASE, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)

        # Create output directory
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        output_dir = os.path.join(OUTPUT_BASE, f"{os.path.splitext(filename)[0]}_{timestamp}")
        os.makedirs(output_dir, exist_ok=True)

        try:
            # Run the animation conversion
            command = f"python image_to_animation.py {input_path} {output_dir}"
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            
            return jsonify({
                'output_dir': output_dir,
                'message': 'Processing completed successfully'
            }), 200
            
        except subprocess.CalledProcessError as e:
            print(f"Process error output: {e.stderr}")
            return jsonify({'error': f'Processing failed: {str(e)}'})
        finally:
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
