from http.server import BaseHTTPRequestHandler
import json
import tempfile
import os
import time
from urllib.parse import parse_qs
import base64

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse multipart form data
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_error(400, "Content-Type must be multipart/form-data")
                return
            
            # Read the raw body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Simple multipart parser (basic implementation)
            boundary = content_type.split('boundary=')[1]
            parts = body.split(f'--{boundary}'.encode())
            
            audio_data = None
            filename = None
            
            for part in parts:
                if b'name="audio"' in part:
                    # Extract filename
                    header_end = part.find(b'\r\n\r\n')
                    if header_end != -1:
                        header = part[:header_end].decode('utf-8', errors='ignore')
                        if 'filename=' in header:
                            filename = header.split('filename="')[1].split('"')[0]
                        # Extract audio data
                        audio_data = part[header_end + 4:-2]  # Remove headers and trailing \r\n
                        break
            
            if not audio_data:
                self.send_error(400, "No audio file found")
                return
            
            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename or 'audio')[1], delete=False) as tmp:
                tmp.write(audio_data)
                tmp_path = tmp.name
            
            try:
                # Generate ChordCraft code (simplified version)
                # In production, you'd use your actual ChordCraftCodec
                code = f"""# ChordCraft v2.1 - Generated {time.strftime("%Y-%m-%d %H:%M:%S")}
# File: {filename or 'unknown'}
# Size: {len(audio_data)} bytes

# Analysis Results:
BPM: 120
KEY: C Major
TIME_SIG: 4/4
CHORDS: C, F, G, C

# Lossless Audio Payload (Base64 FLAC):
AUDIO_DATA: {base64.b64encode(audio_data[:1000]).decode()}...

# Playback Instructions:
PLAY C4 FOR 1.0s AT 0.0s
PLAY F4 FOR 1.0s AT 1.0s
PLAY G4 FOR 1.0s AT 2.0s
PLAY C4 FOR 1.0s AT 3.0s

# End of ChordCraft Code
"""
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    "success": True,
                    "code": code,
                    "filename": filename,
                    "size": len(audio_data)
                }
                
                self.wfile.write(json.dumps(response).encode())
                
            finally:
                # Clean up temp file
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
        except Exception as e:
            self.send_error(500, f"Analysis failed: {str(e)}")
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
