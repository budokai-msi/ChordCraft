import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileAudio, Loader2, CheckCircle, XCircle, 
  Play, Pause, Volume2, VolumeX, Trash2, Download, Eye
} from 'lucide-react';

// Ultra-compact constants
const ALLOWED_TYPES = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac', 'audio/ogg'];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export function AudioUpload({ onUpload, onAnalyze, isAnalyzing = false, analysisResult = null }) {
  const [state, setState] = useState({
    isDragging: false,
    isUploading: false,
    uploadProgress: 0,
    uploadedFile: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false
  });

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  // Ultra-compact update function
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Ultra-compact handlers
  const handlers = {
    handleDragOver: (e) => {
      e.preventDefault();
      updateState({ isDragging: true });
    },

    handleDragLeave: (e) => {
      e.preventDefault();
      updateState({ isDragging: false });
    },

    handleDrop: (e) => {
      e.preventDefault();
      updateState({ isDragging: false });
      const files = Array.from(e.dataTransfer.files);
      const audioFile = files.find(file => file.type.startsWith('audio/'));
      if (audioFile) handlers.handleFile(audioFile);
    },

    handleFileSelect: (e) => {
      const file = e.target.files[0];
      if (file) handlers.handleFile(file);
    },

    handleFile: async (file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert('Please upload a valid audio file (WAV, MP3, M4A, FLAC, or OGG)');
        return;
      }

      if (file.size > MAX_SIZE) {
        alert('File size must be less than 100MB');
        return;
      }

      updateState({ isUploading: true, uploadProgress: 0 });

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          updateState(prev => ({
            uploadProgress: prev.uploadProgress >= 90 ? (clearInterval(progressInterval), 90) : prev.uploadProgress + 10
          }));
        }, 200);

        // Create audio element for preview
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        
        audio.addEventListener('loadedmetadata', () => {
          updateState({ 
            uploadedFile: file,
            duration: audio.duration,
            uploadProgress: 100
          });
        });

        audio.addEventListener('timeupdate', () => {
          updateState({ currentTime: audio.currentTime });
        });

        audio.addEventListener('ended', () => {
          updateState({ isPlaying: false, currentTime: 0 });
        });

        audioRef.current = audio;
        onUpload?.(file);
        
        clearInterval(progressInterval);
        updateState({ isUploading: false, uploadProgress: 0 });
      } catch (error) {
        console.error('Error handling file:', error);
        updateState({ isUploading: false, uploadProgress: 0 });
      }
    },

    play: () => {
      if (audioRef.current) {
        if (state.isPlaying) {
          audioRef.current.pause();
          updateState({ isPlaying: false });
        } else {
          audioRef.current.play();
          updateState({ isPlaying: true });
        }
      }
    },

    stop: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        updateState({ isPlaying: false, currentTime: 0 });
      }
    },

    setVolume: (volume) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        updateState({ volume });
      }
    },

    toggleMute: () => {
      if (audioRef.current) {
        audioRef.current.muted = !state.isMuted;
        updateState({ isMuted: !state.isMuted });
      }
    },

    analyze: () => {
      if (state.uploadedFile) {
        onAnalyze?.(state.uploadedFile);
      }
    },

    remove: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
      updateState({ 
        uploadedFile: null, 
        isPlaying: false, 
        currentTime: 0, 
        duration: 0 
      });
    },

    download: () => {
      if (state.uploadedFile) {
        const url = URL.createObjectURL(state.uploadedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.uploadedFile.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  // Ultra-compact components
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const UploadArea = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        state.isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-muted-foreground hover:border-primary'
      }`}
      onDragOver={handlers.handleDragOver}
      onDragLeave={handlers.handleDragLeave}
      onDrop={handlers.handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {state.isUploading ? (
        <div className="space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
          <Progress value={state.uploadProgress} className="w-full" />
          <p className="text-xs text-muted-foreground">{state.uploadProgress}% complete</p>
        </div>
      ) : (
        <div className="space-y-2">
          <FileAudio className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium">Drop audio files here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            Supports WAV, MP3, M4A, FLAC, OGG (max 100MB)
          </p>
        </div>
      )}
    </div>
  );

  const AudioPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileAudio className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium truncate">{state.uploadedFile?.name}</span>
          <Badge variant="secondary" className="text-xs">
            {formatTime(state.duration)}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handlers.download}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handlers.remove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handlers.play}>
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handlers.stop}>
            <XCircle className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Progress value={(state.currentTime / state.duration) * 100} className="w-full" />
          </div>
          <span className="text-xs text-muted-foreground w-12">
            {formatTime(state.currentTime)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handlers.toggleMute}>
            {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.volume}
              onChange={(e) => handlers.setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <span className="text-xs text-muted-foreground w-12">
            {Math.round(state.volume * 100)}%
          </span>
        </div>
      </div>

      {/* Analysis Button */}
      <Button 
        onClick={handlers.analyze} 
        disabled={isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-2" />
            Analyze Audio
          </>
        )}
      </Button>
    </div>
  );

  const AnalysisResult = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-sm font-medium">Analysis Complete</span>
      </div>
      
      {analysisResult && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo:</span>
              <Badge variant="secondary">{analysisResult.tempo || 'Unknown'} BPM</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Key:</span>
              <Badge variant="secondary">{analysisResult.key || 'Unknown'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{formatTime(analysisResult.duration || 0)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energy:</span>
              <Progress value={analysisResult.energy * 100 || 0} className="w-16" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valence:</span>
              <Progress value={analysisResult.valence * 100 || 0} className="w-16" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Danceability:</span>
              <Progress value={analysisResult.danceability * 100 || 0} className="w-16" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Audio Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!state.uploadedFile ? (
          <UploadArea />
        ) : (
          <AudioPreview />
        )}

        {analysisResult && <AnalysisResult />}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handlers.handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}