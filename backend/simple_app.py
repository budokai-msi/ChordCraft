from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging
import random

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Constants ---
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- Initialize Flask App ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)

logger.info("Simple ChordCraft backend initialized successfully")

# Simple note patterns for demo
CHORD_PROGRESSIONS = [
    ["C4", "F4", "G4", "C4"],
    ["Am", "F4", "C4", "G4"],
    ["Em", "Am", "D4", "G4"],
    ["C4", "Am", "F4", "G4"]
]

SCALES = [
    ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
    ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
    ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"]
]

def generate_simple_code(filename):
    """Generate simple ChordCraft code based on filename or random patterns"""
    
    # Choose a random progression
    progression = random.choice(CHORD_PROGRESSIONS)
    scale = random.choice(SCALES)
    
    # Generate based on filename characteristics
    tempo = 120 + (len(filename) % 60)  # 120-180 BPM based on filename
    
    code_lines = [
        "// ChordCraft Generated Code",
        f"// Source: {filename}",
        f"// Tempo: {tempo} BPM",
        f"// Pattern: {'Chord Progression' if random.choice([True, False]) else 'Scale Pattern'}",
        ""
    ]
    
    # Generate chord progression or scale
    if random.choice([True, False]):
        # Chord progression
        for i, chord in enumerate(progression):
            start_time = i * 2.0  # 2 seconds per chord
            duration = 1.8
            code_lines.append(f"PLAY {chord} FOR {duration}s AT {start_time}s")
    else:
        # Scale pattern
        for i, note in enumerate(scale[:6]):  # First 6 notes
            start_time = i * 0.5  # Half second per note
            duration = 0.4
            code_lines.append(f"PLAY {note} FOR {duration}s AT {start_time}s")
    
    return "\n".join(code_lines)

# --- API Endpoints ---
@app.route('/analyze', methods=['POST'])
def handle_audio_upload():
    """Simple audio analysis endpoint"""
    logger.info("Received analyze request")
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided", "success": False}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file", "success": False}), 400
    
    if file:
        # Save the file (optional, for demo we just use the filename)
        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({"error": "Invalid filename", "success": False}), 400
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        logger.info(f"Processing file: {filename}")
        
        try:
            # Generate simple code based on file characteristics
            generated_code = generate_simple_code(filename)
            
            # Clean up the uploaded file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify({
                "chordCraftCode": generated_code,
                "analysisType": "pattern_based",
                "success": True
            })
            
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            return jsonify({
                "error": f"Code generation failed: {str(e)}",
                "success": False
            }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0-simple",
        "message": "Simple ChordCraft backend running"
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        "message": "ChordCraft Backend API",
        "endpoints": ["/analyze", "/health"],
        "status": "running"
    })

# --- Flask Entry Point ---
if __name__ == '__main__':
    logger.info("Starting Simple ChordCraft backend server...")
    app.run(debug=True, port=5000, host='127.0.0.1')
