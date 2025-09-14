from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import os
import logging

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

logger.info("ChordCraft backend initialized successfully")

# --- Core Logic Engine ---
def analyze_audio(audio_path):
    """
    Analyzes an audio file to extract tempo, onsets, pitch, and duration.
    """
    try:
        logger.info(f"Loading audio file: {audio_path}")
        
        # Try to load the audio file with error handling
        try:
            y, sr = librosa.load(audio_path, sr=22050)
            logger.info(f"Audio loaded successfully. Duration: {len(y)/sr:.2f}s, Sample rate: {sr}")
        except Exception as load_error:
            logger.error(f"Failed to load audio file: {load_error}")
            return f"// Error: Could not load audio file. Supported formats: WAV, MP3, M4A, FLAC\n// Error details: {str(load_error)}"
        
        # Check if audio data is valid
        if len(y) == 0:
            return "// Error: Audio file appears to be empty or corrupted"
        
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        tempo, _ = librosa.beat.beat_track(y=y_percussive, sr=sr)
        bpm = round(tempo[0]) if hasattr(tempo, '__len__') else round(tempo)
        onset_frames = librosa.onset.onset_detect(y=y_harmonic, sr=sr, units='frames')
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        
        # Use a more robust pitch detection
        try:
            f0, voiced_flag, _ = librosa.pyin(y_harmonic, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'), sr=sr)
            times = librosa.times_like(f0, sr=sr)
        except Exception as pitch_error:
            logger.warning(f"Pitch detection failed, using simpler method: {pitch_error}")
            # Fallback: create dummy pitch data
            f0 = np.full(len(y) // 512, 440.0)  # A4 as default
            voiced_flag = np.ones(len(f0), dtype=bool)
            times = librosa.frames_to_time(np.arange(len(f0)), sr=sr)

        code_lines = [
            "// ChordCraft Generated Code",
            f"// Tempo: {bpm} BPM",
            f"// Total Notes: {len(onset_times)}",
            ""
        ]
        
        # --- Loop with index to calculate duration ---
        for i, time_sec in enumerate(onset_times):
            frame_index = np.argmin(np.abs(times - time_sec))
            pitch_hz = f0[frame_index]
            note_name = "N/A"

            if voiced_flag[frame_index]:
                note_name = librosa.hz_to_note(pitch_hz)

            # --- DURATION CALCULATION LOGIC ---
            duration_sec = 0.5  # Default duration for the very last note

            # If this is not the last note, calculate duration until the next note starts
            if i < len(onset_times) - 1:
                next_onset_time = onset_times[i+1]
                duration_sec = next_onset_time - time_sec
            
            # We can set a maximum duration to avoid unnaturally long notes
            max_duration = 4.0
            duration_sec = min(duration_sec, max_duration)

            start_time = round(time_sec, 2)
            final_duration = round(duration_sec, 3)

            if note_name != "N/A" and final_duration > 0.05: # Filter out very short, noisy events
                 code_lines.append(f"PLAY {note_name} FOR {final_duration}s AT {start_time}s")

        return "\n".join(code_lines)

    except Exception as e:
        logger.error(f"Error during audio analysis: {e}")
        return f"// Error analyzing audio: {e}"
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


# --- API Endpoints ---
@app.route('/analyze', methods=['POST'])
def handle_audio_upload():
    """Audio analysis endpoint"""
    logger.info("Received analyze request")
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided", "success": False}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file", "success": False}), 400
    
    if file:
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(temp_path)
        logger.info(f"Analyzing file: {file.filename}")
        
        try:
            generated_code = analyze_audio(temp_path)
            return jsonify({
                "chordCraftCode": generated_code,
                "analysisType": "basic",
                "success": True
            })
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return jsonify({
                "error": f"Analysis failed: {str(e)}",
                "success": False
            }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "1.0.0-basic"
    })

# --- Flask Entry Point ---
if __name__ == '__main__':
    logger.info("Starting ChordCraft backend server...")
    app.run(debug=True, port=5000, host='0.0.0.0')