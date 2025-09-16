from http.server import BaseHTTPRequestHandler
import json
import traceback

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            prompt = data.get('prompt', '')
            if not prompt:
                self.send_error(400, "No prompt provided")
                return
            
            result = self.simulate_ai_companion(prompt)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"success": False, "error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
    
    def simulate_ai_companion(self, prompt):
        generated_code = """// AI-Generated Music
BPM = 120;
TIME_SIGNATURE = "4/4";
KEY = "C Major";

PATTERN ai_generated = {
  PLAY C4 FOR 1s AT 0s;
  PLAY E4 FOR 1s AT 1s;
  PLAY G4 FOR 1s AT 2s;
  PLAY C5 FOR 1s AT 3s;
};

APPLY ai_generated TO main_track;"""
        
        return {
            "success": True,
            "generated_code": generated_code,
            "response_text": f"Generated music based on: {prompt}",
            "message": "AI companion response generated successfully"
        }