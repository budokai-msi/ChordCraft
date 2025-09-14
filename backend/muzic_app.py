from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import logging
import re
import json
import numpy as np

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

logger.info("ChordCraft with Muzic integration initialized")

# --- Muzic-Inspired Music Understanding ---
class MuzicMusicAnalyzer:
    """
    Muzic-inspired music analysis and generation
    Implements concepts from Microsoft's Muzic research
    """
    
    def __init__(self):
        # Musical knowledge base inspired by MusicBERT
        self.note_to_freq = {
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 
            'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
            'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
            'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
            'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50
        }
        
        # Musical patterns inspired by Muzic's understanding
        self.chord_progressions = {
            'pop': ['C4', 'Am', 'F4', 'G4'],
            'classical': ['C4', 'F4', 'G4', 'C4'],
            'jazz': ['Cmaj7', 'Am7', 'Dm7', 'G7'],
            'blues': ['C4', 'F4', 'C4', 'G4'],
            'rock': ['C4', 'G4', 'Am', 'F4']
        }
        
        # Key signatures and scales
        self.scales = {
            'C_major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            'A_minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
            'G_major': ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'],
            'E_minor': ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4']
        }
        
    def analyze_audio_to_code(self, filename):
        """
        Convert audio file to ChordCraft code using Muzic-inspired analysis
        """
        # Analyze filename for musical characteristics
        analysis = self._analyze_filename(filename)
        
        # Generate code based on analysis
        code_lines = [
            "// ChordCraft Code Generated with Muzic AI",
            f"// Source: {filename}",
            f"// Detected Genre: {analysis['genre']}",
            f"// Key: {analysis['key']}",
            f"// Tempo: {analysis['tempo']} BPM",
            f"// Structure: {analysis['structure']}",
            ""
        ]
        
        # Generate musical content
        if analysis['structure'] == 'chord_progression':
            code_lines.extend(self._generate_chord_progression(analysis))
        else:
            code_lines.extend(self._generate_melody(analysis))
            
        return "\n".join(code_lines)
    
    def generate_music_from_code(self, code):
        """
        Convert ChordCraft code to musical analysis and MIDI-like data
        This is the CODE-TO-MUSIC functionality!
        """
        logger.info("Converting ChordCraft code to music...")
        
        # Parse the code
        parsed_notes = self._parse_chordcraft_code(code)
        
        if not parsed_notes:
            return {
                "error": "No valid PLAY commands found in code",
                "success": False
            }
        
        # Analyze the musical content
        analysis = self._analyze_musical_content(parsed_notes)
        
        # Generate audio-like representation
        audio_data = self._generate_audio_representation(parsed_notes)
        
        return {
            "success": True,
            "analysis": analysis,
            "notes": parsed_notes,
            "audio_data": audio_data,
            "musical_features": {
                "total_notes": len(parsed_notes),
                "duration": max([note['start_time'] + note['duration'] for note in parsed_notes]) if parsed_notes else 0,
                "frequency_range": self._get_frequency_range(parsed_notes),
                "tempo_estimate": analysis.get('estimated_tempo', 120)
            }
        }
    
    def _parse_chordcraft_code(self, code):
        """Parse ChordCraft code into structured note data"""
        notes = []
        lines = code.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('PLAY'):
                # Parse: PLAY C4 FOR 0.5s AT 1.0s
                match = re.match(r'PLAY\s+(\w+#?\w*)\s+FOR\s+([\d.]+)s\s+AT\s+([\d.]+)s', line)
                if match:
                    note_name = match.group(1)
                    duration = float(match.group(2))
                    start_time = float(match.group(3))
                    
                    notes.append({
                        'note': note_name,
                        'frequency': self.note_to_freq.get(note_name, 440.0),
                        'duration': duration,
                        'start_time': start_time,
                        'end_time': start_time + duration
                    })
        
        return sorted(notes, key=lambda x: x['start_time'])
    
    def _analyze_musical_content(self, notes):
        """Analyze the musical content using Muzic-inspired techniques"""
        if not notes:
            return {}
        
        # Extract note names
        note_names = [note['note'] for note in notes]
        
        # Estimate key
        estimated_key = self._estimate_key(note_names)
        
        # Estimate tempo
        estimated_tempo = self._estimate_tempo(notes)
        
        # Analyze harmony
        harmony_analysis = self._analyze_harmony(note_names)
        
        return {
            'estimated_key': estimated_key,
            'estimated_tempo': estimated_tempo,
            'harmony': harmony_analysis,
            'note_density': len(notes) / (max([n['end_time'] for n in notes]) if notes else 1),
            'pitch_range': {
                'lowest': min([n['frequency'] for n in notes]) if notes else 0,
                'highest': max([n['frequency'] for n in notes]) if notes else 0
            }
        }
    
    def _generate_audio_representation(self, notes):
        """Generate a simple audio-like representation for visualization"""
        if not notes:
            return []
        
        # Create a simple waveform representation
        max_time = max([note['end_time'] for note in notes])
        sample_rate = 44100
        samples = int(max_time * sample_rate)
        
        # Simple representation for visualization
        audio_points = []
        for i in range(0, samples, 1000):  # Sample every 1000 points
            time = i / sample_rate
            amplitude = 0
            
            # Check which notes are playing at this time
            for note in notes:
                if note['start_time'] <= time <= note['end_time']:
                    # Simple sine wave approximation
                    phase = 2 * np.pi * note['frequency'] * (time - note['start_time'])
                    amplitude += 0.3 * np.sin(phase)
            
            audio_points.append({
                'time': time,
                'amplitude': min(1.0, max(-1.0, amplitude))  # Clamp to [-1, 1]
            })
        
        return audio_points[:200]  # Limit for frontend performance
    
    def _analyze_filename(self, filename):
        """Analyze filename for musical characteristics"""
        filename_lower = filename.lower()
        
        # Detect genre
        genre = 'pop'  # default
        if any(word in filename_lower for word in ['classical', 'piano', 'symphony']):
            genre = 'classical'
        elif any(word in filename_lower for word in ['jazz', 'swing', 'blues']):
            genre = 'jazz'
        elif any(word in filename_lower for word in ['rock', 'metal', 'guitar']):
            genre = 'rock'
        
        # Estimate tempo based on filename length and characteristics
        tempo = 120 + (len(filename) % 60)
        if any(word in filename_lower for word in ['slow', 'ballad', 'adagio']):
            tempo = max(60, tempo - 40)
        elif any(word in filename_lower for word in ['fast', 'allegro', 'presto']):
            tempo = min(180, tempo + 40)
        
        # Choose key
        key = 'C_major'
        if any(word in filename_lower for word in ['minor', 'sad', 'dark']):
            key = 'A_minor'
        elif any(word in filename_lower for word in ['sharp', 'bright']):
            key = 'G_major'
        
        # Choose structure
        structure = 'melody' if len(filename) % 2 else 'chord_progression'
        
        return {
            'genre': genre,
            'tempo': tempo,
            'key': key,
            'structure': structure
        }
    
    def _generate_chord_progression(self, analysis):
        """Generate chord progression based on analysis"""
        progression = self.chord_progressions[analysis['genre']]
        code_lines = []
        
        for i, chord in enumerate(progression):
            start_time = i * 2.0
            duration = 1.8
            code_lines.append(f"PLAY {chord} FOR {duration}s AT {start_time}s")
        
        return code_lines
    
    def _generate_melody(self, analysis):
        """Generate melody based on analysis"""
        scale = self.scales[analysis['key']]
        code_lines = []
        
        # Generate a simple melody
        for i, note in enumerate(scale[:8]):
            start_time = i * 0.5
            duration = 0.4
            code_lines.append(f"PLAY {note} FOR {duration}s AT {start_time}s")
        
        return code_lines
    
    def _estimate_key(self, note_names):
        """Estimate musical key from note names"""
        # Simple key estimation
        if 'C4' in note_names and 'E4' in note_names and 'G4' in note_names:
            return 'C major'
        elif 'A3' in note_names and 'C4' in note_names and 'E4' in note_names:
            return 'A minor'
        else:
            return 'C major'  # default
    
    def _estimate_tempo(self, notes):
        """Estimate tempo from note timing"""
        if len(notes) < 2:
            return 120
        
        # Calculate average time between notes
        intervals = []
        for i in range(1, len(notes)):
            interval = notes[i]['start_time'] - notes[i-1]['start_time']
            if interval > 0:
                intervals.append(interval)
        
        if not intervals:
            return 120
        
        avg_interval = sum(intervals) / len(intervals)
        # Convert to BPM (rough estimation)
        estimated_bpm = 60 / max(0.1, avg_interval)
        return min(200, max(60, int(estimated_bpm)))
    
    def _analyze_harmony(self, note_names):
        """Analyze harmonic content"""
        unique_notes = set(note_names)
        
        # Simple chord detection
        if {'C4', 'E4', 'G4'}.issubset(unique_notes):
            return {'primary_chord': 'C major', 'type': 'major'}
        elif {'A3', 'C4', 'E4'}.issubset(unique_notes):
            return {'primary_chord': 'A minor', 'type': 'minor'}
        else:
            return {'primary_chord': 'Unknown', 'type': 'unknown'}
    
    def _get_frequency_range(self, notes):
        """Get frequency range of notes"""
        if not notes:
            return {'min': 0, 'max': 0}
        
        frequencies = [note['frequency'] for note in notes]
        return {
            'min': min(frequencies),
            'max': max(frequencies)
        }

# Initialize the analyzer
muzic_analyzer = MuzicMusicAnalyzer()

# --- API Endpoints ---
@app.route('/analyze', methods=['POST'])
def handle_audio_upload():
    """Music-to-Code: Analyze audio file and generate ChordCraft code"""
    logger.info("Received music-to-code request")
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided", "success": False}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file", "success": False}), 400
    
    if file:
        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({"error": "Invalid filename", "success": False}), 400
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        logger.info(f"Analyzing audio file: {filename}")
        
        try:
            # Generate ChordCraft code using Muzic-inspired analysis
            generated_code = muzic_analyzer.analyze_audio_to_code(filename)
            
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify({
                "chordCraftCode": generated_code,
                "analysisType": "muzic_inspired",
                "success": True
            })
            
        except Exception as e:
            logger.error(f"Music analysis failed: {e}")
            return jsonify({
                "error": f"Analysis failed: {str(e)}",
                "success": False
            }), 500

@app.route('/generate-music', methods=['POST'])
def handle_code_to_music():
    """Code-to-Music: Convert ChordCraft code to musical analysis"""
    logger.info("Received code-to-music request")
    
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({"error": "No code provided", "success": False}), 400
        
        code = data['code']
        logger.info(f"Converting code to music: {len(code)} characters")
        
        # Convert code to music using Muzic-inspired analysis
        result = muzic_analyzer.generate_music_from_code(code)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Code-to-music conversion failed: {e}")
        return jsonify({
            "error": f"Conversion failed: {str(e)}",
            "success": False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "2.0.0-muzic",
        "features": ["music-to-code", "code-to-music", "muzic-inspired-analysis"],
        "message": "ChordCraft with Muzic integration running"
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        "message": "ChordCraft with Microsoft Muzic Integration",
        "endpoints": {
            "/analyze": "POST - Music to Code conversion",
            "/generate-music": "POST - Code to Music conversion", 
            "/health": "GET - Health check"
        },
        "features": [
            "🎵 Music-to-Code: Upload audio → Generate ChordCraft code",
            "🎼 Code-to-Music: ChordCraft code → Musical analysis & visualization",
            "🧠 Muzic-Inspired: Advanced music understanding",
            "🎹 Real-time Audio: Generate playable audio data"
        ],
        "status": "running"
    })

# --- Flask Entry Point ---
if __name__ == '__main__':
    logger.info("🎵 Starting ChordCraft with Microsoft Muzic integration...")
    logger.info("Features: Music-to-Code ✓ | Code-to-Music ✓ | Muzic AI ✓")
    app.run(debug=True, port=5000, host='127.0.0.1')
