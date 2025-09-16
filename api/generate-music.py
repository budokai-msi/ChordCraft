from http.server import BaseHTTPRequestHandler
import json
import traceback

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            chord_craft_code = data.get('chordCraftCode', '')
            options = data.get('options', {})
            
            if not chord_craft_code:
                self.send_error(400, "No ChordCraft code provided")
                return
            
            # Simulate music generation
            generation_result = self.simulate_generation(chord_craft_code, options)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = json.dumps(generation_result)
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            print(f"Error in generate-music.py: {str(e)}")
            print(traceback.format_exc())
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                "success": False,
                "error": f"Music generation failed: {str(e)}"
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def simulate_generation(self, code, options):
        """Simulate music generation from ChordCraft code"""
        try:
            # Parse the code to extract musical elements
            lines = code.split('\n')
            bpm = 120
            time_signature = "4/4"
            key = "C Major"
            
            # Extract BPM
            for line in lines:
                if 'BPM =' in line:
                    try:
                        bpm = int(line.split('BPM =')[1].split(';')[0].strip())
                    except:
                        pass
            
            # Extract time signature
            for line in lines:
                if 'TIME_SIGNATURE =' in line:
                    try:
                        time_signature = line.split('TIME_SIGNATURE =')[1].split(';')[0].strip().strip('"')
                    except:
                        pass
            
            # Extract key
            for line in lines:
                if 'KEY =' in line:
                    try:
                        key = line.split('KEY =')[1].split(';')[0].strip().strip('"')
                    except:
                        pass
            
            # Count notes
            play_commands = [line for line in lines if 'PLAY' in line and 'FOR' in line]
            note_count = len(play_commands)
            
            # Generate MIDI data (simulated)
            midi_data = {
                "format": "midi",
                "tracks": 1,
                "ticks_per_beat": 480,
                "tempo": bpm,
                "time_signature": time_signature,
                "key_signature": key,
                "notes": note_count,
                "duration": "15.0s"
            }
            
            return {
                "success": True,
                "generation_type": "simulated",
                "midi_data": midi_data,
                "audio_url": None,  # Would be a real URL in production
                "download_url": None,  # Would be a real URL in production
                "metadata": {
                    "bpm": bpm,
                    "time_signature": time_signature,
                    "key": key,
                    "note_count": note_count,
                    "duration": "15.0s",
                    "format": "MIDI"
                },
                "message": "Music generated successfully (simulated mode)"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Generation simulation failed: {str(e)}"
            }