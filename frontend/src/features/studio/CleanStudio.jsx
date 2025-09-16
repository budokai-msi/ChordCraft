import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Upload, 
  Download, 
  Share2, 
  Copy, 
  Trash2, 
  Music, 
  Brain, 
  Code, 
  BarChart3, 
  Piano, 
  Zap, 
  Check, 
  X
} from 'lucide-react';
import { SimpleFileUpload } from '@/components/SimpleFileUpload';

export function CleanStudio() {
  const [tracks, setTracks] = useState([]);
  const [bpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [codeEditor, setCodeEditor] = useState(`// Your music code will appear here
// Try: PLAY C4 FOR 1s AT 0s`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [audioContext, setAudioContext] = useState(null);

  const handleFileUpload = (result) => {
    console.log('File uploaded:', result);
    const newTrack = {
      id: Date.now(),
      name: result.fileName || 'New Track',
      notes: 0,
      isPlaying: false,
      isMuted: false,
      isVisible: true,
      volume: 80,
      pan: 0,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    setTracks(prev => [...prev, newTrack]);
    simulateMusicAnalysis(result.fileName);
  };

  const simulateMusicAnalysis = async (fileName) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          
          const generatedCode = generateMusicCode(fileName);
          setCodeEditor(generatedCode);
          setAnalysisResult({
            success: true,
            message: `Analysis complete for ${fileName}`,
            details: {
              bpm: 120,
              key: 'C Major',
              chords: ['C', 'Am', 'F', 'G'],
              confidence: 0.95
            }
          });
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const generateMusicCode = (fileName) => {
    const timestamp = new Date().toLocaleString();
    return `// ChordCraft Music Code - Generated from ${fileName}
// Analysis completed: ${timestamp}

// Project Configuration
BPM = ${bpm};
TIME_SIGNATURE = "4/4";
KEY = "C Major";

// Track Definition
TRACK ${fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")} = {
  name: "${fileName}",
  instrument: "audio_sample",
  volume: 80,
  pan: 0,
  file: "${fileName}"
};

// Detected Musical Elements
PATTERN detected_pattern = {
  // Chord Progression: C - Am - F - G
  PLAY C4 FOR 2s AT 0s;
  PLAY E4 FOR 2s AT 0s;
  PLAY G4 FOR 2s AT 0s;
  
  PLAY A3 FOR 2s AT 2s;
  PLAY C4 FOR 2s AT 2s;
  PLAY E4 FOR 2s AT 2s;
  
  PLAY F3 FOR 2s AT 4s;
  PLAY A3 FOR 2s AT 4s;
  PLAY C4 FOR 2s AT 4s;
  
  PLAY G3 FOR 2s AT 6s;
  PLAY B3 FOR 2s AT 6s;
  PLAY D4 FOR 2s AT 6s;
  
  // Melodic line
  PLAY C5 FOR 0.5s AT 8s;
  PLAY B4 FOR 0.5s AT 8.5s;
  PLAY A4 FOR 0.5s AT 9s;
  PLAY G4 FOR 0.5s AT 9.5s;
  PLAY F4 FOR 1s AT 10s;
  PLAY E4 FOR 1s AT 11s;
  PLAY D4 FOR 1s AT 12s;
  PLAY C4 FOR 2s AT 13s;
};

// Apply pattern
APPLY detected_pattern TO ${fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")};

// Export Configuration
EXPORT_FORMAT = "MIDI";
EXPORT_QUALITY = "HIGH";
EXPORT_TEMPO = ${bpm};`;
  };

  // Audio playback functions
  const initAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  };

  const noteToFrequency = (note) => {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/([A-G]#?\d+)/);
    if (!match) return 440;
    
    const [, noteName, octave] = match;
    const noteNumber = noteMap[noteName] + (parseInt(octave) * 12);
    return 440 * Math.pow(2, (noteNumber - 69) / 12);
  };

  const playNote = (frequency, duration, startTime = 0) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    
    oscillator.start(ctx.currentTime + startTime);
    oscillator.stop(ctx.currentTime + startTime + duration);
    
    return oscillator;
  };

  const parseAndPlayCode = (code) => {
    const ctx = initAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const playCommands = code.match(/PLAY\s+([A-G]#?\d+)\s+FOR\s+([\d.]+)s\s+AT\s+([\d.]+)s/g);
    if (!playCommands) return;
    
    const notes = [];
    playCommands.forEach(cmd => {
      const match = cmd.match(/PLAY\s+([A-G]#?\d+)\s+FOR\s+([\d.]+)s\s+AT\s+([\d.]+)s/);
      if (match) {
        const [, note, duration, startTime] = match;
        notes.push({
          note,
          frequency: noteToFrequency(note),
          duration: parseFloat(duration),
          startTime: parseFloat(startTime)
        });
      }
    });
    
    // Play all notes
    notes.forEach(({ frequency, duration, startTime }) => {
      playNote(frequency, duration, startTime);
    });
  };

  const handlePlayCode = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioContext) {
        audioContext.suspend();
      }
    } else {
      setIsPlaying(true);
      parseAndPlayCode(codeEditor);
      
      setTimeout(() => {
        setIsPlaying(false);
      }, 20000);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeEditor);
  };

  return (
    <div className="h-screen w-full bg-background text-foreground">
      {/* Minimal Header */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold transition-all duration-300">ChordCraft Studio</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" aria-label="Share project">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Export project">
            <Download className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">I</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex h-[calc(100vh-3.5rem)]">
        {/* Left Panel - Upload */}
        <div className="w-80 border-r bg-card/50 flex flex-col">
          <div className="p-4">
            <h2 className="text-sm font-medium mb-3">Upload Audio</h2>
            <SimpleFileUpload onUpload={handleFileUpload} />
          </div>

          <Separator />

          <div className="p-4 flex-1">
            <h2 className="text-sm font-medium mb-3">Tracks ({tracks.length})</h2>
            <div className="space-y-2">
              {tracks.map((track) => (
                <div key={track.id} className="p-3 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="text-sm font-medium">{track.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`Delete track ${track.name}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                    <Slider
                      value={[track.volume]}
                      onValueChange={([value]) => {
                        setTracks(prev => prev.map(t => 
                          t.id === track.id ? { ...t, volume: value } : t
                        ));
                      }}
                      max={100}
                      step={1}
                      className="flex-1"
                      aria-label={`Volume for ${track.name}`}
                    />
                    <span className="text-xs text-muted-foreground w-8">{track.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Transport */}
          <div className="h-16 border-b bg-card/50 flex items-center justify-center space-x-4">
            <Button size="sm" variant="outline" aria-label="Skip backward">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full"
              aria-label={isPlaying ? "Pause playback" : "Start playback"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button size="sm" variant="outline" aria-label="Skip forward">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" aria-label="Stop playback">
              <Square className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center space-x-4 text-sm">
              <span>BPM: {bpm}</span>
              <span>4/4</span>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="flex-1 p-6">
            <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Piano className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Timeline</h3>
                <p className="text-sm text-muted-foreground">Upload audio files to get started</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code */}
        <div className="w-96 border-l bg-card/50 flex flex-col">
          <div className="p-4">
            <h2 className="text-sm font-medium mb-3">Code Editor</h2>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={handlePlayCode} className="flex-1" aria-label={isPlaying ? "Stop code playback" : "Play generated code"}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
                <Button size="sm" variant="outline" onClick={copyCode} aria-label="Copy code to clipboard">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <Textarea
                className="min-h-[200px] font-mono text-xs"
                placeholder="// Your music code will appear here"
                value={codeEditor}
                onChange={(e) => setCodeEditor(e.target.value)}
                aria-label="Music code editor"
              />
            </div>
          </div>

          <Separator />

          <div className="p-4">
            <h2 className="text-sm font-medium mb-3">Analysis</h2>
            {isAnalyzing ? (
              <div className="space-y-3">
                <div className="text-center">
                  <Brain className="w-6 h-6 mx-auto mb-2 text-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground">Analyzing...</p>
                </div>
                <Progress value={analysisProgress} className="w-full" aria-label={`Analysis progress: ${analysisProgress}%`} />
                <p className="text-xs text-center text-muted-foreground">{analysisProgress}%</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Key:</span>
                  <span className="font-mono">{analysisResult.details?.key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BPM:</span>
                  <span className="font-mono">{analysisResult.details?.bpm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chords:</span>
                  <span className="font-mono">{analysisResult.details?.chords?.join(', ')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Upload audio to analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
