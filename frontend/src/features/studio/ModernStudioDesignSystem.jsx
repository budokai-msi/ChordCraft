import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, SkipBack, SkipForward, 
  Volume2, VolumeX, Settings, Upload, Download, 
  Share2, Copy, Trash2, Plus, Music, Headphones, 
  Mic, Zap, Sparkles, Lock, Unlock, Eye, EyeOff,
  Maximize2, Minimize2, RotateCcw, RotateCw,
  Search, Filter, MoreHorizontal, ChevronDown
} from 'lucide-react';

// Import design system components
import { Button } from '../../design-system/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/ui/card';
import { Badge } from '../../design-system/ui/badge';
import { Separator } from '../../design-system/ui/separator';
import { Slider } from '../../design-system/ui/slider';
import { Progress } from '../../design-system/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../design-system/ui/tabs';
import { ScrollArea } from '../../design-system/ui/scroll-area';
import { Input } from '../../design-system/ui/input';
import { Label } from '../../design-system/ui/label';
import { Switch } from '../../design-system/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../design-system/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../design-system/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../design-system/ui/tooltip';

// Import professional components
import { EnhancedTransportControls } from '../../design-system/EnhancedTransportControls';
import { ProfessionalPianoRoll } from '../../design-system/ProfessionalPianoRoll';
import { MusicAnalysis } from '../../design-system/MusicAnalysis';
import { HapticButton } from '../../design-system/HapticButton';
import { HapticSlider } from '../../design-system/HapticSlider';

// Import stores
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePlaybackStore } from '../../stores/usePlaybackStore';

// Import services
import { generateMusic } from '../../services/musicApiService';
import { analyzeAudio } from '../../services/audioAnalysisService';

// Import CodeEditor
import { CodeEditor } from '../../components/CodeEditor';

export function ModernStudioDesignSystem() {
  // Store hooks
  const { 
    chordCraftCode, updateCode, currentProject
  } = useProjectStore();
  const { 
    showSuccess, showError, setAnalyzing, isAnalyzing
  } = useUIStore();
  const { 
    currentTime, duration, volume, isPlaying, isPaused,
    play, pause, stop, setVolume, setCurrentTime 
  } = usePlaybackStore();

  // State
  const [state, setState] = useState({
    activeTab: 'timeline',
    selectedTrack: null,
    isRecording: false,
    isMuted: false,
    tempo: 120,
    timeSignature: '4/4',
    zoom: 100,
    selectedTracks: [],
    tracks: [
      {
        id: 1,
        name: 'Piano',
        type: 'midi',
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        color: 'bg-blue-500'
      },
      {
        id: 2,
        name: 'Drums',
        type: 'audio',
        volume: 0.9,
        pan: 0,
        mute: false,
        solo: false,
        color: 'bg-red-500'
      }
    ],
    notes: [
      {
        id: '1',
        note: 'C4',
        startTime: 0,
        duration: 1,
        velocity: 80,
        color: '#3b82f6'
      },
      {
        id: '2',
        note: 'E4',
        startTime: 0.5,
        duration: 1,
        velocity: 75,
        color: '#3b82f6'
      },
      {
        id: '3',
        note: 'G4',
        startTime: 1,
        duration: 1,
        velocity: 85,
        color: '#3b82f6'
      }
    ]
  });

  // Handlers
  const handlers = {
    transport: (action) => {
      switch (action) {
        case 'play': play(); break;
        case 'pause': pause(); break;
        case 'stop': stop(); break;
        case 'skipBack': setCurrentTime(Math.max(0, currentTime - 5)); break;
        case 'skipForward': setCurrentTime(Math.min(duration, currentTime + 5)); break;
      }
    },

    addTrack: (type) => {
      const newTrack = {
        id: Date.now(),
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track`,
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        color: type === 'midi' ? 'bg-blue-500' : 'bg-green-500'
      };
      setState(prev => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
    },

    deleteTrack: (trackId) => {
      setState(prev => ({ 
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackId),
        selectedTracks: prev.selectedTracks.filter(id => id !== trackId)
      }));
    },

    updateTrack: (trackId, updates) => {
      setState(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t)
      }));
    },

    toggleTrackSelection: (trackId) => {
      setState(prev => ({
        ...prev,
        selectedTracks: prev.selectedTracks.includes(trackId)
          ? prev.selectedTracks.filter(id => id !== trackId)
          : [...prev.selectedTracks, trackId]
      }));
    },

    generateMusic: async (prompt) => {
      setAnalyzing(true);
      try {
        const result = await generateMusic(prompt);
        updateCode(result.code);
        showSuccess('Music generated successfully!');
      } catch {
        showError('Failed to generate music. Please try again.');
      } finally {
        setAnalyzing(false);
      }
    },

    analyzeAudio: async (audioData) => {
      setAnalyzing(true);
      try {
        const result = await analyzeAudio(audioData);
        showSuccess('Audio analyzed successfully!');
        return result;
      } catch {
        showError('Failed to analyze audio. Please try again.');
      } finally {
        setAnalyzing(false);
      }
    },

    exportProject: () => {
      const projectData = {
        name: currentProject?.name || 'Untitled Project',
        code: chordCraftCode,
        tracks: state.tracks,
        tempo: state.tempo,
        timeSignature: state.timeSignature,
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name}.chordcraft`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Project exported successfully!');
    },

    saveProject: () => {
      showSuccess('Project saved successfully!');
    },

    formatCode: () => {
      const formatted = chordCraftCode
        .split('\n')
        .map(line => line.trim())
        .join('\n');
      updateCode(formatted);
      showSuccess('Code formatted successfully!');
    }
  };

  return (
    <TooltipProvider>
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Header */}
        <motion.div 
          className="h-16 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm px-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ChordCraft Studio
              </h1>
            </motion.div>
            
            <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-600/30">
              PRO
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <HapticButton
              size="sm"
              variant="ghost"
              className="text-purple-400 hover:text-purple-300"
            >
              <Settings className="w-4 h-4" />
            </HapticButton>
            
            <HapticButton
              size="sm"
              variant="ghost"
              className="text-purple-400 hover:text-purple-300"
            >
              <Share2 className="w-4 h-4" />
            </HapticButton>
          </div>
        </motion.div>

        {/* Enhanced Transport Controls */}
        <EnhancedTransportControls
          isPlaying={isPlaying}
          onPlayPause={() => handlers.transport(isPlaying ? 'pause' : 'play')}
          onStop={() => handlers.transport('stop')}
          onNext={() => handlers.transport('skipForward')}
          onPrevious={() => handlers.transport('skipBack')}
          currentTime={currentTime}
          totalTime={duration}
          zoom={state.zoom}
          onZoomChange={(zoom) => setState(prev => ({ ...prev, zoom }))}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Tracks */}
          <motion.div 
            className="w-80 border-r border-purple-800/30 bg-black/10 backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-4 border-b border-purple-800/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-purple-200">Tracks</h2>
                <HapticButton
                  size="sm"
                  onClick={() => handlers.addTrack('midi')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4" />
                </HapticButton>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-2">
                {state.tracks.map((track) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      state.selectedTracks.includes(track.id)
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-purple-800/30 bg-slate-800/30 hover:bg-slate-700/30'
                    }`}
                    onClick={() => handlers.toggleTrackSelection(track.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${track.color}`} />
                        <span className="text-sm font-medium text-purple-200">{track.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <HapticButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlers.updateTrack(track.id, { mute: !track.mute });
                          }}
                          className={`w-6 h-6 p-0 ${track.mute ? 'text-red-400' : 'text-purple-400'}`}
                        >
                          <VolumeX className="w-3 h-3" />
                        </HapticButton>
                        <HapticButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlers.deleteTrack(track.id);
                          }}
                          className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </HapticButton>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3 h-3 text-purple-400" />
                        <HapticSlider
                          value={[track.volume]}
                          onValueChange={([value]) => handlers.updateTrack(track.id, { volume: value })}
                          min={0}
                          max={1}
                          step={0.01}
                          className="flex-1"
                        />
                        <span className="text-xs text-purple-300 w-8">
                          {Math.round(track.volume * 100)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Main Panel */}
          <div className="flex-1 flex flex-col">
            <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))} className="flex-1 flex flex-col">
              <div className="border-b border-purple-800/30 bg-black/10 backdrop-blur-sm px-6">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800/30">
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="piano-roll" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Piano Roll
                  </TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Analysis
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="timeline" className="h-full m-0">
                  <motion.div 
                    className="h-full bg-gradient-to-br from-slate-800/20 to-slate-900/20 p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-full bg-black/20 rounded-lg border border-purple-800/30 p-4">
                      <h3 className="text-lg font-semibold text-purple-200 mb-4">Timeline View</h3>
                      <div className="h-[calc(100%-3rem)] bg-slate-900/50 rounded border border-slate-700/50 flex items-center justify-center">
                        <div className="text-center">
                          <Music className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                          <p className="text-purple-300">Timeline visualization will appear here</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="piano-roll" className="h-full m-0">
                  <motion.div 
                    className="h-full bg-gradient-to-br from-slate-800/20 to-slate-900/20 p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-full bg-black/20 rounded-lg border border-purple-800/30">
                      <ProfessionalPianoRoll
                        notes={state.notes}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        zoom={state.zoom}
                        onNoteClick={(note) => console.log('Note clicked:', note)}
                        onNoteMove={(noteId, newStart, newNote) => {
                          setState(prev => ({
                            ...prev,
                            notes: prev.notes.map(n => 
                              n.id === noteId 
                                ? { ...n, startTime: newStart, note: newNote }
                                : n
                            )
                          }));
                        }}
                        onNoteResize={(noteId, newDuration) => {
                          setState(prev => ({
                            ...prev,
                            notes: prev.notes.map(n => 
                              n.id === noteId 
                                ? { ...n, duration: newDuration }
                                : n
                            )
                          }));
                        }}
                      />
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="code" className="h-full m-0">
                  <motion.div 
                    className="h-full bg-gradient-to-br from-slate-800/20 to-slate-900/20 p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-full bg-black/20 rounded-lg border border-purple-800/30">
                      <CodeEditor
                        value={chordCraftCode}
                        onChange={updateCode}
                        onPlay={() => handlers.transport('play')}
                        onPause={() => handlers.transport('pause')}
                        onStop={() => handlers.transport('stop')}
                        onSave={() => handlers.saveProject()}
                        onFormat={() => handlers.formatCode()}
                        isPlaying={isPlaying}
                        isPaused={isPaused}
                        height="100%"
                        showToolbar={true}
                        showMinimap={true}
                        showLineNumbers={true}
                        theme="vs-dark"
                        fontSize={14}
                        readOnly={false}
                        placeholder="Enter your ChordCraft code here..."
                      />
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="analysis" className="h-full m-0">
                  <motion.div 
                    className="h-full bg-gradient-to-br from-slate-800/20 to-slate-900/20 p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-full bg-black/20 rounded-lg border border-purple-800/30">
                      <MusicAnalysis locked={false} />
                    </div>
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Controls */}
          <motion.div 
            className="w-80 border-l border-purple-800/30 bg-black/10 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-4 border-b border-purple-800/30">
              <h2 className="text-lg font-semibold text-purple-200">Controls</h2>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-6">
                {/* Tempo Control */}
                <Card className="bg-slate-800/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-200">Tempo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <HapticSlider
                        value={[state.tempo]}
                        onValueChange={([value]) => setState(prev => ({ ...prev, tempo: value }))}
                        min={60}
                        max={200}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-purple-300 w-12 font-mono">
                        {state.tempo} BPM
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Signature */}
                <Card className="bg-slate-800/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-200">Time Signature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={state.timeSignature} onValueChange={(value) => setState(prev => ({ ...prev, timeSignature: value }))}>
                      <SelectTrigger className="bg-slate-700/50 border-purple-600/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4/4">4/4</SelectItem>
                        <SelectItem value="3/4">3/4</SelectItem>
                        <SelectItem value="2/4">2/4</SelectItem>
                        <SelectItem value="6/8">6/8</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Master Volume */}
                <Card className="bg-slate-800/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-200">Master Volume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      <HapticSlider
                        value={[volume]}
                        onValueChange={([value]) => setVolume(value)}
                        min={0}
                        max={1}
                        step={0.01}
                        className="flex-1"
                      />
                      <span className="text-sm text-purple-300 w-12 font-mono">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Tools */}
                <Card className="bg-slate-800/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-200">AI Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <HapticButton
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => handlers.generateMusic('Generate a beautiful piano melody')}
                      disabled={isAnalyzing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'Generating...' : 'Generate Music'}
                    </HapticButton>
                    
                    <HapticButton
                      variant="outline"
                      className="w-full border-purple-600/30 text-purple-300 hover:bg-purple-600/20"
                      onClick={() => handlers.analyzeAudio()}
                      disabled={isAnalyzing}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Audio'}
                    </HapticButton>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
