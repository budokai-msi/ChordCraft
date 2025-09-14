from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import sys

# Add the backend directory to the path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import Muzic integration for code analysis
try:
    from muzic_integration import MuzicEnhancedAnalyzer
    print("✅ Successfully imported Muzic integration for code analysis")
    muzic_analyzer = MuzicEnhancedAnalyzer()
except ImportError as e:
    print(f"❌ Muzic import error: {e}")
    muzic_analyzer = None

# Create Flask app for Vercel
app = Flask(__name__)
CORS(app)

@app.route('/api/generate-music', methods=['POST'])
def generate_music():
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        # Use Muzic AI to analyze the ChordCraft code
        if muzic_analyzer:
            try:
                # Analyze the code using Muzic techniques
                analysis = muzic_analyzer.analyze_code_enhanced(code)
                
                return jsonify({
                    'success': True,
                    'analysis': analysis,
                    'musical_features': analysis.get('musical_features', {}),
                    'harmony_analysis': analysis.get('harmony_analysis', {}),
                    'rhythm_analysis': analysis.get('rhythm_analysis', {}),
                    'tempo_estimate': analysis.get('tempo_estimate', 120),
                    'key_signature': analysis.get('key_signature', 'C major'),
                    'time_signature': analysis.get('time_signature', '4/4'),
                    'chord_progression': analysis.get('chord_progression', []),
                    'analysis_type': 'muzic_enhanced'
                })
            except Exception as e:
                print(f"Muzic code analysis error: {e}")
                # Fallback to basic analysis
                return jsonify({
                    'success': True,
                    'analysis': {'basic': True},
                    'musical_features': {'total_notes': code.count('PLAY'), 'duration': 4.0},
                    'tempo_estimate': 120,
                    'key_signature': 'C major',
                    'time_signature': '4/4',
                    'analysis_type': 'muzic_fallback'
                })
        else:
            # Basic fallback analysis
            return jsonify({
                'success': True,
                'analysis': {'basic': True},
                'musical_features': {'total_notes': code.count('PLAY'), 'duration': 4.0},
                'tempo_estimate': 120,
                'key_signature': 'C major', 
                'time_signature': '4/4',
                'analysis_type': 'basic_fallback'
            })
    
    except Exception as e:
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ChordCraft Music Generator'})

# This is the handler for Vercel
def handler(request):
    return app(request.environ, lambda *args: None)

if __name__ == '__main__':
    app.run(debug=True)