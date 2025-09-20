# ChordCraft audio codec - handles both lossless FLAC and neural codec encoding
# this is the core of how we convert audio files into embeddable code

import base64
import hashlib
import io
import json
import math
import sys
from typing import Dict, List, Tuple, Optional, Union
import numpy as np
import soundfile as sf
import librosa

# try to load the neural codec stuff - it's optional
try:
    import torch
    from transformers import AutoModel, AutoTokenizer
    NEURAL_CODECS_AVAILABLE = True
except ImportError:
    NEURAL_CODECS_AVAILABLE = False
    print("Neural codecs not available. Install them with: pip install torch transformers")

CHUNK_SIZE = 65536  # how big each base64 chunk should be for copy-paste

class ChordCraftCodec:
    def __init__(self, target_sr: int = 44100, stereo: bool = True):
        self.target_sr = target_sr
        self.stereo = stereo
        self.chunk_size = CHUNK_SIZE
        
    def encode_lossless(self, audio_path: str) -> Tuple[bytes, Dict]:
        """turn audio into lossless FLAC data"""
        y, sr = librosa.load(audio_path, sr=self.target_sr, mono=not self.stereo)
        
        if y.ndim == 1 and self.stereo:
            y = np.vstack([y, y])  # make mono into stereo by duplicating
        
        y = (y.T).astype(np.float32)
        buf = io.BytesIO()
        sf.write(buf, y, self.target_sr, format="FLAC", subtype="PCM_16")
        flac_bytes = buf.getvalue()
        
        # Calculate metadata
        duration = len(y) / self.target_sr
        sha256_hash = hashlib.sha256(flac_bytes).hexdigest()
        
        metadata = {
            "format": "flac",
            "sample_rate": self.target_sr,
            "channels": 2 if self.stereo else 1,
            "duration": duration,
            "sha256": sha256_hash,
            "size_bytes": len(flac_bytes)
        }
        
        return flac_bytes, metadata
    
    def encode_neural(self, audio_path: str, model_name: str = "facebook/encodec_24khz") -> Tuple[List, Dict]:
        """Encode audio using neural codec (EnCodec)"""
        if not NEURAL_CODECS_AVAILABLE:
            raise ImportError("Neural codecs not available. Install torch and transformers.")
        
        # Load audio
        y, sr = librosa.load(audio_path, sr=24000, mono=True)  # EnCodec works best at 24kHz mono
        duration = len(y) / sr
        
        # Convert to tensor
        audio_tensor = torch.tensor(y).unsqueeze(0).unsqueeze(0)  # (1, 1, T)
        
        # Load model (simplified - in practice you'd cache this)
        # This is a placeholder - actual implementation would load the real model
        print(f"Encoding with {model_name} (placeholder implementation)")
        
        # Simulate encoding (replace with actual model)
        # In practice: model = EncodecModel.from_pretrained(model_name)
        # codes = model.encode(audio_tensor)
        
        # For now, create a simple representation
        codes = y[::100].tolist()  # Downsample for demo
        tokens = [int(x * 1000) for x in codes]  # Convert to integer tokens
        
        metadata = {
            "format": "neural_codec",
            "model": model_name,
            "sample_rate": 24000,
            "channels": 1,
            "duration": duration,
            "tokens_count": len(tokens),
            "compression_ratio": len(y) / len(tokens)
        }
        
        return tokens, metadata
    
    def create_chordcraft_code(self, 
                              audio_path: str, 
                              bpm: Optional[int] = None,
                              key: str = "Unknown",
                              time_sig: str = "4/4",
                              chords: Optional[str] = None,
                              include_lossless: bool = True,
                              include_neural: bool = False) -> str:
        """Create ChordCraft v2 code with both lossless and neural encoding"""
        
        # Analyze audio if metadata not provided
        if bpm is None:
            try:
                tempo, _ = librosa.beat.beat_track(y=None, sr=self.target_sr)
                bpm = int(round(tempo))
            except:
                bpm = 120
        
        chords_line = chords or "| N | N | N | N |"
        
        # Build code structure
        lines = []
        lines.append("Song {")
        lines.append(f'  meta: {{ bpm: {bpm}, key: "{key}", time: "{time_sig}" }}')
        lines.append("  analysis: {")
        lines.append(f"    chords: {chords_line}")
        lines.append("  }")
        
        # Add lossless payload if requested
        if include_lossless:
            flac_bytes, flac_meta = self.encode_lossless(audio_path)
            b64_data = base64.b64encode(flac_bytes).decode("ascii")
            total_chunks = math.ceil(len(b64_data) / self.chunk_size)
            
            lines.append("  audio: {")
            lines.append(f'    format: "flac", sr: {flac_meta["sample_rate"]}, channels: {flac_meta["channels"]},')
            lines.append(f'    sha256: "{flac_meta["sha256"]}", chunks: {total_chunks}, chunk_size: {self.chunk_size}')
            lines.append("  }")
            lines.append("")
            
            # Add FLAC chunks
            for i in range(total_chunks):
                start = i * self.chunk_size
                end = min((i + 1) * self.chunk_size, len(b64_data))
                lines.append(f"<<PAYLOAD:FLAC:{i+1}>>")
                lines.append(b64_data[start:end])
        
        # Add neural codec if requested
        if include_neural and NEURAL_CODECS_AVAILABLE:
            try:
                tokens, neural_meta = self.encode_neural(audio_path)
                lines.append("")
                lines.append("  neural: {")
                lines.append(f'    format: "neural_codec", model: "{neural_meta["model"]}",')
                lines.append(f'    tokens: {len(tokens)}, compression_ratio: {neural_meta["compression_ratio"]:.2f}')
                lines.append("  }")
                lines.append("")
                
                # Add neural tokens (much smaller)
                tokens_json = json.dumps(tokens)
                lines.append("<<NEURAL_TOKENS>>")
                lines.append(tokens_json)
            except Exception as e:
                print(f"Neural encoding failed: {e}")
        
        lines.append("}")
        return "\n".join(lines)

def main():
    """CLI for encoding audio files"""
    if len(sys.argv) < 2:
        print("Usage: python audio_codec.py <audio_file> [--neural] [--lossless-only]")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    include_neural = "--neural" in sys.argv
    lossless_only = "--lossless-only" in sys.argv
    
    codec = ChordCraftCodec()
    
    try:
        code = codec.create_chordcraft_code(
            audio_path=audio_path,
            include_lossless=not lossless_only,
            include_neural=include_neural
        )
        print(code)
    except Exception as e:
        print(f"Error encoding audio: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
