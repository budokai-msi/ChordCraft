import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Settings, 
  Upload, 
  Download, 
  Share2, 
  Copy, 
  Trash2, 
  Plus, 
  Music, 
  Headphones, 
  Mic, 
  Brain, 
  Code, 
  BarChart3, 
  Piano, 
  Zap, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Edit3, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Heart, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Shield, 
  Check, 
  X, 
  PlusCircle, 
  MinusCircle, 
  Circle, 
  Square as SquareIcon, 
  Triangle, 
  Hexagon, 
  Octagon, 
  Diamond
} from 'lucide-react';
import { SimpleFileUpload } from '@/components/SimpleFileUpload';

export function ModernStudio() {
  const [tracks, setTracks] = useState([]);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [codeEditor, setCodeEditor] = useState(`// Your music code will appear here
// Try: PLAY C4 FOR 1s AT 0s`);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [scheduledNotes, setScheduledNotes] = useState([]);

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
    
    // Simulate music analysis
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
TIME_SIGNATURE = "${timeSignature}";
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
    
    setScheduledNotes(notes);
    
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
    <div className="h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">ChordCraft Studio</h1>
            <p className="text-sm text-muted-foreground">Professional Music Production Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Zap className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Brain className="w-3 h-3 mr-1" />
            Muzic AI
          </Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
            <Code className="w-3 h-3 mr-1" />
            Code Generation
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">I</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">ivanovspccenter@gmail.com</p>
              <p className="text-xs text-muted-foreground">Enterprise Plan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Audio Upload</h2>
            <Card>
              <CardContent className="p-6">
                <SimpleFileUpload onUpload={handleFileUpload} />
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tracks ({tracks.length})</h2>
            <div className="space-y-3">
              {tracks.map((track) => (
                <Card key={track.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: track.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{track.name}</p>
                        <p className="text-xs text-muted-foreground">{track.notes} notes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
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
                      />
                      <span className="text-xs text-muted-foreground w-8">{track.volume}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Timeline Area */}
        <div className="flex-1 flex flex-col">
          {/* Transport Controls */}
          <div className="h-20 border-b bg-card/30 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button size="sm" variant="outline">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button size="sm" variant="outline">
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Square className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm font-mono">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</p>
                <p className="text-xs text-muted-foreground">/ {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm font-medium">BPM:</p>
                  <p className="text-lg font-mono">{bpm}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Time:</p>
                  <p className="text-lg font-mono">{timeSignature}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardContent className="p-6 h-full">
                <div className="h-full bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg relative overflow-hidden">
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="grid grid-cols-16 gap-0 h-full">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border-r border-border/40"></div>
                      ))}
                    </div>
                    <div className="absolute inset-0 grid grid-rows-12 gap-0 h-full">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border-b border-border/20"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Note Labels */}
                  <div className="absolute left-0 top-0 w-20 h-full border-r border-border/50 bg-card/80 backdrop-blur-sm">
                    <div className="p-3 space-y-0">
                      {['C8', 'B7', 'A#7', 'A7', 'G#7', 'G7', 'F#7', 'F7', 'E7', 'D#7', 'D7', 'C#7', 'C7'].map((note, i) => (
                        <div 
                          key={note} 
                          className="flex items-center justify-center h-8 text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-all duration-200 cursor-pointer group"
                        >
                          <span className="group-hover:scale-110 transition-transform duration-200">
                            {note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Area */}
                  <div className="ml-20 h-full flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                        <Piano className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Professional Timeline</h3>
                      <p className="text-muted-foreground mb-4">Upload audio files or use the code editor below</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Music className="w-3 h-3 mr-1" />
                          Audio Upload
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Code className="w-3 h-3 mr-1" />
                          Code Generation
                        </Badge>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Analysis
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Code Editor */}
        <div className="w-96 border-l bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Code Editor</h2>
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Music Code</CardTitle>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={handlePlayCode}>
                          {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                          {isPlaying ? 'Stop' : 'Play'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={copyCode}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="// Your music code will appear here&#10;// Try: PLAY C4 FOR 1s AT 0s"
                      value={codeEditor}
                      onChange={(e) => setCodeEditor(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isAnalyzing ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <Brain className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
                          <p className="text-sm text-muted-foreground">Analyzing audio...</p>
                        </div>
                        <Progress value={analysisProgress} className="w-full" />
                        <p className="text-xs text-center text-muted-foreground">{analysisProgress}% complete</p>
                      </div>
                    ) : analysisResult ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Analysis Complete</span>
                        </div>
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
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Upload audio to see analysis results</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
