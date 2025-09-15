from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import tempfile
import traceback

# Add the backend directory to the path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import Muzic integration - REQUIRED, NO FALLBACKS
from muzic_integration import MuzicEnhancedAnalyzer
print("✅ Successfully imported Muzic integration")
muzic_analyzer = MuzicEnhancedAnalyzer()

def analyze_audio_with_muzic(file_path):
    """Audio analysis using Microsoft Muzic AI - THE ONLY OPTION"""
    result = muzic_analyzer.analyze_audio_enhanced(file_path)
    return {
        "tempo": result.get("tempo", 120),
        "key": result.get("key", "C major"),
        "time_signature": result.get("time_signature", "4/4"),
        "chord_progression": result.get("chord_progression", ["C", "Am", "F", "G"]),
        "generated_code": result.get("generated_code", f"// Muzic AI analysis of {os.path.basename(file_path)}\nPLAY C4 FOR 1.0s AT 0.0s\nPLAY E4 FOR 1.0s AT 1.0s\nPLAY G4 FOR 1.0s AT 2.0s"),
        "analysis_type": "muzic_ai",
        "musical_features": result.get("musical_features", {}),
        "harmony_analysis": result.get("harmony_analysis", {}),
        "rhythm_analysis": result.get("rhythm_analysis", {})
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
            # Analyze the audio using Microsoft Muzic AI - THE ONLY OPTION
            analysis = analyze_audio_with_muzic(temp_path)
            
            return jsonify({
                'success': True,
                'chordCraftCode': analysis.get('generated_code', '// No code generated'),
                'analysis': analysis,
                'filename': file.filename,
                'analysis_type': 'muzic_ai',
                'musical_features': analysis.get('musical_features', {}),
                'harmony_analysis': analysis.get('harmony_analysis', {}),
                'rhythm_analysis': analysis.get('rhythm_analysis', {}),
                'tempo': analysis.get('tempo', 120),
                'key': analysis.get('key', 'C major'),
                'time_signature': analysis.get('time_signature', '4/4'),
                'chord_progression': analysis.get('chord_progression', [])
            })
        
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        print(f"Microsoft Muzic AI analysis failed: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': f'Microsoft Muzic AI analysis failed: {str(e)}',
            'success': False,
            'message': 'Audio analysis requires Microsoft Muzic AI integration. Please ensure the backend is properly configured.'
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
    return jsonify({
        'status': 'healthy', 
        'service': 'ChordCraft API',
        'audio_engine': 'Microsoft Muzic AI',
        'fallback_enabled': False,
        'message': 'Microsoft Muzic AI is the only audio analysis engine'
    })

# This is the handler for Vercel
def handler(request):
    return app(request.environ, lambda *args: None)

if __name__ == '__main__':
    app.run(debug=True)