from flask import Flask, request, jsonify
from flask_cors import CORS
import json

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
        
        # For now, just return the code as-is
        # In a full implementation, this would generate actual audio
        return jsonify({
            'success': True,
            'message': 'Music generation not yet implemented',
            'code': code
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