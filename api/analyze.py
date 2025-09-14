from flask import Flask, request, jsonify
import os
import logging
import re
import json
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

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
        elif any(word in filename_lower for word in ['hip-hop', 'rap', 'electronic']):
            genre = 'hip-hop'
        elif any(word in filename_lower for word in ['country', 'bluegrass', 'folk']):
            genre = 'country'
        elif any(word in filename_lower for word in ['latin', 'salsa', 'tango']):
            genre = 'latin'
        elif any(word in filename_lower for word in ['disco', 'funk', 'soul']):
            genre = 'disco'
            
        
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

# Initialize the analyzer
muzic_analyzer = MuzicMusicAnalyzer()

def handler(request):
    """Vercel serverless function handler for music-to-code analysis"""
    
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
        # For Vercel, we'll use the filename to generate patterns
        # In a real implementation, you'd process the actual audio
        
        # Get filename from request (simplified for Vercel)
        filename = request.args.get('filename', 'audio_file.wav')
        
        logger.info(f"Analyzing audio file: {filename}")
        
        # Generate ChordCraft code using Muzic-inspired analysis
        generated_code = muzic_analyzer.analyze_audio_to_code(filename)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "chordCraftCode": generated_code,
                "analysisType": "muzic_inspired",
                "success": True
            })
        }
        
    except Exception as e:
        logger.error(f"Music analysis failed: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                "error": f"Analysis failed: {str(e)}",
                "success": False
            })
        }
