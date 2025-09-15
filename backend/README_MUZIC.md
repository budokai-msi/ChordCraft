# ChordCraft + Muzic Integration

This document explains how Microsoft's [Muzic](https://github.com/microsoft/muzic) AI music research project has been integrated into ChordCraft to provide enhanced music-to-code analysis capabilities.

## What is Muzic?

Muzic is a research project by Microsoft Research Asia that focuses on AI music understanding and generation. It includes various components for:

- **Music Understanding**: Symbolic music analysis, automatic transcription
- **Music Generation**: Song writing, melody generation, accompaniment
- **Cross-Modal Processing**: Text-to-music and music-to-text capabilities

## Integration Overview

We've integrated key Muzic concepts and techniques to enhance ChordCraft's audio analysis:

### Enhanced Features

1. **Advanced Harmonic Analysis**
   - Key detection using Krumhansl-Schmuckler profiles
   - Chord progression recognition
   - Harmonic context awareness

2. **Intelligent Rhythm Analysis**
   - Beat-aware duration calculation
   - Time signature estimation
   - Rhythmic pattern detection

3. **Musical Structure Understanding**
   - Section boundary detection
   - Form analysis
   - Musical phrase identification

4. **Multi-Level Pitch Analysis**
   - Enhanced fundamental frequency detection
   - Pitch class extraction
   - Melodic contour analysis

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Muzic Setup

```bash
python setup_muzic.py
```

This will:

- Install additional required packages
- Clone the Muzic repository
- Set up model configurations
- Validate the integration

### 3. Start Enhanced Backend

```bash
python app.py
```

## API Endpoints

### Enhanced Analysis (Default)

```bash
POST /analyze
```

Uses Muzic-enhanced analysis when available, falls back to basic analysis if needed.

### Basic Analysis Only

```bash
POST /analyze/basic
```

Forces use of the original basic analysis method.

### Health Check

```bash
GET /health
```

Returns system status including Muzic integration status.

## Enhanced Code Generation

The Muzic integration generates more sophisticated ChordCraft code:

### Before (Basic Analysis)

```javascript
// Analysis Results (HPSS + Duration):
// Tempo: 120 BPM
PLAY C4 FOR 0.500s AT 0.50s
PLAY E4 FOR 0.750s AT 1.00s
```

### After (Muzic-Enhanced)

```javascript
// Enhanced ChordCraft Analysis (Muzic-Inspired)
// Key: C major
// Tempo: 120 BPM (4/4)
// Sections: 3
// Dominant Pitches: C, E, G, F
PLAY C4 FOR 0.500s AT 0.50s // Chord: C
PLAY E4 FOR 0.750s AT 1.00s // Chord: C
PLAY G4 FOR 0.250s AT 1.75s // Chord: F
```

## Technical Details

### Core Components

1. **MuzicEnhancedAnalyzer**: Main analysis class that implements advanced music understanding
2. **Harmonic Analysis**: Key detection, chord recognition, harmonic context
3. **Rhythm Analysis**: Beat tracking, time signature estimation, duration quantization
4. **Structure Analysis**: Section detection, musical form understanding

### Analysis Pipeline

1. **Audio Loading**: Load and preprocess audio file
2. **Harmonic-Percussive Separation**: Enhanced separation using librosa
3. **Multi-Level Analysis**:
   - Tempo and beat tracking
   - Advanced pitch detection with PYIN
   - Chroma feature extraction
   - Onset detection with improved parameters
4. **Musical Intelligence**:
   - Key estimation
   - Chord progression detection
   - Beat-aware duration calculation
5. **Enhanced Code Generation**: Generate ChordCraft code with musical context

### Key Algorithms

- **Krumhansl-Schmuckler Key Profiles**: For musical key detection
- **Enhanced PYIN**: For robust fundamental frequency estimation
- **Chroma-based Chord Detection**: For harmonic analysis
- **Beat-Quantized Duration**: For musically meaningful note lengths

## Configuration

### Model Configuration

Models and configurations are stored in `backend/models/`:

- `musicbert_config.json`: MusicBERT-inspired configuration
- `clamp_config.json`: CLaMP (Contrastive Language-Music) configuration

### Analysis Parameters

Key parameters can be adjusted in `muzic_integration.py`:

- `sample_rate`: Audio sample rate (default: 22050 Hz)
- `hop_length`: Analysis hop length (default: 512)
- `frame_size`: Analysis frame size (default: 2048)

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Run the setup script: `python setup_muzic.py`

2. **Analysis Failures**
   - Check the `/health` endpoint for integration status
   - The system automatically falls back to basic analysis if enhanced analysis fails

3. **Performance Issues**
   - Enhanced analysis is more computationally intensive
   - Consider using `/analyze/basic` for faster processing

### Logs and Debugging

The backend logs analysis method selection and any errors:

```bash
INFO - Using Muzic-enhanced analysis
INFO - Muzic integration initialized successfully
WARNING - Enhanced analysis failed, used fallback
```

## Future Enhancements

Potential areas for further Muzic integration:

1. **MusicBERT Integration**: Full symbolic music understanding
2. **CLaMP Integration**: Cross-modal text-music understanding
3. **MuseCoco Integration**: Text-to-music generation capabilities
4. **Real-time Analysis**: Streaming audio analysis
5. **Custom Model Training**: Domain-specific model fine-tuning

## References

- [Microsoft Muzic Repository](https://github.com/microsoft/muzic)
- [MusicBERT Paper](https://arxiv.org/abs/2106.05630)
- [CLaMP Paper](https://arxiv.org/abs/2304.11029)
- [Muzic Demo Page](https://ai-muzic.github.io/)

## Contributing

To contribute to the Muzic integration:

1. Fork the repository
2. Create a feature branch
3. Implement enhancements following the existing patterns
4. Test thoroughly with various audio files
5. Submit a pull request with detailed description

## License

This integration follows the MIT license terms of both ChordCraft and the Microsoft Muzic project.
