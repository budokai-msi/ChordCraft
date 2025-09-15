import React from 'react';
import { usePlaybackStore } from '../../../stores/usePlaybackStore';
import { useProjectStore } from '../../../stores/useProjectStore';
import { audioEngine } from '../../../services/AudioEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Save, Music, Zap, Brain, Clock, Volume2 } from 'lucide-react';

export function TransportControls({ userEmail }) {
  // Select only the state and actions you need from the stores
  const { isPlaying, play, pause, stop, setTempo, tempo, currentTime } = usePlaybackStore();
  const { projectTitle, setProjectTitle, notes } = useProjectStore();

  const handlePlay = () => {
    audioEngine.setTempo(tempo);
    audioEngine.play(notes);
    play();
  };

  const handlePause = () => {
    audioEngine.stop(); // For now, pause is the same as stop
    pause();
  };
  
  const handleStop = () => {
    audioEngine.stop();
    stop();
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex items-center justify-between h-16 glass-pane border-b border-white/10 px-6 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center neon-glow">
            <Music className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold vibrant-gradient-text">ChordCraft</h1>
        </div>
        
        <Input
          className="vibrant-input w-80"
          placeholder="Untitled Project"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={isPlaying ? handlePause : handlePlay}
            className="hover:bg-primary/20 hover:scale-110 transition-all duration-200"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleStop}
            className="hover:bg-destructive/20 hover:scale-110 transition-all duration-200"
          >
            <Square className="h-5 w-5" />
          </Button>
        </div>

        {/* BPM Control */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-300">BPM</label>
          <Input
            type="number"
            className="w-24 vibrant-input text-center"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value, 10))}
            min="60"
            max="200"
          />
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Zap className="w-3 h-3 mr-1" />
            AI Ready
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Brain className="w-3 h-3 mr-1" />
            Muzic AI
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Project
        </Button>
        <div className="text-sm">
          <p className="font-medium text-white">{userEmail || 'Guest'}</p>
          <p className="text-xs text-slate-400">Pro Plan</p>
        </div>
      </div>
    </header>
  );
}
