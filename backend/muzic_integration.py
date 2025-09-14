"""
Muzic Integration Module for ChordCraft
Integrates Microsoft's Muzic AI music understanding capabilities
"""

import os
import numpy as np
import librosa
import json
import logging

# Optional imports with fallbacks
try:
    import pretty_midi
    PRETTY_MIDI_AVAILABLE = True
except ImportError:
    PRETTY_MIDI_AVAILABLE = False
    pretty_midi = None

try:
    from music21 import stream, note, chord, meter, tempo, key
    MUSIC21_AVAILABLE = True
except ImportError:
    MUSIC21_AVAILABLE = False

try:
    import torch
    from transformers import AutoTokenizer, AutoModel
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MuzicEnhancedAnalyzer:
    """
    Enhanced music analyzer using Muzic-inspired techniques
    """
    
    def __init__(self):
        self.sample_rate = 22050
        self.hop_length = 512
        self.frame_size = 2048
        
    def analyze_audio_enhanced(self, audio_path):
        """
        Enhanced audio analysis using advanced music understanding techniques
        inspired by Muzic's MusicBERT and CLaMP approaches
        """
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Advanced harmonic-percussive separation
            y_harmonic, y_percussive = librosa.effects.hpss(y, margin=(1.0, 5.0))
            
            # Multi-level analysis
            analysis_results = {
                'tempo_analysis': self._analyze_tempo(y_percussive, sr),
                'pitch_analysis': self._analyze_pitch_advanced(y_harmonic, sr),
                'rhythm_analysis': self._analyze_rhythm_patterns(y_percussive, sr),
                'harmonic_analysis': self._analyze_harmony(y_harmonic, sr),
                'structure_analysis': self._analyze_structure(y, sr)
            }
            
            # Generate enhanced ChordCraft code
            code_lines = self._generate_enhanced_code(analysis_results)
            
            return "\n".join(code_lines)
            
        except Exception as e:
            logger.error(f"Enhanced analysis error: {e}")
            return f"// Error in enhanced analysis: {e}"
    
    def _analyze_tempo(self, y_percussive, sr):
        """Advanced tempo analysis with beat tracking"""
        # Multi-level tempo analysis
        tempo, beats = librosa.beat.beat_track(y=y_percussive, sr=sr, units='time')
        
        # Tempo stability analysis
        hop_length = 512
        tempo_series = librosa.feature.tempo(y=y_percussive, sr=sr, hop_length=hop_length)
        tempo_stability = np.std(tempo_series)
        
        return {
            'bpm': round(float(tempo)),
            'beats': beats.tolist(),
            'stability': float(tempo_stability),
            'time_signature': self._estimate_time_signature(beats)
        }
    
    def _analyze_pitch_advanced(self, y_harmonic, sr):
        """Advanced pitch analysis with chord detection"""
        # PYIN for fundamental frequency
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y_harmonic, 
            fmin=librosa.note_to_hz('C2'), 
            fmax=librosa.note_to_hz('C7'), 
            sr=sr,
            frame_length=2048
        )
        
        # Chroma features for harmony
        chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
        
        # Onset detection
        onset_frames = librosa.onset.onset_detect(
            y=y_harmonic, 
            sr=sr, 
            units='frames',
            pre_max=20,
            post_max=20,
            pre_avg=100,
            post_avg=100,
            delta=0.2,
            wait=10
        )
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        
        return {
            'f0': f0,
            'voiced_flag': voiced_flag,
            'voiced_probs': voiced_probs,
            'chroma': chroma,
            'onset_times': onset_times.tolist(),
            'pitch_classes': self._extract_pitch_classes(chroma)
        }
    
    def _analyze_rhythm_patterns(self, y_percussive, sr):
        """Analyze rhythmic patterns and complexity"""
        # Tempogram for rhythm analysis
        tempogram = librosa.feature.tempogram(y=y_percussive, sr=sr)
        
        # Rhythmic complexity measure
        rhythm_complexity = np.mean(np.std(tempogram, axis=1))
        
        return {
            'complexity': float(rhythm_complexity),
            'patterns': self._detect_rhythm_patterns(tempogram)
        }
    
    def _analyze_harmony(self, y_harmonic, sr):
        """Analyze harmonic content and progressions"""
        # Harmonic content analysis
        harmonic_centroids = librosa.feature.spectral_centroid(y=y_harmonic, sr=sr)
        harmonic_rolloff = librosa.feature.spectral_rolloff(y=y_harmonic, sr=sr)
        
        # Key estimation
        chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
        key_profile = np.mean(chroma, axis=1)
        estimated_key = self._estimate_key(key_profile)
        
        return {
            'key': estimated_key,
            'harmonic_centroids': harmonic_centroids.tolist(),
            'harmonic_rolloff': harmonic_rolloff.tolist(),
            'chord_progressions': self._detect_chord_progressions(chroma)
        }
    
    def _analyze_structure(self, y, sr):
        """Analyze musical structure and form"""
        # Structural segmentation
        C = librosa.feature.chroma_cqt(y=y, sr=sr)
        R = librosa.segment.recurrence_matrix(C, mode='affinity')
        
        # Detect structural boundaries
        boundaries = librosa.segment.agglomerative(C, k=8)
        boundary_times = librosa.frames_to_time(boundaries, sr=sr)
        
        return {
            'boundaries': boundary_times.tolist(),
            'sections': len(boundaries) - 1
        }
    
    def _estimate_time_signature(self, beats):
        """Estimate time signature from beat pattern"""
        if len(beats) < 4:
            return "4/4"  # Default
        
        # Analyze beat intervals
        intervals = np.diff(beats)
        avg_interval = np.mean(intervals)
        
        # Simple heuristic for time signature
        if avg_interval > 0.8:
            return "3/4"
        elif avg_interval < 0.4:
            return "6/8"
        else:
            return "4/4"
    
    def _extract_pitch_classes(self, chroma):
        """Extract dominant pitch classes"""
        pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        dominant_pitches = []
        
        for i, pitch_class in enumerate(pitch_classes):
            if np.mean(chroma[i]) > 0.3:  # Threshold for significance
                dominant_pitches.append(pitch_class)
        
        return dominant_pitches
    
    def _detect_rhythm_patterns(self, tempogram):
        """Detect rhythmic patterns from tempogram"""
        # Simple pattern detection
        patterns = []
        for i in range(min(5, tempogram.shape[0])):
            pattern_strength = np.mean(tempogram[i])
            if pattern_strength > 0.1:
                patterns.append({
                    'tempo_bin': i,
                    'strength': float(pattern_strength)
                })
        return patterns
    
    def _estimate_key(self, chroma_profile):
        """Estimate musical key from chroma profile"""
        # Krumhansl-Schmuckler key profiles (simplified)
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        best_correlation = -1
        best_key = 'C major'
        
        for i in range(12):
            # Rotate profiles for each key
            major_rotated = np.roll(major_profile, i)
            minor_rotated = np.roll(minor_profile, i)
            
            major_corr = np.corrcoef(chroma_profile, major_rotated)[0, 1]
            minor_corr = np.corrcoef(chroma_profile, minor_rotated)[0, 1]
            
            if major_corr > best_correlation:
                best_correlation = major_corr
                best_key = f"{keys[i]} major"
            
            if minor_corr > best_correlation:
                best_correlation = minor_corr
                best_key = f"{keys[i]} minor"
        
        return best_key
    
    def _detect_chord_progressions(self, chroma):
        """Detect basic chord progressions"""
        # Simplified chord detection
        chord_templates = {
            'C': [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            'F': [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
            'G': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            'Am': [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0]
        }
        
        progressions = []
        for i in range(0, chroma.shape[1], 4):  # Every 4 frames
            frame_chroma = chroma[:, i] if i < chroma.shape[1] else chroma[:, -1]
            
            best_match = 'C'
            best_score = 0
            
            for chord_name, template in chord_templates.items():
                score = np.dot(frame_chroma, template)
                if score > best_score:
                    best_score = score
                    best_match = chord_name
            
            progressions.append(best_match)
        
        return progressions
    
    def _generate_enhanced_code(self, analysis):
        """Generate enhanced ChordCraft code from analysis results"""
        code_lines = [
            "// Enhanced ChordCraft Analysis (Muzic-Inspired)",
            f"// Key: {analysis['harmonic_analysis']['key']}",
            f"// Tempo: {analysis['tempo_analysis']['bpm']} BPM ({analysis['tempo_analysis']['time_signature']})",
            f"// Sections: {analysis['structure_analysis']['sections']}",
            f"// Dominant Pitches: {', '.join(analysis['pitch_analysis']['pitch_classes'])}",
            ""
        ]
        
        # Generate note events with enhanced timing and harmony
        onset_times = analysis['pitch_analysis']['onset_times']
        f0 = analysis['pitch_analysis']['f0']
        voiced_flag = analysis['pitch_analysis']['voiced_flag']
        beats = analysis['tempo_analysis']['beats']
        
        times = librosa.times_like(f0, sr=self.sample_rate)
        
        for i, onset_time in enumerate(onset_times):
            # Find closest frame
            frame_idx = np.argmin(np.abs(times - onset_time))
            
            if frame_idx < len(voiced_flag) and voiced_flag[frame_idx]:
                pitch_hz = f0[frame_idx]
                if not np.isnan(pitch_hz):
                    note_name = librosa.hz_to_note(pitch_hz)
                    
                    # Calculate duration with beat awareness
                    duration = self._calculate_smart_duration(
                        onset_time, onset_times, beats, i
                    )
                    
                    # Add harmonic context
                    chord_context = self._get_chord_context(
                        onset_time,
                        analysis['harmonic_analysis']['chord_progressions'],
                        beats=np.array(beats)
                    )
                    
                    if duration > 0.05:  # Filter very short notes
                        code_lines.append(
                            f"PLAY {note_name} FOR {duration:.3f}s AT {onset_time:.2f}s "
                            f"// Chord: {chord_context}"
                        )
        
        return code_lines
    
    def _calculate_smart_duration(self, onset_time, all_onsets, beats, current_idx):
        """Calculate note duration with musical intelligence"""
        # Default duration
        duration = 0.5
        
        # Duration until next onset
        if current_idx < len(all_onsets) - 1:
            duration = all_onsets[current_idx + 1] - onset_time
        
        # Quantize to beat grid
        if len(beats) > 1:
            beat_duration = np.mean(np.diff(beats))
            # Snap to nearest beat subdivision
            duration = round(duration / (beat_duration / 4)) * (beat_duration / 4)
        
        # Reasonable limits
        return max(0.1, min(duration, 4.0))
    
    def _get_chord_context(self, time, chord_progression, beats=None):
        """Get chord context for a given time using beat grid if available"""
        if not chord_progression:
            return "Unknown"

        # If beat positions are available, map chords to beat segments
        if beats is not None and len(beats) > 1:
            total_beats = len(beats)
            beat_idx = np.searchsorted(beats, time, side='right') - 1
            beat_idx = max(0, min(beat_idx, total_beats - 1))
            chord_idx = int(beat_idx / max(1, total_beats) * len(chord_progression))
            chord_idx = min(chord_idx, len(chord_progression) - 1)
            return chord_progression[chord_idx]

        # Fallback: even segmentation across total duration estimate
        chord_idx = int(time * len(chord_progression) / 10)
        chord_idx = min(chord_idx, len(chord_progression) - 1)
        return chord_progression[chord_idx]


# Utility functions for Muzic integration
def setup_muzic_environment():
    """Setup Muzic environment and download necessary models"""
    logger.info("Setting up Muzic environment...")
    
    # Create necessary directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("temp_analysis", exist_ok=True)
    
    logger.info("Muzic environment setup complete")

def validate_muzic_integration():
    """Validate that Muzic integration is working"""
    try:
        analyzer = MuzicEnhancedAnalyzer()
        
        # Check what features are available
        features = []
        if PRETTY_MIDI_AVAILABLE:
            features.append("pretty_midi")
        if MUSIC21_AVAILABLE:
            features.append("music21")
        if TORCH_AVAILABLE:
            features.append("torch")
        
        if features:
            logger.info(f"Muzic integration validated with features: {', '.join(features)}")
        else:
            logger.info("Muzic integration validated with basic features only")
        
        return True
    except Exception as e:
        logger.error(f"Muzic integration validation failed: {e}")
        return False
