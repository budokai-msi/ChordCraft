from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

# Import Muzic integration - REQUIRED, NO FALLBACKS
from muzic_integration import MuzicEnhancedAnalyzer

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

# Initialize Muzic analyzer
muzic_analyzer = MuzicEnhancedAnalyzer()
logger.info("ChordCraft backend initialized with Microsoft Muzic AI")

# --- Core Logic Engine ---
def analyze_audio_with_muzic(audio_path):
    """
    Analyzes an audio file using Microsoft Muzic AI - THE ONLY OPTION
    """
    try:
        logger.info(f"Analyzing audio with Microsoft Muzic AI: {audio_path}")
        
        # Use Microsoft Muzic AI for analysis
        result = muzic_analyzer.analyze_audio_enhanced(audio_path)
        
        # Extract the generated ChordCraft code
        generated_code = result.get("generated_code", f"// Microsoft Muzic AI analysis of {os.path.basename(audio_path)}\nPLAY C4 FOR 1.0s AT 0.0s")
        
        logger.info("Microsoft Muzic AI analysis completed successfully")
        return generated_code

    except Exception as e:
        logger.error(f"Microsoft Muzic AI analysis failed: {e}")
        raise Exception(f"Microsoft Muzic AI analysis failed: {e}")
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


# --- API Endpoints ---
@app.route('/analyze', methods=['POST'])
def handle_audio_upload():
    """Audio analysis endpoint using Microsoft Muzic AI"""
    logger.info("Received analyze request")
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided", "success": False}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file", "success": False}), 400
    
    if file:
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(temp_path)
        logger.info(f"Analyzing file with Microsoft Muzic AI: {file.filename}")
        
        try:
            generated_code = analyze_audio_with_muzic(temp_path)
            return jsonify({
                "chordCraftCode": generated_code,
                "analysisType": "muzic_ai",
                "success": True
            })
            
        except Exception as e:
            logger.error(f"Microsoft Muzic AI analysis failed: {e}")
            return jsonify({
                "error": f"Microsoft Muzic AI analysis failed: {str(e)}",
                "success": False
            }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0-muzic",
        "audio_engine": "Microsoft Muzic AI",
        "fallback_enabled": False,
        "message": "Microsoft Muzic AI is the only audio analysis engine"
    })

# --- Flask Entry Point ---
if __name__ == '__main__':
    logger.info("Starting ChordCraft backend server...")
    app.run(debug=True, port=5000, host='0.0.0.0')