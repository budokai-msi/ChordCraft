from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
import random
import re

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

app = Flask(__name__)
CORS(app)

# Advanced music generation patterns and templates
MUSIC_PATTERNS = {
    "drum_and_bass": {
        "description": "High-energy drum and bass with complex breakbeats and sub-bass",
        "patterns": [
            "// High-energy drum and bass drop\nPLAY D#3 FOR 0.125s AT 0.0s VELOCITY 0.9\nPLAY D#3 FOR 0.125s AT 0.25s VELOCITY 0.8\nPLAY F#4 FOR 0.25s AT 0.5s VELOCITY 0.9\nPLAY A#3 FOR 0.125s AT 0.75s VELOCITY 0.7\nPLAY D#3 FOR 0.125s AT 1.0s VELOCITY 0.9\nPLAY F#4 FOR 0.25s AT 1.25s VELOCITY 0.8\nPLAY A#3 FOR 0.125s AT 1.5s VELOCITY 0.7\nPLAY D#3 FOR 0.125s AT 1.75s VELOCITY 0.9",
            "// Complex breakbeat pattern\nPLAY C#3 FOR 0.0625s AT 0.0s VELOCITY 0.9\nPLAY E3 FOR 0.0625s AT 0.125s VELOCITY 0.8\nPLAY G#3 FOR 0.125s AT 0.25s VELOCITY 0.9\nPLAY C#3 FOR 0.0625s AT 0.5s VELOCITY 0.7\nPLAY E3 FOR 0.0625s AT 0.625s VELOCITY 0.8\nPLAY G#3 FOR 0.125s AT 0.75s VELOCITY 0.9\nPLAY C#3 FOR 0.0625s AT 1.0s VELOCITY 0.7\nPLAY E3 FOR 0.0625s AT 1.125s VELOCITY 0.8"
        ]
    },
    "ambient": {
        "description": "Atmospheric ambient pad with slow chord progressions",
        "patterns": [
            "// Ambient pad chord progression\nPLAY C4,E4,G4 FOR 4.0s AT 0.0s VELOCITY 0.6\nPLAY F4,A4,C5 FOR 4.0s AT 4.0s VELOCITY 0.5\nPLAY G4,B4,D5 FOR 4.0s AT 8.0s VELOCITY 0.6\nPLAY C4,E4,G4 FOR 4.0s AT 12.0s VELOCITY 0.5",
            "// Ethereal ambient texture\nPLAY C3 FOR 8.0s AT 0.0s VELOCITY 0.4\nPLAY E3 FOR 8.0s AT 2.0s VELOCITY 0.3\nPLAY G3 FOR 8.0s AT 4.0s VELOCITY 0.4\nPLAY B3 FOR 8.0s AT 6.0s VELOCITY 0.3"
        ]
    },
    "jazz": {
        "description": "Sophisticated jazz chord progressions with swing feel",
        "patterns": [
            "// Jazz ii-V-I progression\nPLAY Dm7 FOR 2.0s AT 0.0s VELOCITY 0.7\nPLAY G7 FOR 2.0s AT 2.0s VELOCITY 0.8\nPLAY Cmaj7 FOR 4.0s AT 4.0s VELOCITY 0.7\nPLAY Am7 FOR 2.0s AT 8.0s VELOCITY 0.6\nPLAY D7 FOR 2.0s AT 10.0s VELOCITY 0.8\nPLAY Gmaj7 FOR 4.0s AT 12.0s VELOCITY 0.7",
            "// Bebop-style melody\nPLAY C5 FOR 0.25s AT 0.0s VELOCITY 0.8\nPLAY E5 FOR 0.25s AT 0.5s VELOCITY 0.7\nPLAY G5 FOR 0.5s AT 1.0s VELOCITY 0.9\nPLAY F5 FOR 0.25s AT 1.75s VELOCITY 0.8\nPLAY E5 FOR 0.25s AT 2.0s VELOCITY 0.7\nPLAY D5 FOR 0.5s AT 2.5s VELOCITY 0.8"
        ]
    },
    "trap": {
        "description": "Modern trap beat with heavy 808s and hi-hats",
        "patterns": [
            "// Trap beat pattern\nPLAY C2 FOR 0.5s AT 0.0s VELOCITY 0.9\nPLAY C2 FOR 0.5s AT 1.0s VELOCITY 0.8\nPLAY C2 FOR 0.5s AT 1.5s VELOCITY 0.9\nPLAY C2 FOR 0.5s AT 2.5s VELOCITY 0.8\nPLAY C2 FOR 0.5s AT 3.0s VELOCITY 0.9\nPLAY C2 FOR 0.5s AT 3.5s VELOCITY 0.8",
            "// Trap hi-hat pattern\nPLAY F#5 FOR 0.125s AT 0.0s VELOCITY 0.6\nPLAY F#5 FOR 0.125s AT 0.25s VELOCITY 0.4\nPLAY F#5 FOR 0.125s AT 0.5s VELOCITY 0.6\nPLAY F#5 FOR 0.125s AT 0.75s VELOCITY 0.4\nPLAY F#5 FOR 0.125s AT 1.0s VELOCITY 0.6\nPLAY F#5 FOR 0.125s AT 1.25s VELOCITY 0.4\nPLAY F#5 FOR 0.125s AT 1.5s VELOCITY 0.6\nPLAY F#5 FOR 0.125s AT 1.75s VELOCITY 0.4"
        ]
    },
    "classical": {
        "description": "Elegant classical composition with traditional harmony",
        "patterns": [
            "// Classical chord progression\nPLAY C4,E4,G4 FOR 2.0s AT 0.0s VELOCITY 0.7\nPLAY F4,A4,C5 FOR 2.0s AT 2.0s VELOCITY 0.6\nPLAY G4,B4,D5 FOR 2.0s AT 4.0s VELOCITY 0.7\nPLAY C4,E4,G4 FOR 2.0s AT 6.0s VELOCITY 0.6\nPLAY Am4,C5,E5 FOR 2.0s AT 8.0s VELOCITY 0.5\nPLAY F4,A4,C5 FOR 2.0s AT 10.0s VELOCITY 0.6\nPLAY G4,B4,D5 FOR 2.0s AT 12.0s VELOCITY 0.7\nPLAY C4,E4,G4 FOR 4.0s AT 14.0s VELOCITY 0.6",
            "// Baroque-style melody\nPLAY C5 FOR 0.5s AT 0.0s VELOCITY 0.8\nPLAY E5 FOR 0.5s AT 0.5s VELOCITY 0.7\nPLAY G5 FOR 1.0s AT 1.0s VELOCITY 0.9\nPLAY F5 FOR 0.5s AT 2.0s VELOCITY 0.8\nPLAY E5 FOR 0.5s AT 2.5s VELOCITY 0.7\nPLAY D5 FOR 1.0s AT 3.0s VELOCITY 0.8\nPLAY C5 FOR 2.0s AT 4.0s VELOCITY 0.9"
        ]
    },
    "electronic": {
        "description": "Modern electronic music with synthesizers and effects",
        "patterns": [
            "// Electronic arpeggio\nPLAY C4 FOR 0.25s AT 0.0s VELOCITY 0.8\nPLAY E4 FOR 0.25s AT 0.25s VELOCITY 0.7\nPLAY G4 FOR 0.25s AT 0.5s VELOCITY 0.8\nPLAY B4 FOR 0.25s AT 0.75s VELOCITY 0.7\nPLAY C5 FOR 0.25s AT 1.0s VELOCITY 0.9\nPLAY B4 FOR 0.25s AT 1.25s VELOCITY 0.7\nPLAY G4 FOR 0.25s AT 1.5s VELOCITY 0.8\nPLAY E4 FOR 0.25s AT 1.75s VELOCITY 0.7",
            "// Electronic bass line\nPLAY C2 FOR 0.5s AT 0.0s VELOCITY 0.9\nPLAY C2 FOR 0.5s AT 1.0s VELOCITY 0.8\nPLAY F2 FOR 0.5s AT 2.0s VELOCITY 0.9\nPLAY F2 FOR 0.5s AT 3.0s VELOCITY 0.8\nPLAY G2 FOR 0.5s AT 4.0s VELOCITY 0.9\nPLAY G2 FOR 0.5s AT 5.0s VELOCITY 0.8\nPLAY F2 FOR 0.5s AT 6.0s VELOCITY 0.9\nPLAY C2 FOR 0.5s AT 7.0s VELOCITY 0.8"
        ]
    }
}

def analyze_prompt(prompt):
    """Analyze the user prompt to determine the best music generation approach"""
    prompt_lower = prompt.lower()
    
    # Detect genre
    genre = "electronic"  # default
    for key in MUSIC_PATTERNS.keys():
        if key.replace("_", " ") in prompt_lower or key in prompt_lower:
            genre = key
            break
    
    # Detect mood/energy
    energy_keywords = {
        "high": ["energetic", "fast", "upbeat", "intense", "powerful", "aggressive"],
        "medium": ["moderate", "steady", "balanced", "smooth"],
        "low": ["slow", "calm", "peaceful", "relaxing", "ambient", "chill"]
    }
    
    energy = "medium"  # default
    for level, keywords in energy_keywords.items():
        if any(keyword in prompt_lower for keyword in keywords):
            energy = level
            break
    
    # Detect specific instruments or elements
    instruments = []
    instrument_keywords = {
        "piano": ["piano", "keys", "keyboard"],
        "guitar": ["guitar", "strum", "acoustic"],
        "bass": ["bass", "low", "sub"],
        "drums": ["drum", "beat", "percussion", "kick", "snare"],
        "synth": ["synth", "electronic", "digital", "pad"]
    }
    
    for instrument, keywords in instrument_keywords.items():
        if any(keyword in prompt_lower for keyword in keywords):
            instruments.append(instrument)
    
    return {
        "genre": genre,
        "energy": energy,
        "instruments": instruments,
        "original_prompt": prompt
    }

def generate_music_section(analysis, existing_code=""):
    """Generate music code based on the analysis"""
    genre = analysis["genre"]
    energy = analysis["energy"]
    instruments = analysis["instruments"]
    
    # Get base pattern for the genre
    if genre in MUSIC_PATTERNS:
        base_patterns = MUSIC_PATTERNS[genre]["patterns"]
        selected_pattern = random.choice(base_patterns)
    else:
        # Fallback to electronic
        base_patterns = MUSIC_PATTERNS["electronic"]["patterns"]
        selected_pattern = random.choice(base_patterns)
    
    # Modify based on energy level
    if energy == "high":
        # Increase velocity and add more notes
        selected_pattern = re.sub(r'VELOCITY 0\.(\d)', r'VELOCITY 0.\1', selected_pattern)
        selected_pattern = re.sub(r'VELOCITY 0\.(\d)', lambda m: f'VELOCITY 0.{min(9, int(m.group(1)) + 2)}', selected_pattern)
    elif energy == "low":
        # Decrease velocity and slow down
        selected_pattern = re.sub(r'VELOCITY 0\.(\d)', lambda m: f'VELOCITY 0.{max(3, int(m.group(1)) - 2)}', selected_pattern)
        selected_pattern = re.sub(r'FOR (\d+\.?\d*)s', lambda m: f'FOR {float(m.group(1)) * 1.5}s', selected_pattern)
    
    # Add instrument-specific modifications
    if "piano" in instruments:
        selected_pattern = "// Piano melody\n" + selected_pattern
    elif "guitar" in instruments:
        selected_pattern = "// Guitar strumming pattern\n" + selected_pattern
    elif "bass" in instruments:
        selected_pattern = "// Bass line\n" + selected_pattern
    elif "drums" in instruments:
        selected_pattern = "// Drum pattern\n" + selected_pattern
    elif "synth" in instruments:
        selected_pattern = "// Synthesizer arpeggio\n" + selected_pattern
    
    # Add AI-generated comment
    ai_comment = f"// AI Generated: {analysis['original_prompt']}\n// Genre: {genre.title()}, Energy: {energy.title()}\n"
    if instruments:
        ai_comment += f"// Instruments: {', '.join(instruments).title()}\n"
    
    return ai_comment + selected_pattern

@app.route('/api/generative-companion', methods=['POST'])
def generative_companion():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        code = data.get('code', '')
        context = data.get('context', {})

        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # Analyze the prompt
        analysis = analyze_prompt(prompt)
        
        # Generate music based on analysis
        generated_code = generate_music_section(analysis, code)

        # Add some AI personality to the response
        responses = [
            f"✨ I've created a {analysis['genre']} section for you!",
            f"🎵 Here's some {analysis['energy']}-energy {analysis['genre']} music:",
            f"🎶 I've generated a {analysis['genre']} pattern based on your request:",
            f"🎼 Here's what I came up with for your {analysis['genre']} idea:",
            f"🎹 I've crafted a {analysis['genre']} composition for you:"
        ]

        return jsonify({
            'success': True,
            'generated_code': generated_code,
            'analysis': analysis,
            'ai_message': random.choice(responses),
            'suggestions': [
                "Add more variation to this pattern",
                "Change the tempo or rhythm",
                "Add a different instrument layer",
                "Create a bridge or breakdown section",
                "Experiment with different chord progressions"
            ]
        })

    except Exception as e:
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'generative-companion',
        'version': '1.0.0'
    })

def handler(request):
    return app(request.environ, lambda *args: None)
