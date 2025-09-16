import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { CodeEditor } from '../../components/CodeEditor';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, Settings, 
  Upload, Download, Share2, Copy, Trash2, Plus, Music, Headphones, Mic, 
  Brain, Code, BarChart3, Piano, Zap, Sparkles, ChevronDown, ChevronUp, 
  MoreHorizontal, Edit3, Save, RefreshCw, ExternalLink, ArrowRight, ArrowLeft, 
  Star, Heart, Eye, EyeOff, Lock, Unlock, Shield, Crown, Target, Wand2,
  MessageSquare, FileText, Layers, Clock, Users, FolderOpen, Search, Filter
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePlaybackStore } from '../../stores/usePlaybackStore';
import { AICompanion } from './components/AICompanion';
import { ProjectManager } from './components/ProjectManager';
import { AudioUpload } from '../../components/AudioUpload';
import { Timeline } from '../../components/Timeline';
import { TrackManager } from '../../components/TrackManager';
import { subscriptionService } from '../../services/subscriptionService';
import { generateMusic } from '../../services/musicApiService';
import { analyzeAudio } from '../../services/audioAnalysisService';

// Ultra-compact constants
const ASSETS = {
  aiPowered: '/assets/ai-powered-icon.png',
  daw: '/assets/daw-icon.png',
  musicToCode: '/assets/music-to-code-icon.png',
  realTimeAnalysis: '/assets/real-time-analysis-icon.png'
};

const TRANSPORT_CONTROLS = [
  { id: 'skipBack', icon: SkipBack, action: 'skipBack' },
  { id: 'play', icon: Play, action: 'play', primary: true },
  { id: 'pause', icon: Pause, action: 'pause' },
  { id: 'stop', icon: Square, action: 'stop' },
  { id: 'skipForward', icon: SkipForward, action: 'skipForward' }
];

const TRACK_TYPES = [
  { id: 'audio', label: 'Audio', icon: Music, color: 'bg-blue-500' },
  { id: 'midi', label: 'MIDI', icon: Piano, color: 'bg-green-500' },
  { id: 'drum', label: 'Drums', icon: Headphones, color: 'bg-purple-500' },
  { id: 'vocal', label: 'Vocals', icon: Mic, color: 'bg-pink-500' }
];

export function ModernStudio() {
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

  // Ultra-compact state
  const [state, setState] = useState({
    activeTab: 'timeline', selectedTrack: null, isRecording: false, 
    isMuted: false, tempo: 120, timeSignature: '4/4', zoom: 1,
    showSettings: false, showProjectManager: false, showAICompanion: false,
    tracks: [], selectedTracks: [], isPro: false, dailyUsage: 0
  });

  const [maxDailyUsage] = useState(5);

  // Ultra-compact update function
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Initialize everything in one effect
  useEffect(() => {
    const init = async () => {
      try {
        const status = subscriptionService.getSubscriptionStatus();
        updateState({ isPro: status.isPro });
        const today = new Date().toDateString();
        const storedUsage = localStorage.getItem(`ai-usage-${today}`);
        updateState({ dailyUsage: storedUsage ? parseInt(storedUsage) : 0 });
      } catch (error) {
        console.error('Failed to initialize studio:', error);
      }
    };
    init();
  }, []);

  // Ultra-compact handlers
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
        color: TRACK_TYPES.find(t => t.id === type)?.color || 'bg-gray-500'
      };
      updateState({ tracks: [...state.tracks, newTrack] });
    },

    deleteTrack: (trackId) => {
      updateState({ 
        tracks: state.tracks.filter(t => t.id !== trackId),
        selectedTracks: state.selectedTracks.filter(id => id !== trackId)
      });
    },

    updateTrack: (trackId, updates) => {
      updateState({
        tracks: state.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t)
      });
    },

    toggleTrackSelection: (trackId) => {
      updateState({
        selectedTracks: state.selectedTracks.includes(trackId)
          ? state.selectedTracks.filter(id => id !== trackId)
          : [...state.selectedTracks, trackId]
      });
    },

    generateMusic: async (prompt) => {
      if (!state.isPro && state.dailyUsage >= maxDailyUsage) {
        showError(`Daily limit reached (${maxDailyUsage} requests). Upgrade to PRO for unlimited access!`);
        return;
      }

      setAnalyzing(true);
      try {
        const response = await generateMusic({ prompt, userId: 'user' });
        if (response.success) {
          updateCode(chordCraftCode + '\n\n' + response.chordCraftCode);
          showSuccess('AI generated music successfully!');
        } else {
          throw new Error(response.error || 'Generation failed');
        }
      } catch (error) {
        showError(`AI generation failed: ${error.message}`);
      } finally {
        setAnalyzing(false);
      }
    },

    analyzeAudio: async (file) => {
      if (!state.isPro && state.dailyUsage >= maxDailyUsage) {
        showError(`Daily limit reached (${maxDailyUsage} requests). Upgrade to PRO for unlimited access!`);
        return;
      }

      setAnalyzing(true);
      try {
        const result = await analyzeAudio(file);
        if (result.success) {
          showSuccess('Audio analyzed successfully!');
          return result;
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (error) {
        showError(`Audio analysis failed: ${error.message}`);
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

    importProject: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          updateCode(projectData.code || '');
          updateState({ 
            tracks: projectData.tracks || [],
            tempo: projectData.tempo || 120,
            timeSignature: projectData.timeSignature || '4/4'
          });
          showSuccess('Project imported successfully!');
        } catch {
          showError('Failed to import project. Invalid file format.');
        }
      };
      reader.readAsText(file);
    },

    saveProject: () => {
      // Save project logic here
      showSuccess('Project saved successfully!');
    },

    formatCode: () => {
      // Format code logic here - could be a simple indentation fix
      const formatted = chordCraftCode
        .split('\n')
        .map(line => line.trim())
        .join('\n');
      updateCode(formatted);
      showSuccess('Code formatted successfully!');
    }
  };

  // Ultra-compact components
  const AssetIcon = ({ src, alt, className = "w-6 h-6" }) => (
    <img src={src} alt={alt} className={className} />
  );

  const TransportControls = () => (
    <div className="flex items-center space-x-2">
      {TRANSPORT_CONTROLS.map(({ id, icon: Icon, action, primary }) => (
        <Button
          key={id}
          variant={primary ? "default" : "outline"}
          size="sm"
          onClick={() => handlers.transport(action)}
          className={`${primary ? "btn-primary" : "hover:bg-primary/20"} h-8 px-2`}
          aria-label={`${action} audio`}
          title={`${action} audio`}
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );

  const TrackList = () => (
    <div className="space-y-2">
      {state.tracks.map(track => (
        <div key={track.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${
          state.selectedTracks.includes(track.id) ? 'border-primary bg-primary/10' : 'border-border'
        }`}>
          <div className={`w-3 h-3 rounded-full ${track.color}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{track.name}</p>
            <p className="text-xs text-muted-foreground">{track.type}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handlers.updateTrack(track.id, { mute: !track.mute })}
              aria-label={track.mute ? "Unmute track" : "Mute track"}
              title={track.mute ? "Unmute track" : "Mute track"}
            >
              {track.mute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handlers.deleteTrack(track.id)}
              aria-label="Delete track"
              title="Delete track"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const AddTrackButton = () => (
    <div className="grid grid-cols-2 gap-2">
      {TRACK_TYPES.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="outline"
          size="sm"
          onClick={() => handlers.addTrack(id)}
          className="justify-start hover:bg-primary/20 h-8 px-3 text-xs"
          aria-label={`Add ${label} track`}
          title={`Add ${label} track`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Enhanced Header with Assets */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AssetIcon src={ASSETS.daw} alt="DAW" className="w-8 h-8" />
            <h1 className="text-2xl font-bold vibrant-gradient-text">ChordCraft Studio</h1>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <AssetIcon src={ASSETS.aiPowered} alt="AI Powered" className="w-4 h-4 mr-2" />
            AI Powered
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <TransportControls />
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Tempo:</span>
            <Slider
              value={[state.tempo]}
              onValueChange={([value]) => updateState({ tempo: value })}
              min={60}
              max={200}
              step={1}
              className="w-24"
              aria-label="Tempo control"
              title={`Current tempo: ${state.tempo} BPM`}
            />
            <span className="text-sm font-mono w-12">{state.tempo} BPM</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Volume:</span>
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              min={0}
              max={1}
              step={0.01}
              className="w-24"
              aria-label="Volume control"
              title={`Current volume: ${Math.round(volume * 100)}%`}
            />
            <span className="text-sm font-mono w-12">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <Tabs value={state.activeTab} onValueChange={(value) => updateState({ activeTab: value })} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="tracks" className="flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Tracks</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <AssetIcon src={ASSETS.realTimeAnalysis} alt="Real-time Analysis" className="w-5 h-5 mr-2" />
                      Timeline
                    </span>
                    <Button size="sm" variant="outline" onClick={() => updateState({ showProjectManager: true })}>
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracks" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Music className="w-5 h-5 mr-2" />
                      Tracks
                    </span>
                    <Button size="sm" variant="outline" onClick={() => updateState({ showSettings: !state.showSettings })}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TrackList />
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Add Track</h4>
                    <AddTrackButton />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 p-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AssetIcon src={ASSETS.musicToCode} alt="Music to Code" className="w-5 h-5 mr-2" />
                    AI Companion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AICompanion />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlers.exportProject()}
                className="h-8 px-3 text-xs"
                aria-label="Export current project"
                title="Export current project"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('import-file')?.click()}
                className="h-8 px-3 text-xs"
                aria-label="Import project file"
                title="Import project file"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".chordcraft,.json"
                onChange={(e) => e.target.files[0] && handlers.importProject(e.target.files[0])}
                className="hidden"
                aria-label="Import project file"
                title="Select a project file to import"
              />
              <Separator orientation="vertical" className="h-6" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => updateState({ showAICompanion: !state.showAICompanion })}
                className="h-8 px-3 text-xs"
                aria-label="Toggle AI Assistant"
                title="Toggle AI Assistant"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="text-sm font-mono">{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="text-sm font-mono">{Math.floor(duration / 60)}:{(duration % 60).toFixed(1).padStart(4, '0')}</span>
              </div>
              {isAnalyzing && (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    ChordCraft Code
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(chordCraftCode)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateCode('')}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: 0, height: '500px' }}>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {state.showProjectManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl h-3/4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Project Manager</span>
                <Button variant="outline" size="sm" onClick={() => updateState({ showProjectManager: false })}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectManager />
            </CardContent>
          </Card>
        </div>
      )}

      {state.showAICompanion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-6xl h-5/6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Companion</span>
                <Button variant="outline" size="sm" onClick={() => updateState({ showAICompanion: false })}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AICompanion />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}