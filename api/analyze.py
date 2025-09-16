from http.server import BaseHTTPRequestHandler
import json
import os
import tempfile
import traceback
import base64
from urllib.parse import parse_qs
import io

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Parse multipart form data
            boundary = self.headers.get('Content-Type', '').split('boundary=')[1]
            parts = post_data.split(b'--' + boundary.encode())
            
            audio_file = None
            analysis_type = 'basic'
            tempo = 120
            key = 'C major'
            
            for part in parts:
                if b'name="audio"' in part:
                    # Extract the audio file
                    header_end = part.find(b'\r\n\r\n')
                    if header_end != -1:
                        audio_data = part[header_end + 4:-2]  # Remove the last \r\n
                        if len(audio_data) > 0:
                            audio_file = audio_data
                elif b'name="analysisType"' in part:
                    # Extract analysis type
                    header_end = part.find(b'\r\n\r\n')
                    if header_end != -1:
                        analysis_type = part[header_end + 4:-2].decode('utf-8')
                elif b'name="tempo"' in part:
                    # Extract tempo
                    header_end = part.find(b'\r\n\r\n')
                    if header_end != -1:
                        tempo = int(part[header_end + 4:-2].decode('utf-8'))
                elif b'name="key"' in part:
                    # Extract key
                    header_end = part.find(b'\r\n\r\n')
                    if header_end != -1:
                        key = part[header_end + 4:-2].decode('utf-8')
            
            if not audio_file:
                self.send_error(400, "No audio file provided")
                return
            
            # Simulate analysis (since we can't use Muzic in Vercel)
            analysis_result = self.simulate_analysis(audio_file, analysis_type, tempo, key)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = json.dumps(analysis_result)
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            print(f"Error in analyze.py: {str(e)}")
            print(traceback.format_exc())
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                "success": False,
                "error": f"Analysis failed: {str(e)}",
                "analysis_type": "error"
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def simulate_analysis(self, audio_file, analysis_type, tempo, key):
        """Simulate audio analysis without Muzic dependencies"""
        try:
            # Generate a simple chord progression based on the key
            chord_progressions = {
                'C major': ['C', 'Am', 'F', 'G'],
                'G major': ['G', 'Em', 'C', 'D'],
                'D major': ['D', 'Bm', 'G', 'A'],
                'A major': ['A', 'F#m', 'D', 'E'],
                'E major': ['E', 'C#m', 'A', 'B'],
                'F major': ['F', 'Dm', 'Bb', 'C'],
                'Bb major': ['Bb', 'Gm', 'Eb', 'F']
            }
            
            # Get chord progression for the key
            chords = chord_progressions.get(key, ['C', 'Am', 'F', 'G'])
            
            # Generate music code
            generated_code = f"""// ChordCraft Music Code - Generated Analysis
// Analysis completed: {self.get_timestamp()}

// Project Configuration
BPM = {tempo};
TIME_SIGNATURE = "4/4";
KEY = "{key}";

// Track Definition
TRACK analyzed_audio = {{
  name: "Uploaded Audio",
  instrument: "audio_sample",
  volume: 80,
  pan: 0,
  file: "uploaded_audio.wav"
}};

// Detected Musical Elements
PATTERN detected_pattern = {{
  // Chord Progression: {' - '.join(chords)}
  PLAY C4 FOR 2s AT 0s;
  PLAY E4 FOR 2s AT 0s;
  PLAY G4 FOR 2s AT 0s;
  
  PLAY A3 FOR 2s AT 2s;
  PLAY C4 FOR 2s AT 2s;
  PLAY E4 FOR 2s AT 2s;
  
  PLAY F3 FOR 2s AT 4s;
  PLAY A3 FOR 2s AT 4s;
  PLAY C4 FOR 2s AT 4s;
  
  PLAY G3 FOR 2s AT 6s;
  PLAY B3 FOR 2s AT 6s;
  PLAY D4 FOR 2s AT 6s;
  
  // Melodic line
  PLAY C5 FOR 0.5s AT 8s;
  PLAY B4 FOR 0.5s AT 8.5s;
  PLAY A4 FOR 0.5s AT 9s;
  PLAY G4 FOR 0.5s AT 9.5s;
  PLAY F4 FOR 1s AT 10s;
  PLAY E4 FOR 1s AT 11s;
  PLAY D4 FOR 1s AT 12s;
  PLAY C4 FOR 2s AT 13s;
}};

// Apply pattern
APPLY detected_pattern TO analyzed_audio;

// Export Configuration
EXPORT_FORMAT = "MIDI";
EXPORT_QUALITY = "HIGH";
EXPORT_TEMPO = {tempo};"""
            
            return {
                "success": True,
                "analysis_type": "simulated",
                "tempo": tempo,
                "key": key,
                "time_signature": "4/4",
                "chord_progression": chords,
                "generated_code": generated_code,
                "musical_features": {
                    "duration": "15.0s",
                    "complexity": "medium",
                    "style": "contemporary",
                    "mood": "uplifting"
                },
                "harmony_analysis": {
                    "primary_chords": chords,
                    "harmonic_rhythm": "2 beats per chord",
                    "cadence": "perfect"
                },
                "rhythm_analysis": {
                    "time_signature": "4/4",
                    "tempo": tempo,
                    "rhythmic_pattern": "syncopated"
                },
                "message": "Analysis completed successfully (simulated mode)"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Simulation failed: {str(e)}",
                "analysis_type": "error"
            }
    
    def get_timestamp(self):
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")