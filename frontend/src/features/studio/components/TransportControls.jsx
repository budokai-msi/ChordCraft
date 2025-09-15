import React from 'react';
import { usePlaybackStore } from '../../../stores/usePlaybackStore';
import { useProjectStore } from '../../../stores/useProjectStore';
import { audioEngine } from '../../../services/AudioEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Square, Save } from 'lucide-react';

export function TransportControls({ userEmail }) {
  // Select only the state and actions you need from the stores
  const { isPlaying, play, pause, stop, setTempo, tempo } = usePlaybackStore();
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

  return (
      <header className="flex items-center justify-between h-16 bg-slate-800 border-b border-slate-700 px-4 shrink-0">
          <div className="flex items-center gap-4">
               <h1 className="text-xl font-bold">ChordCraft</h1>
               <Input
                  className="bg-slate-700 border-slate-600 w-64"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
               />
          </div>
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={isPlaying ? handlePause : handlePlay}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleStop}>
                  <Square className="h-5 w-5" /> {/* Stop Button */}
              </Button>
              <div className="flex items-center gap-2">
                  <label className="text-sm">BPM</label>
                  <Input
                      type="number"
                      className="w-20 bg-slate-700 border-slate-600"
                      value={tempo}
                      onChange={(e) => setTempo(parseInt(e.target.value, 10))}
                  />
              </div>
          </div>
          <div className="flex items-center gap-4">
              <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Project
              </Button>
              <span className="text-sm text-slate-400">{userEmail}</span>
          </div>
      </header>
  );
}
