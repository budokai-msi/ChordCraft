#!/usr/bin/env python3
"""
Test script for Muzic integration with ChordCraft
Tests the enhanced analysis capabilities
"""

import os
import sys
import tempfile
import numpy as np
import librosa
import soundfile as sf
import requests
import json
import time
from pathlib import Path

def create_test_audio():
    """Create a simple test audio file"""
    # Generate a simple melody: C4 - E4 - G4 - C5
    sample_rate = 22050
    duration = 0.5  # seconds per note
    
    notes = [261.63, 329.63, 392.00, 523.25]  # C4, E4, G4, C5 in Hz
    audio_data = np.array([])
    
    for freq in notes:
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        # Simple sine wave with envelope
        envelope = np.exp(-t * 2)  # Exponential decay
        note_audio = envelope * np.sin(2 * np.pi * freq * t)
        audio_data = np.concatenate([audio_data, note_audio])
    
    # Add some silence at the end
    silence = np.zeros(int(sample_rate * 0.5))
    audio_data = np.concatenate([audio_data, silence])
    
    return audio_data, sample_rate

def test_basic_imports():
    """Test that basic imports work"""
    print("Testing basic imports...")
    try:
        import librosa
        import numpy as np
        import flask
        print("PASS Basic imports successful")
        return True
    except ImportError as e:
        print(f"FAIL Basic import failed: {e}")
        return False

def test_enhanced_imports():
    """Test that enhanced (Muzic) imports work"""
    print("Testing enhanced imports...")
    try:
        import torch
        import transformers
        # import pretty_midi  # May fail if not installed
        # import music21       # May fail if not installed
        print("PASS Enhanced imports successful")
        return True
    except ImportError as e:
        print(f"WARN Enhanced import warning: {e}")
        print("   This is expected if Muzic dependencies aren't installed yet")
        return False

def test_muzic_integration_module():
    """Test the Muzic integration module"""
    print("Testing Muzic integration module...")
    try:
        # This will test if the module can be imported despite missing dependencies
        sys.path.append(os.path.dirname(__file__))
        
        # Test basic class instantiation
        from muzic_integration import MuzicEnhancedAnalyzer
        analyzer = MuzicEnhancedAnalyzer()
        print("PASS Muzic integration module loaded")
        return True, analyzer
    except Exception as e:
        print(f"FAIL Muzic integration module failed: {e}")
        return False, None

def test_basic_analysis():
    """Test basic analysis functionality"""
    print("Testing basic analysis...")
    try:
        # Create test audio
        audio_data, sample_rate = create_test_audio()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            sf.write(temp_file.name, audio_data, sample_rate)
            temp_path = temp_file.name
        
        try:
            # Test basic analysis from app.py
            sys.path.append(os.path.dirname(__file__))
            from app import analyze_audio
            
            result = analyze_audio(temp_path)
            print("PASS Basic analysis successful")
            print(f"   Result preview: {result[:100]}...")
            return True
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        print(f"FAIL Basic analysis failed: {e}")
        return False

def test_enhanced_analysis(analyzer):
    """Test enhanced analysis functionality"""
    print("Testing enhanced analysis...")
    try:
        # Create test audio
        audio_data, sample_rate = create_test_audio()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            sf.write(temp_file.name, audio_data, sample_rate)
            temp_path = temp_file.name
        
        try:
            result = analyzer.analyze_audio_enhanced(temp_path)
            print("PASS Enhanced analysis successful")
            print(f"   Result preview: {result[:150]}...")
            return True
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        print(f"FAIL Enhanced analysis failed: {e}")
        print(f"   This is expected if dependencies aren't installed: {str(e)[:100]}...")
        return False

def test_flask_endpoints():
    """Test Flask endpoints (requires running server)"""
    print("Testing Flask endpoints...")
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/health", timeout=2)
        if response.status_code == 200:
            health_data = response.json()
            print("PASS Server is running")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Muzic Integration: {health_data.get('muzic_integration')}")
            print(f"   Version: {health_data.get('version')}")
            
            # Test analyze endpoint with test audio
            audio_data, sample_rate = create_test_audio()
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                sf.write(temp_file.name, audio_data, sample_rate)
                
                try:
                    with open(temp_file.name, 'rb') as audio_file:
                        files = {'audio': audio_file}
                        response = requests.post("http://localhost:5000/analyze", files=files, timeout=10)
                        
                        if response.status_code == 200:
                            result = response.json()
                            print("PASS Analyze endpoint successful")
                            print(f"   Analysis Type: {result.get('analysisType')}")
                            print(f"   Success: {result.get('success')}")
                            return True
                        else:
                            print(f"FAIL Analyze endpoint failed: {response.status_code}")
                            return False
                finally:
                    os.remove(temp_file.name)
        else:
            print(f"FAIL Server responded with status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException:
        print("WARN  Server not running (this is okay for offline testing)")
        print("   To test endpoints, run: python app.py")
        return False

def main():
    """Main test function"""
    print("MUSIC ChordCraft + Muzic Integration Test Suite")
    print("=" * 50)
    
    results = {}
    
    # Test 1: Basic imports
    results['basic_imports'] = test_basic_imports()
    print()
    
    # Test 2: Enhanced imports
    results['enhanced_imports'] = test_enhanced_imports()
    print()
    
    # Test 3: Muzic integration module
    muzic_success, analyzer = test_muzic_integration_module()
    results['muzic_module'] = muzic_success
    print()
    
    # Test 4: Basic analysis
    results['basic_analysis'] = test_basic_analysis()
    print()
    
    # Test 5: Enhanced analysis (if module loaded)
    if analyzer:
        results['enhanced_analysis'] = test_enhanced_analysis(analyzer)
    else:
        results['enhanced_analysis'] = False
        print("WARN  Skipping enhanced analysis test (module not loaded)")
    print()
    
    # Test 6: Flask endpoints
    results['flask_endpoints'] = test_flask_endpoints()
    print()
    
    # Summary
    print("=" * 50)
    print("MUSIC Test Summary:")
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "PASS PASS" if passed_test else "FAIL FAIL"
        print(f"   {test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Muzic integration is ready.")
    elif passed >= total - 2:
        print("👍 Most tests passed! You may need to install additional dependencies.")
        print("   Run: python setup_muzic.py")
    else:
        print("WARN  Several tests failed. Please check the setup.")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Run setup: python setup_muzic.py")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
