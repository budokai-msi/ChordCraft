"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Music,
  Code,
  Eye
} from 'lucide-react';
import { useChordCraftStore } from '../store/useChordCraftStore';
import { useAudioEngine } from '../services/AudioEngine';
import { HapticButton } from '../components/HapticButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function StudioPage() {
  const [viewMode, setViewMode] = useState<'timeline' | 'classic'>('timeline');
  const [copied, setCopied] = useState(false);
  
  const {
    code,
    song,
    playbackStrategy,
    checksumStatus,
  } = useChordCraftStore();

  const audioEngine = useAudioEngine();

  // Load audio when song changes
  useEffect(() => {
    if (song && song.flacData) {
      // For now, we'll use a placeholder URL
      // In a real implementation, you'd create a blob URL from the FLAC data
      const audioUrl = URL.createObjectURL(new Blob([song.flacData], { type: 'audio/flac' }));
      audioEngine.loadAudio(audioUrl);
    }
  }, [song, audioEngine]);

  const handlePlayPause = () => {
    if (audioEngine.isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleCopyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'lossless': return 'bg-green-500';
      case 'neural': return 'bg-blue-500';
      case 'synthetic': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'lossless': return 'Lossless';
      case 'neural': return 'Neural';
      case 'synthetic': return 'Synthetic';
      default: return 'Unknown';
    }
  };

  if (!code || !song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Song Loaded</h2>
          <p className="text-slate-300">Please upload an audio file first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">ChordCraft Studio</h1>
              <Badge className={getStrategyColor(playbackStrategy)}>
                {getStrategyLabel(playbackStrategy)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {checksumStatus && (
                <div className="flex items-center space-x-2">
                  {checksumStatus.valid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Identical Playback</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Code Modified</span>
                    </>
                  )}
                  {song.audio && (
                    <span className="text-xs text-slate-400">
                      ({song.audio.sr / 1000}kHz / {song.audio.channels}ch)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Transport Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <HapticButton
                  onClick={handlePlayPause}
                  variant="outline"
                  hapticType="medium"
                  className="w-12 h-12 rounded-full"
                >
                  {audioEngine.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </HapticButton>
                
                <HapticButton
                  onClick={handleStop}
                  variant="outline"
                  hapticType="light"
                  className="w-10 h-10 rounded-full"
                >
                  <Square className="w-4 h-4" />
                </HapticButton>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-300">
                  {formatTime(audioEngine.currentTime)} / {formatTime(audioEngine.duration)}
                </div>
                
                <div className="w-64">
                  <Progress 
                    value={(audioEngine.currentTime / audioEngine.duration) * 100} 
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Timeline/Classic View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Music className="w-5 h-5" />
                  <span>Playback View</span>
                </CardTitle>
                
                <div className="flex space-x-2">
                  <HapticButton
                    onClick={() => setViewMode('timeline')}
                    variant={viewMode === 'timeline' ? 'default' : 'outline'}
                    hapticType="light"
                    className="text-sm"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Timeline
                  </HapticButton>
                  <HapticButton
                    onClick={() => setViewMode('classic')}
                    variant={viewMode === 'classic' ? 'default' : 'outline'}
                    hapticType="light"
                    className="text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Classic
                  </HapticButton>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'timeline' ? (
                <TimelineView song={song} />
              ) : (
                <ClassicView song={song} />
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>ChordCraft Code</span>
                </CardTitle>
                
                <HapticButton
                  onClick={handleCopyCode}
                  variant="outline"
                  hapticType="light"
                  className="text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </>
                  )}
                </HapticButton>
              </div>
            </CardHeader>
            <CardContent>
              <CodePane code={code} />
            </CardContent>
          </Card>
        </div>

        {/* Song Details */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{song.meta.bpm}</div>
                <div className="text-sm text-slate-400">BPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{song.meta.key}</div>
                <div className="text-sm text-slate-400">Key</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{song.meta.time}</div>
                <div className="text-sm text-slate-400">Time Signature</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Timeline View Component
function TimelineView({ song }: { song: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center text-slate-400">
        Timeline view coming soon...
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-sm text-slate-300">
          <strong>Chords:</strong> {song.analysis.chords}
        </div>
      </div>
    </div>
  );
}

// Classic View Component
function ClassicView({ song }: { song: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2">Chord Progression</h4>
          <div className="text-sm text-slate-300 font-mono">
            {song.analysis.chords}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Key</h4>
            <div className="text-2xl font-bold text-primary">{song.meta.key}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">BPM</h4>
            <div className="text-2xl font-bold text-primary">{song.meta.bpm}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Code Pane Component
function CodePane({ code }: { code: string }) {
  return (
    <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-96">
      <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}
