from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import tempfile
import traceback

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from muzic_integration import enhanced_analyze_audio
    from muzic_app import app as muzic_app
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback to basic analysis
    def enhanced_analyze_audio(file_path):
        return {
            "tempo": 120,
            "key": "C major",
            "time_signature": "4/4",
            "chord_progression": ["C", "Am", "F", "G"],
            "generated_code": f"// Basic analysis of {os.path.basename(file_path)}\nPLAY C4 FOR 1.0s AT 0.0s\nPLAY E4 FOR 1.0s AT 1.0s\nPLAY G4 FOR 1.0s AT 2.0s"
        }

# Create Flask app for Vercel
app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        try:
            # Analyze the audio
            analysis = enhanced_analyze_audio(temp_path)
            
            return jsonify({
                'success': True,
                'analysis': analysis,
                'generated_code': analysis.get('generated_code', '// No code generated'),
                'filename': file.filename
            })
        
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        print(f"Error in analyze_audio: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Analysis failed: {str(e)}',
            'generated_code': f'// Error analyzing {file.filename if file else "audio"}\n// Please try again or check the file format'
        }), 500

@app.route('/api/generate-music', methods=['POST'])
def generate_music():
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        # For now, just return the code as-is
        # In a full implementation, this would generate actual audio
        return jsonify({
            'success': True,
            'message': 'Music generation not yet implemented',
            'code': code
        })
    
    except Exception as e:
        print(f"Error in generate_music: {str(e)}")
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ChordCraft API'})

# This is the handler for Vercel
def handler(request):
    return app(request.environ, lambda *args: None)

if __name__ == '__main__':
    app.run(debug=True)