import React, { useState } from 'react';
import { useAuth } from '../../Auth';
import { SimpleFileUpload } from '../../components/SimpleFileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Music, 
  Sparkles, 
  FolderOpen, 
  Settings as SettingsIcon,
  Users,
  Download,
  Upload,
  Share2,
  Zap,
  Brain,
  Mic,
  Headphones,
  Play,
  Pause,
  Square,
  Save,
  Bell,
  Activity,
  FileAudio,
  Volume2,
  Eye,
  EyeOff,
  Trash2,
  Send,
  Code,
  FileText,
  BarChart3,
  Piano,
  Clock,
  Sliders,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RotateCw,
  Copy,
  Scissors,
  Paste,
  Undo,
  Redo
} from 'lucide-react';

export function EnterpriseStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('studio');
  const [tracks, setTracks] = useState([
    { 
      id: 1, 
      name: 'Melody Synth', 
      notes: 0, 
      isPlaying: false, 
      isMuted: false, 
      isVisible: true,
      volume: 80,
      pan: 0,
      color: '#3b82f6'
    }
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(0);
  const [duration] = useState(120); // 2 minutes
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [codeEditor, setCodeEditor] = useState(`// ChordCraft Music Code
// Generated: ${new Date().toLocaleString()}

// Project Settings
BPM = ${bpm};
TIME_SIGNATURE = "${timeSignature}";

// Track Definitions
TRACK melody = {
  name: "Melody Synth",
  instrument: "synthesizer",
  volume: 80,
  pan: 0
};

// Musical Patterns
PATTERN verse = {
  // C Major Scale Progression
  PLAY C4 FOR 1s AT 0s;
  PLAY E4 FOR 1s AT 1s;
  PLAY G4 FOR 1s AT 2s;
  PLAY C5 FOR 2s AT 3s;
  
  // Repeat with variations
  PLAY C4 FOR 0.5s AT 5s;
  PLAY D4 FOR 0.5s AT 5.5s;
  PLAY E4 FOR 0.5s AT 6s;
  PLAY F4 FOR 0.5s AT 6.5s;
  PLAY G4 FOR 1s AT 7s;
  PLAY A4 FOR 1s AT 8s;
  PLAY B4 FOR 1s AT 9s;
  PLAY C5 FOR 2s AT 10s;
};

// Apply pattern to track
APPLY verse TO melody;

// Export settings
EXPORT_FORMAT = "MIDI";
EXPORT_QUALITY = "HIGH";`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [, setScheduledNotes] = useState([]);

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
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          
          // Generate code based on analysis
          const generatedCode = generateMusicCode(fileName);
          setCodeEditor(generatedCode);
          setAnalysisResult({
            success: true,
            message: `Analysis complete for ${fileName}`,
            key: 'C Major',
            tempo: 120,
            timeSignature: '4/4',
            chords: ['C', 'Am', 'F', 'G'],
            notes: 24
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
      
      // Auto-stop after 20 seconds
      setTimeout(() => {
        setIsPlaying(false);
      }, 20000);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleTrackMute = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    ));
  };

  const toggleTrackVisibility = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isVisible: !track.isVisible } : track
    ));
  };

  const deleteTrack = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  };

  const updateTrackVolume = (trackId, volume) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  // Removed unused playCode function

  const analyzeCode = () => {
    console.log('Analyzing code:', codeEditor);
    // Simulate code analysis
    setAnalysisResult({
      success: true,
      message: 'Code analysis complete',
      key: 'C Major',
      tempo: bpm,
      timeSignature: timeSignature,
      chords: ['C', 'Am', 'F', 'G'],
      notes: 24
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeEditor);
    console.log('Code copied to clipboard');
  };

  return (
    <div className="flex flex-col h-screen w-screen animated-bg text-white font-sans overflow-hidden">
      {/* Enterprise Header */}
      <header className="h-16 glass-pane border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg neon-glow">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold vibrant-gradient-text">
                  ChordCraft Studio
                </h1>
                <p className="text-xs text-slate-300">Professional Music Production Platform</p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 neon-glow">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="w-3 h-3 mr-1" />
                Muzic AI
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Code className="w-3 h-3 mr-1" />
                Code Generation
              </Badge>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="btn-ghost">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="btn-ghost">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="btn-ghost">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 px-4 py-2 glass-pane rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{user?.email || 'User'}</p>
                <p className="text-xs text-green-400">Enterprise Plan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="h-12 glass-pane border-b border-white/10 shrink-0">
        <div className="flex items-center h-full px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-0 p-0 space-x-1">
              <TabsTrigger 
                value="studio" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'studio' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Music className="w-4 h-4 mr-2" />
                Studio
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'ai' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Companion
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'projects' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="collaborate" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'collaborate' 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Collaborate
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} className="w-full h-full">
          <TabsContent value="studio" className="h-full m-0 p-0">
            <div className="flex h-full">
              {/* Left Panel */}
              <div className="w-80 glass-pane border-r border-white/10 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Audio Upload */}
                  <SimpleFileUpload 
                    onAnalysisComplete={handleFileUpload}
                    className="mb-6"
                  />

                  {/* Analysis Progress */}
                  {isAnalyzing && (
                    <Card className="glass-pane mb-6">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Analyzing Audio...</span>
                            <span className="text-sm text-slate-400">{analysisProgress}%</span>
                          </div>
                          <Progress value={analysisProgress} className="w-full" />
                          <p className="text-xs text-slate-400">Converting to music code...</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Analysis Result */}
                  {analysisResult && (
                    <Card className="glass-pane mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                          Analysis Complete
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Key:</span>
                            <span className="ml-2 text-white">{analysisResult.key}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Tempo:</span>
                            <span className="ml-2 text-white">{analysisResult.tempo} BPM</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Time:</span>
                            <span className="ml-2 text-white">{analysisResult.timeSignature}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Notes:</span>
                            <span className="ml-2 text-white">{analysisResult.notes}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-slate-400 text-sm">Chords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysisResult.chords.map((chord, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {chord}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tracks */}
                  <Card className="glass-pane">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Music className="w-5 h-5 mr-2 text-blue-400" />
                        Tracks ({tracks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tracks.map((track) => (
                        <div key={track.id} className="p-3 glass-pane rounded-lg hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setTracks(prev => prev.map(t => 
                                  t.id === track.id ? { ...t, isPlaying: !t.isPlaying } : t
                                ))}
                                className="btn-icon"
                              >
                                {track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </Button>
                              <FileAudio className="w-5 h-5" style={{ color: track.color }} />
                              <div>
                                <p className="font-medium text-sm">{track.name}</p>
                                <p className="text-xs text-slate-400">{track.notes} notes</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleTrackVisibility(track.id)}
                                className="btn-icon"
                              >
                                {track.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleTrackMute(track.id)}
                                className="btn-icon"
                              >
                                {track.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTrack(track.id)}
                                className="btn-icon text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Volume Control */}
                          <div className="flex items-center space-x-2 mt-2">
                            <Volume2 className="w-4 h-4 text-slate-400" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={track.volume}
                              onChange={(e) => updateTrackVolume(track.id, parseInt(e.target.value))}
                              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-slate-400 w-8">{track.volume}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Panel - Timeline */}
              <div className="flex-1 flex flex-col">
                {/* Transport Controls */}
                <div className="h-16 glass-pane border-b border-white/10 flex items-center justify-between px-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full btn-primary"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="btn-icon">
                      <Square className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="btn-icon">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="btn-icon">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                      <span>/</span>
                      <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>BPM:</span>
                      <Input
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-16 h-8 text-center"
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>Time:</span>
                      <Select value={timeSignature} onValueChange={setTimeSignature}>
                        <SelectTrigger className="w-20 h-8 bg-slate-700 border-slate-600 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4/4">4/4</SelectItem>
                          <SelectItem value="3/4">3/4</SelectItem>
                          <SelectItem value="2/4">2/4</SelectItem>
                          <SelectItem value="6/8">6/8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Timeline Grid */}
                <div className="flex-1 p-6">
                  <div className="h-full glass-pane rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 relative">
                      {/* Grid Pattern */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="grid grid-cols-16 gap-0 h-full">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="border-r border-slate-500/40 hover:border-slate-400/60 transition-colors duration-200"></div>
                          ))}
                        </div>
                        {/* Horizontal grid lines */}
                        <div className="absolute inset-0 grid grid-rows-12 gap-0 h-full">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="border-b border-slate-500/20 hover:border-slate-400/40 transition-colors duration-200"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Note Labels */}
                      <div className="absolute left-0 top-0 w-20 h-full border-r border-slate-500/50 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                        <div className="p-3 space-y-0">
                          {['C8', 'B7', 'A#7', 'A7', 'G#7', 'G7', 'F#7', 'F7', 'E7', 'D#7', 'D7', 'C#7', 'C7'].map((note) => (
                            <div 
                              key={note} 
                              className="flex items-center justify-center h-8 text-xs font-mono font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 rounded transition-all duration-200 cursor-pointer group"
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
                        <div className="text-center glass-pane rounded-xl p-8 max-w-md">
                          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center neon-glow">
                            <Piano className="w-10 h-10 text-blue-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">Professional Timeline</h3>
                          <p className="text-slate-300 mb-4">Drag audio files here or use the code editor below to create music</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Music className="w-3 h-3 mr-1" />
                              Audio Upload
                            </Badge>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <Code className="w-3 h-3 mr-1" />
                              Code Generation
                            </Badge>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Analysis
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Brain className="w-6 h-6 mr-3 text-purple-400 pulse-glow" />
                  AI Music Companion
                </CardTitle>
                <CardDescription className="text-lg">
                  Advanced AI-powered music generation and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Advanced AI
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Real-time
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Code Generation
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full justify-start btn-outline">
                        <Music className="w-4 h-4 mr-2" />
                        Generate Melody
                      </Button>
                      <Button className="w-full justify-start btn-outline">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Harmony
                      </Button>
                      <Button className="w-full justify-start btn-outline">
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Structure
                      </Button>
                      <Button className="w-full justify-start btn-outline">
                        <Code className="w-4 h-4 mr-2" />
                        Convert to Code
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI Assistant</h3>
                    <div className="h-64 glass-pane rounded-lg p-4 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-300">
                              🎵 Hello! I'm your AI music companion. I can help you create, analyze, and convert music to code. What would you like to work on today?
                            </p>
                            <p className="text-xs text-slate-500 mt-1">7:23:40 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 justify-end">
                          <div className="flex-1 text-right">
                            <p className="text-sm bg-blue-500/20 text-blue-300 p-2 rounded-lg inline-block">
                              Generate a C major chord progression
                            </p>
                            <p className="text-xs text-slate-500 mt-1">7:23:45 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-300">
                              ✅ Generated C major progression: C - Am - F - G. I've also created the corresponding music code in your editor below.
                            </p>
                            <p className="text-xs text-slate-500 mt-1">7:23:46 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Describe the music you want to create..."
                        className="flex-1 px-3 py-2 glass-pane rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                      <Button className="px-6 btn-primary">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <FolderOpen className="w-6 h-6 mr-3 text-green-400 pulse-glow" />
                  Project Manager
                </CardTitle>
                <CardDescription className="text-lg">
                  Organize and manage your music projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">No projects yet</p>
                  <p className="text-slate-500 text-sm">Create your first project to get started</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborate" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Users className="w-6 h-6 mr-3 text-orange-400 pulse-glow" />
                  Real-time Collaboration
                </CardTitle>
                <CardDescription className="text-lg">
                  Work together with your team in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">Collaboration features coming soon</p>
                  <p className="text-slate-500 text-sm">Invite team members and create music together</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <SettingsIcon className="w-6 h-6 mr-3 text-slate-400 pulse-glow" />
                  Settings
                </CardTitle>
                <CardDescription className="text-lg">
                  Configure your ChordCraft Studio experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <SettingsIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">Settings panel coming soon</p>
                  <p className="text-slate-500 text-sm">Customize your workspace and preferences</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Panel - Code Editor */}
      <div className="h-40 glass-pane border-t border-white/10 shrink-0 p-6">
        <Tabs defaultValue="code" className="h-full">
          <TabsList className="bg-transparent border-0 p-0 mb-4">
            <TabsTrigger value="code" className="px-4 py-2 rounded-lg">Code Editor</TabsTrigger>
            <TabsTrigger value="analysis" className="px-4 py-2 rounded-lg">Music Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="h-full m-0">
            <div className="flex space-x-2 h-full">
              <Textarea
                className="flex-1 glass-pane rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                placeholder="// Your music code will appear here&#10;// Try: PLAY C4 FOR 1s AT 0s"
                value={codeEditor}
                onChange={(e) => setCodeEditor(e.target.value)}
              />
              <div className="flex flex-col space-y-2">
                <Button className="px-4 btn-primary" onClick={handlePlayCode}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Stop' : 'Play Code'}
                </Button>
                <Button variant="outline" className="px-4 btn-outline" onClick={analyzeCode}>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
                <Button variant="outline" className="px-4 btn-outline" onClick={copyCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" className="px-4 btn-outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="analysis" className="h-full m-0">
            <div className="h-full glass-pane rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">Music analysis will appear here</p>
                <p className="text-slate-500 text-sm">Upload audio or generate code to see analysis</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
