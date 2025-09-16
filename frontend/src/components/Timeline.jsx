import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Square, SkipBack, SkipForward, Volume2, VolumeX, 
  ZoomIn, ZoomOut, Maximize, Minimize, Grid, Ruler, Clock
} from 'lucide-react';

// Ultra-compact constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [1, 2, 3, 4, 5, 6, 7, 8];
const BEATS_PER_BAR = 4;
const SUBDIVISIONS = 16;

export function Timeline() {
  const [state, setState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 32,
    zoom: 1,
    snapToGrid: true,
    selectedNotes: [],
    notes: [],
    tempo: 120,
    timeSignature: '4/4'
  });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Ultra-compact update function
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Generate note grid
  const generateNotes = () => {
    const notes = [];
    for (let octave of OCTAVES) {
      for (let noteName of NOTE_NAMES) {
        notes.push({
          id: `${noteName}${octave}`,
          name: noteName,
          octave,
          fullName: `${noteName}${octave}`,
          frequency: 440 * Math.pow(2, (octave - 4) + (NOTE_NAMES.indexOf(noteName) - 9) / 12)
        });
      }
    }
    return notes;
  };

  const notes = generateNotes();

  // Draw timeline
  const drawTimeline = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    const gridSize = 20 * state.zoom;
    const noteHeight = 20;
    const timeWidth = 50;

    // Draw horizontal lines (notes)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i < notes.length; i++) {
      const y = i * noteHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw vertical lines (time)
    ctx.strokeStyle = '#475569';
    for (let i = 0; i < rect.width; i += timeWidth) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, rect.height);
      ctx.stroke();
    }

    // Draw current time indicator
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    const currentX = (state.currentTime / state.duration) * rect.width;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, rect.height);
    ctx.stroke();

    // Draw notes
    state.notes.forEach(note => {
      const noteIndex = notes.findIndex(n => n.id === note.noteId);
      if (noteIndex === -1) return;

      const x = (note.startTime / state.duration) * rect.width;
      const y = noteIndex * noteHeight;
      const width = ((note.endTime - note.startTime) / state.duration) * rect.width;

      ctx.fillStyle = note.color || '#8b5cf6';
      ctx.fillRect(x, y, width, noteHeight - 1);

      // Draw note name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(note.name || '', x + 2, y + 12);
    });
  };

  useEffect(() => {
    drawTimeline();
  }, [state]);

  // Ultra-compact handlers
  const handlers = {
    play: () => updateState({ isPlaying: !state.isPlaying }),
    stop: () => updateState({ isPlaying: false, currentTime: 0 }),
    skipBack: () => updateState({ currentTime: Math.max(0, state.currentTime - 1) }),
    skipForward: () => updateState({ currentTime: Math.min(state.duration, state.currentTime + 1) }),
    zoomIn: () => updateState({ zoom: Math.min(4, state.zoom * 1.2) }),
    zoomOut: () => updateState({ zoom: Math.max(0.1, state.zoom / 1.2) }),
    toggleSnap: () => updateState({ snapToGrid: !state.snapToGrid }),
    addNote: (noteId, startTime, endTime) => {
      const newNote = {
        id: Date.now(),
        noteId,
        startTime,
        endTime,
        name: notes.find(n => n.id === noteId)?.fullName || '',
        color: '#8b5cf6'
      };
      updateState({ notes: [...state.notes, newNote] });
    },
    deleteNote: (noteId) => {
      updateState({ notes: state.notes.filter(n => n.id !== noteId) });
    }
  };

  // Ultra-compact components
  const TransportControls = () => (
    <div className="flex items-center space-x-2">
      <Button size="sm" variant="outline" onClick={handlers.skipBack}>
        <SkipBack className="w-4 h-4" />
      </Button>
      <Button size="sm" variant={state.isPlaying ? "destructive" : "default"} onClick={handlers.play}>
        {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      <Button size="sm" variant="outline" onClick={handlers.stop}>
        <Square className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={handlers.skipForward}>
        <SkipForward className="w-4 h-4" />
      </Button>
    </div>
  );

  const ZoomControls = () => (
    <div className="flex items-center space-x-2">
      <Button size="sm" variant="outline" onClick={handlers.zoomOut}>
        <ZoomOut className="w-4 h-4" />
      </Button>
      <span className="text-sm font-mono w-12">{Math.round(state.zoom * 100)}%</span>
      <Button size="sm" variant="outline" onClick={handlers.zoomIn}>
        <ZoomIn className="w-4 h-4" />
      </Button>
    </div>
  );

  const NoteGrid = () => (
    <div className="flex">
      {/* Note names column */}
      <div className="w-16 border-r border-border bg-muted/50">
        {notes.map(note => (
          <div key={note.id} className="h-5 flex items-center justify-center text-xs font-mono border-b border-border">
            {note.fullName}
          </div>
        ))}
      </div>
      
      {/* Timeline canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={(e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const noteIndex = Math.floor(y / 20);
            const time = (x / rect.width) * state.duration;
            
            if (noteIndex >= 0 && noteIndex < notes.length) {
              const snapTime = state.snapToGrid ? Math.round(time * SUBDIVISIONS) / SUBDIVISIONS : time;
              handlers.addNote(notes[noteIndex].id, snapTime, snapTime + 0.25);
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Timeline
          </span>
          <div className="flex items-center space-x-4">
            <TransportControls />
            <ZoomControls />
            <Button size="sm" variant={state.snapToGrid ? "default" : "outline"} onClick={handlers.toggleSnap}>
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={containerRef} className="h-64 overflow-auto">
          <NoteGrid />
        </div>
      </CardContent>
    </Card>
  );
}