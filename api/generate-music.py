from flask import Flask, request, jsonify
import re
import json
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MuzicCodeAnalyzer:
    """
    Code-to-Music analyzer using Muzic-inspired techniques
    """
    
    def __init__(self):
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
muzic_analyzer = MuzicCodeAnalyzer()

def handler(request):
    """Vercel serverless function handler for code-to-music analysis"""
    
    # Enable CORS
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''
        }
    
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"error": "Method not allowed", "success": False})
        }
    
    try:
        # Get the code from request body
        if hasattr(request, 'get_json'):
            data = request.get_json()
        else:
            # For Vercel, parse body manually
            import json
            data = json.loads(request.body or '{}')
        
        if not data or 'code' not in data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"error": "No code provided", "success": False})
            }
        
        code = data['code']
        logger.info(f"Converting code to music: {len(code)} characters")
        
        # Convert code to music using Muzic-inspired analysis
        result = muzic_analyzer.generate_music_from_code(code)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        logger.error(f"Code-to-music conversion failed: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "error": f"Conversion failed: {str(e)}",
                "success": False
            })
        }
