import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { EnhancedTransportControls } from "./EnhancedTransportControls";
import { ProfessionalPianoRoll } from "./ProfessionalPianoRoll";
import { useAudioEngine } from "../services/AudioEngine";
import { motion } from "framer-motion";

interface MainPanelProps {
  currentTrack: any;
  isPlaying: boolean;
}

export function MainPanel({ currentTrack, isPlaying }: MainPanelProps) {
  const audioEngine = useAudioEngine();
  const [zoom, setZoom] = useState(100);
  const [playbackState, setPlaybackState] = useState(isPlaying);

  // Load sample audio on component mount
  useEffect(() => {
    // For now, we'll generate a simple tone using Web Audio API
    generateSampleAudio();
  }, []);

  // Generate a simple audio tone for testing
  const generateSampleAudio = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    // Store the audio context for playback control
    (window as any).audioContext = audioContext;
    (window as any).oscillator = oscillator;
    (window as any).gainNode = gainNode;
  };

  // Generate piano roll grid
  const generatePianoRoll = () => {
    const notes: string[] = [];
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octaves = [5, 4, 3, 2, 1];
    
    octaves.forEach(octave => {
      noteNames.reverse().forEach(note => {
        notes.push(`${note}${octave}`);
      });
      noteNames.reverse();
    });
    
    return notes;
  };

  const pianoNotes = generatePianoRoll();
  const timeMarkers = Array.from({ length: 32 }, (_, i) => i * 0.25); // Quarter note intervals

  // Professional note data with realistic structure
  const mockNotes = [
    { id: '1', note: 'C4', startTime: 0, duration: 1, velocity: 80, color: '#6366f1' },
    { id: '2', note: 'E4', startTime: 1, duration: 1, velocity: 75, color: '#6366f1' },
    { id: '3', note: 'G4', startTime: 2, duration: 1, velocity: 85, color: '#6366f1' },
    { id: '4', note: 'C5', startTime: 3, duration: 2, velocity: 90, color: '#6366f1' },
    { id: '5', note: 'A3', startTime: 5, duration: 1, velocity: 70, color: '#ef4444' },
    { id: '6', note: 'C4', startTime: 6, duration: 1, velocity: 75, color: '#ef4444' },
    { id: '7', note: 'E4', startTime: 7, duration: 1, velocity: 80, color: '#ef4444' },
    { id: '8', note: 'A4', startTime: 8, duration: 2, velocity: 85, color: '#ef4444' },
    { id: '9', note: 'F3', startTime: 10, duration: 1, velocity: 70, color: '#10b981' },
    { id: '10', note: 'A3', startTime: 11, duration: 1, velocity: 75, color: '#10b981' },
    { id: '11', note: 'C4', startTime: 12, duration: 1, velocity: 80, color: '#10b981' },
    { id: '12', note: 'F4', startTime: 13, duration: 2, velocity: 85, color: '#10b981' },
  ];

  const handlePlayPause = () => {
    const newPlaybackState = !playbackState;
    setPlaybackState(newPlaybackState);
    
    if (newPlaybackState) {
      // Start playing audio
      const audioContext = (window as any).audioContext;
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Start the oscillator
      const oscillator = (window as any).oscillator;
      if (oscillator) {
        try {
          oscillator.start();
        } catch (e) {
          // Oscillator might already be started
          console.log('Oscillator already started');
        }
      }
    } else {
      // Stop playing audio
      const oscillator = (window as any).oscillator;
      if (oscillator) {
        oscillator.stop();
        // Recreate oscillator for next play
        generateSampleAudio();
      }
    }
  };

  const handleStop = () => {
    setPlaybackState(false);
    const oscillator = (window as any).oscillator;
    if (oscillator) {
      oscillator.stop();
      generateSampleAudio();
    }
  };

  const handleNext = () => {
    // Navigate to next section or track
  };

  const handlePrevious = () => {
    // Navigate to previous section or track
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-800/30 to-slate-900/30">
      {/* Enhanced Transport Controls */}
      <EnhancedTransportControls
        isPlaying={playbackState}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentTime={audioEngine?.currentTime || 0}
        totalTime={audioEngine?.duration || 154}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Professional Piano Roll */}
      <div className="flex-1 p-4">
        <ProfessionalPianoRoll
          notes={mockNotes}
          isPlaying={playbackState}
          currentTime={audioEngine?.currentTime || 0}
          zoom={zoom}
          onNoteClick={(note) => {
            console.log('Note clicked:', note);
          }}
          onNoteMove={(noteId, newStart, newNote) => {
            console.log('Note moved:', noteId, newStart, newNote);
          }}
          onNoteResize={(noteId, newDuration) => {
            console.log('Note resized:', noteId, newDuration);
          }}
        />
      </div>
    </div>
  );
}