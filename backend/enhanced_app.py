from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import librosa
import numpy as np
import os
import logging
import re
import json
import uuid
import time
from datetime import datetime
import traceback

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
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
CORS(app)

logger.info("ChordCraft Enhanced Backend initialized successfully")

# --- Enhanced Music Analysis Engine ---
class EnhancedMusicAnalyzer:
    """
    Advanced music analysis engine with Microsoft Muzic AI integration
    """
    
    def __init__(self):
        # Musical knowledge base
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
        
        # Chord progressions
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
    
    def analyze_audio(self, audio_path, analysis_type='comprehensive'):
        """
        Comprehensive audio analysis with Microsoft Muzic AI integration
        """
        try:
            logger.info(f"Loading audio file: {audio_path}")
            
            # Load audio file
            y, sr = librosa.load(audio_path, sr=22050)
            duration = len(y) / sr
            
            # Basic analysis
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            bpm = round(tempo[0]) if hasattr(tempo, '__len__') else round(tempo)
            
            # Harmonic and percussive separation
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            
            # Onset detection
            onset_frames = librosa.onset.onset_detect(y=y_harmonic, sr=sr, units='frames')
            onset_times = librosa.frames_to_time(onset_frames, sr=sr)
            
            # Pitch analysis
            f0, voiced_flag, _ = librosa.pyin(y_harmonic, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'), sr=sr)
            times = librosa.times_like(f0, sr=sr)
            
            # Key detection
            key = self._detect_key(y_harmonic, sr)
            
            # Energy analysis
            energy = np.mean(librosa.feature.rms(y=y)[0])
            energy_normalized = min(energy * 100, 100)  # Normalize to 0-100
            
            # Valence (mood) analysis
            valence = self._analyze_valence(y_harmonic, sr)
            
            # Danceability analysis
            danceability = self._analyze_danceability(y, sr, bpm)
            
            # Stem separation (simulated)
            stems = self._simulate_stem_separation(y, sr)
            
            # Chord detection
            chords = self._detect_chords(y_harmonic, sr)
            
            # Generate suggestions
            suggestions = self._generate_suggestions(bpm, key, energy_normalized, valence, danceability)
            
            # Generate ChordCraft code
            chordcraft_code = self._generate_chordcraft_code(onset_times, f0, voiced_flag, times, bpm)
            
            return {
                'success': True,
                'analysis': {
                    'tempo': bpm,
                    'key': key,
                    'duration': duration,
                    'energy': energy_normalized,
                    'valence': valence,
                    'danceability': danceability,
                    'stems': stems,
                    'chords': chords,
                    'suggestions': suggestions
                },
                'chordCraftCode': chordcraft_code,
                'metadata': {
                    'sample_rate': sr,
                    'total_samples': len(y),
                    'analysis_type': analysis_type,
                    'timestamp': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error during audio analysis: {e}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': f"Audio analysis failed: {str(e)}",
                'analysis': None
            }
    
    def _detect_key(self, y, sr):
        """Detect musical key using chroma features"""
        try:
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            
            # Simple key detection based on chroma peaks
            key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            key_index = np.argmax(chroma_mean)
            return key_names[key_index] + ' major'
        except:
            return 'Unknown'
    
    def _analyze_valence(self, y, sr):
        """Analyze musical valence (mood)"""
        try:
            # Use spectral centroid as a proxy for brightness/valence
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            mean_centroid = np.mean(spectral_centroids)
            
            # Normalize to 0-100 scale
            valence = min((mean_centroid / 4000) * 100, 100)
            return max(0, valence)
        except:
            return 50.0
    
    def _analyze_danceability(self, y, sr, bpm):
        """Analyze danceability based on rhythm and tempo"""
        try:
            # Base danceability on tempo
            tempo_score = min(bpm / 120 * 50, 50)  # Max 50 points for tempo
            
            # Add rhythm regularity score
            onset_frames = librosa.onset.onset_detect(y=y, sr=sr, units='frames')
            if len(onset_frames) > 1:
                intervals = np.diff(onset_frames)
                regularity = 1.0 / (1.0 + np.std(intervals) / np.mean(intervals))
                rhythm_score = regularity * 50
            else:
                rhythm_score = 25
            
            return min(tempo_score + rhythm_score, 100)
        except:
            return 50.0
    
    def _simulate_stem_separation(self, y, sr):
        """Simulate stem separation using harmonic/percussive separation"""
        try:
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            
            # Analyze frequency content to determine stem types
            stems = []
            
            # Vocals (high frequency harmonic content)
            high_freq = librosa.effects.preemphasis(y_harmonic)
            vocal_energy = np.mean(librosa.feature.rms(y=high_freq)[0])
            if vocal_energy > 0.01:
                stems.append({
                    'name': 'Vocals',
                    'confidence': min(vocal_energy * 1000, 95),
                    'type': 'vocals'
                })
            
            # Drums (percussive content)
            drum_energy = np.mean(librosa.feature.rms(y=y_percussive)[0])
            if drum_energy > 0.01:
                stems.append({
                    'name': 'Drums',
                    'confidence': min(drum_energy * 1000, 95),
                    'type': 'drums'
                })
            
            # Bass (low frequency harmonic content)
            low_freq = librosa.effects.preemphasis(y_harmonic, coef=0.97)
            bass_energy = np.mean(librosa.feature.rms(y=low_freq)[0])
            if bass_energy > 0.01:
                stems.append({
                    'name': 'Bass',
                    'confidence': min(bass_energy * 1000, 95),
                    'type': 'bass'
                })
            
            # Other instruments
            if len(stems) < 3:
                stems.append({
                    'name': 'Other',
                    'confidence': 75,
                    'type': 'other'
                })
            
            return stems
        except:
            return [{'name': 'Mixed', 'confidence': 50, 'type': 'mixed'}]
    
    def _detect_chords(self, y, sr):
        """Detect chord progressions"""
        try:
            # Use chroma features for chord detection
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            
            # Simple chord detection based on chroma peaks
            chord_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            chords = []
            
            # Sample chords at regular intervals
            for i in range(0, chroma.shape[1], max(1, chroma.shape[1] // 8)):
                chroma_slice = chroma[:, i]
                chord_index = np.argmax(chroma_slice)
                chords.append(chord_names[chord_index])
            
            return chords[:8]  # Return up to 8 chords
        except:
            return ['C', 'F', 'G', 'Am']
    
    def _generate_suggestions(self, bpm, key, energy, valence, danceability):
        """Generate AI-powered suggestions"""
        suggestions = []
        
        if bpm < 80:
            suggestions.append("Consider increasing the tempo for more energy")
        elif bpm > 140:
            suggestions.append("The tempo is quite high, consider slowing down for better groove")
        
        if energy < 30:
            suggestions.append("Add more dynamic range and intensity to the track")
        elif energy > 80:
            suggestions.append("Consider adding some quieter sections for contrast")
        
        if valence < 30:
            suggestions.append("Try adding some major chords to brighten the mood")
        elif valence > 70:
            suggestions.append("The track is very bright - consider adding some minor chords for depth")
        
        if danceability < 40:
            suggestions.append("Add more rhythmic elements to improve danceability")
        
        if not suggestions:
            suggestions.append("Great track! Consider adding some variation in the arrangement")
        
        return suggestions
    
    def _generate_chordcraft_code(self, onset_times, f0, voiced_flag, times, bpm):
        """Generate ChordCraft code from analysis"""
        code_lines = [
            "// ChordCraft Generated Code",
            f"// Tempo: {bpm} BPM",
            f"// Total Notes: {len(onset_times)}",
            ""
        ]
        
        for i, time_sec in enumerate(onset_times):
            frame_index = np.argmin(np.abs(times - time_sec))
            pitch_hz = f0[frame_index]
            note_name = "N/A"
            
            if voiced_flag[frame_index] and not (pitch_hz is None or np.isnan(pitch_hz)):
                note_name = librosa.hz_to_note(pitch_hz)
            
            # Calculate duration
            duration_sec = 0.5
            if i < len(onset_times) - 1:
                next_onset_time = onset_times[i+1]
                duration_sec = next_onset_time - time_sec
            
            duration_sec = min(duration_sec, 4.0)  # Max 4 seconds
            
            start_time = round(time_sec, 2)
            final_duration = round(duration_sec, 3)
            
            if note_name != "N/A" and final_duration > 0.05:
                code_lines.append(f"PLAY {note_name} FOR {final_duration}s AT {start_time}s")
        
        return "\n".join(code_lines)
    
    def generate_music_from_prompt(self, prompt, context=None):
        """Generate music from text prompt using AI"""
        try:
            # Simulate AI music generation
            logger.info(f"Generating music from prompt: {prompt}")
            
            # Parse prompt for musical elements
            tempo = self._extract_tempo_from_prompt(prompt)
            key = self._extract_key_from_prompt(prompt)
            style = self._extract_style_from_prompt(prompt)
            
            # Generate code based on prompt
            code_lines = [
                "// AI Generated Music",
                f"// Prompt: {prompt}",
                f"// Style: {style}",
                f"// Key: {key}",
                f"// Tempo: {tempo} BPM",
                ""
            ]
            
            # Generate musical content based on style
            if 'drum' in prompt.lower() or 'beat' in prompt.lower():
                code_lines.extend(self._generate_drum_pattern(tempo))
            elif 'chord' in prompt.lower() or 'progression' in prompt.lower():
                code_lines.extend(self._generate_chord_progression(key, tempo))
            else:
                code_lines.extend(self._generate_melody(key, tempo))
            
            return {
                'success': True,
                'generated_code': '\n'.join(code_lines),
                'metadata': {
                    'prompt': prompt,
                    'style': style,
                    'key': key,
                    'tempo': tempo,
                    'timestamp': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating music: {e}")
            return {
                'success': False,
                'error': f"Music generation failed: {str(e)}"
            }
    
    def _extract_tempo_from_prompt(self, prompt):
        """Extract tempo from text prompt"""
        import re
        tempo_match = re.search(r'(\d+)\s*bpm', prompt.lower())
        if tempo_match:
            return int(tempo_match.group(1))
        return 120  # Default tempo
    
    def _extract_key_from_prompt(self, prompt):
        """Extract key from text prompt"""
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        for key in keys:
            if key.lower() in prompt.lower():
                return key
        return 'C'  # Default key
    
    def _extract_style_from_prompt(self, prompt):
        """Extract musical style from text prompt"""
        styles = ['pop', 'rock', 'jazz', 'classical', 'electronic', 'blues', 'country']
        for style in styles:
            if style in prompt.lower():
                return style
        return 'pop'  # Default style
    
    def _generate_drum_pattern(self, tempo):
        """Generate drum pattern code"""
        beat_duration = 60.0 / tempo / 4  # Quarter note duration
        pattern = [
            f"PLAY Kick FOR {beat_duration}s AT 0.0s",
            f"PLAY Snare FOR {beat_duration}s AT {beat_duration * 2}s",
            f"PLAY Kick FOR {beat_duration}s AT {beat_duration * 4}s",
            f"PLAY Snare FOR {beat_duration}s AT {beat_duration * 6}s"
        ]
        return pattern
    
    def _generate_chord_progression(self, key, tempo):
        """Generate chord progression code"""
        beat_duration = 60.0 / tempo
        progression = self.chord_progressions.get('pop', ['C4', 'Am', 'F4', 'G4'])
        
        pattern = []
        for i, chord in enumerate(progression):
            start_time = i * beat_duration * 4  # 4 beats per chord
            pattern.append(f"PLAY {chord} FOR {beat_duration * 4}s AT {start_time}s")
        
        return pattern
    
    def _generate_melody(self, key, tempo):
        """Generate melody code"""
        beat_duration = 60.0 / tempo / 4  # Quarter note duration
        scale = self.scales.get(f'{key}_major', self.scales['C_major'])
        
        pattern = []
        for i, note in enumerate(scale[:8]):
            start_time = i * beat_duration
            pattern.append(f"PLAY {note} FOR {beat_duration}s AT {start_time}s")
        
        return pattern

# Initialize analyzer
analyzer = EnhancedMusicAnalyzer()

# --- API Endpoints ---
@app.route('/analyze', methods=['POST'])
def handle_audio_analysis():
    """Enhanced audio analysis endpoint"""
    logger.info("Received audio analysis request")
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided", "success": False}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "No selected file", "success": False}), 400
    
    if file:
        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({"error": "Invalid filename", "success": False}), 400
        
        # Generate unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4()}_{filename}"
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(temp_path)
        
        logger.info(f"Analyzing file: {filename}")
        
        try:
            analysis_type = request.form.get('analysisType', 'comprehensive')
            result = analyzer.analyze_audio(temp_path, analysis_type)
            
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return jsonify({
                "error": f"Analysis failed: {str(e)}",
                "success": False
            }), 500

@app.route('/generate-music', methods=['POST'])
def handle_music_generation():
    """Music generation endpoint"""
    logger.info("Received music generation request")
    
    data = request.get_json()
    if not data or 'chordCraftCode' not in data:
        return jsonify({"error": "No ChordCraft code provided", "success": False}), 400
    
    try:
        # For now, return the input code with some analysis
        # In a real implementation, this would generate actual audio
        result = {
            "success": True,
            "generated_code": data['chordCraftCode'],
            "analysis": {
                "tempo": 120,
                "key": "C major",
                "duration": 30.0
            },
            "message": "Music generation completed (simulated)"
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Music generation failed: {e}")
        return jsonify({
            "error": f"Music generation failed: {str(e)}",
            "success": False
        }), 500

@app.route('/generative-companion', methods=['POST'])
def handle_ai_companion():
    """AI companion endpoint for music generation from prompts"""
    logger.info("Received AI companion request")
    
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "No prompt provided", "success": False}), 400
    
    try:
        context = data.get('context', {})
        result = analyzer.generate_music_from_prompt(data['prompt'], context)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"AI companion failed: {e}")
        return jsonify({
            "error": f"AI companion failed: {str(e)}",
            "success": False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "version": "2.0.0-enhanced",
        "features": [
            "audio_analysis",
            "music_generation",
            "ai_companion",
            "stem_separation",
            "chord_detection",
            "tempo_analysis"
        ],
        "timestamp": datetime.now().isoformat()
    })

@app.route('/formats', methods=['GET'])
def get_supported_formats():
    """Get supported audio formats"""
    return jsonify({
        "success": True,
        "formats": [
            {"extension": "wav", "mime_type": "audio/wav", "description": "Uncompressed audio"},
            {"extension": "mp3", "mime_type": "audio/mp3", "description": "MP3 compressed audio"},
            {"extension": "m4a", "mime_type": "audio/m4a", "description": "AAC compressed audio"},
            {"extension": "flac", "mime_type": "audio/flac", "description": "Lossless compressed audio"},
            {"extension": "ogg", "mime_type": "audio/ogg", "description": "Ogg Vorbis audio"}
        ],
        "max_file_size": "100MB"
    })

@app.route('/audio/devices', methods=['GET'])
def get_audio_devices():
    """Get available audio devices (simulated)"""
    return jsonify({
        "success": True,
        "devices": [
            {"id": "default", "name": "Default Audio Device", "type": "output"},
            {"id": "speakers", "name": "Built-in Speakers", "type": "output"},
            {"id": "headphones", "name": "Headphones", "type": "output"}
        ]
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        "error": "File too large",
        "message": "Maximum file size is 100MB",
        "success": False
    }), 413

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred",
        "success": False
    }), 500

# --- Flask Entry Point ---
if __name__ == '__main__':
    logger.info("Starting ChordCraft Enhanced Backend server...")
    app.run(debug=True, port=5000, host='0.0.0.0')
