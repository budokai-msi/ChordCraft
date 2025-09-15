import React, { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { usePlaybackStore } from '../../../stores/usePlaybackStore';
import { useUIStore } from '../../../stores/useUIStore';
import { noteToMidi, midiToNote, snapToGrid, formatTime } from '../../../chordcraftUtils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '../../FileUpload';
import { ZoomIn, ZoomOut, Grid, Ruler, Upload, Music } from 'lucide-react';

export function MainPanel() {
  const { 
    notes, 
    selectedNote, 
    setSelectedNote,
    tempo,
    viewMode,
    setViewMode,
    zoomLevel,
    setZoomLevel,
    snapToGrid: snapEnabled,
    setSnapToGrid,
    gridResolution,
    setGridResolution,
    addNote,
    updateNote
  } = useProjectStore();
  
  const { currentTime } = usePlaybackStore();
  const { showSuccess } = useUIStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);
  const [pianoRollRef, setPianoRollRef] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  
  // Piano roll dimensions
  const PIXELS_PER_SECOND = 100 * zoomLevel;
  const NOTE_HEIGHT = 20;
  const PIANO_WIDTH = 60;
  const TIMELINE_HEIGHT = 40;
  
  // Generate piano keys (C1 to C8)
  const pianoKeys = [];
  for (let octave = 1; octave <= 8; octave++) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    notes.forEach(note => {
      pianoKeys.push({
        note: `${note}${octave}`,
        midi: noteToMidi(`${note}${octave}`),
        isBlack: ['C#', 'D#', 'F#', 'G#', 'A#'].includes(note)
      });
    });
  }
  pianoKeys.reverse(); // Start from highest note
  
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel * 1.2, 5));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel / 1.2, 0.1));
  };
  
  const handleSnapToggle = () => {
    setSnapToGrid(!snapEnabled);
  };
  
  const handleGridResolutionChange = (value) => {
    setGridResolution(value);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const getNotePosition = (note) => {
    const midi = noteToMidi(note.pitch);
    const keyIndex = pianoKeys.findIndex(key => key.midi === midi);
    const y = keyIndex * NOTE_HEIGHT;
    const x = note.startTime * PIXELS_PER_SECOND;
    const width = note.duration * PIXELS_PER_SECOND;
    
    return { x, y, width, height: NOTE_HEIGHT };
  };
  
  const handleNoteClick = (noteId, event) => {
    event.stopPropagation();
    setSelectedNote(selectedNote === noteId ? null : noteId);
  };
  
  const handleNoteDragStart = (noteId, event) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      noteId,
      startX: event.clientX,
      startY: event.clientY,
      originalStartTime: notes.find(n => n.id === noteId).startTime,
      originalPitch: notes.find(n => n.id === noteId).pitch
    });
  };
  
  const handleNoteResizeStart = (noteId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      noteId,
      startX: event.clientX,
      originalDuration: notes.find(n => n.id === noteId).duration
    });
  };
  
  const handleMouseMove = useCallback((event) => {
    if (!pianoRollRef) return;
    
    if (isDragging && dragStart) {
      const deltaX = event.clientX - dragStart.startX;
      const deltaY = event.clientY - dragStart.startY;
      
      const timeDelta = deltaX / PIXELS_PER_SECOND;
      const pitchDelta = Math.round(-deltaY / NOTE_HEIGHT);
      
      let newStartTime = dragStart.originalStartTime + timeDelta;
      if (snapEnabled) {
        newStartTime = snapToGrid(newStartTime, gridResolution, tempo);
      }
      
      const newMidi = noteToMidi(dragStart.originalPitch) + pitchDelta;
      const newPitch = midiToNote(newMidi);
      
      updateNote(dragStart.noteId, { 
        startTime: Math.max(0, newStartTime), 
        pitch: newPitch 
      });
    }
    
    if (isResizing && resizeStart) {
      const deltaX = event.clientX - resizeStart.startX;
      const timeDelta = deltaX / PIXELS_PER_SECOND;
      
      let newDuration = resizeStart.originalDuration + timeDelta;
      if (snapEnabled) {
        newDuration = snapToGrid(newDuration, gridResolution, tempo);
      }
      
      updateNote(resizeStart.noteId, { 
        duration: Math.max(0.1, newDuration) 
      });
    }
  }, [pianoRollRef, isDragging, dragStart, isResizing, resizeStart, PIXELS_PER_SECOND, NOTE_HEIGHT, snapEnabled, gridResolution, tempo, updateNote]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragStart(null);
    setResizeStart(null);
  }, []);
  
  const handlePianoRollClick = (event) => {
    if (isDragging || isResizing) return;
    
    const rect = pianoRollRef.getBoundingClientRect();
    const x = event.clientX - rect.left - PIANO_WIDTH;
    const y = event.clientY - rect.top;
    
    const time = x / PIXELS_PER_SECOND;
    const keyIndex = Math.floor(y / NOTE_HEIGHT);
    
    if (keyIndex >= 0 && keyIndex < pianoKeys.length) {
      const key = pianoKeys[keyIndex];
      const snappedTime = snapEnabled ? snapToGrid(time, gridResolution, tempo) : time;
      
      addNote({
        pitch: key.note,
        startTime: Math.max(0, snappedTime),
        duration: snapEnabled ? snapToGrid(1, gridResolution, tempo) : 1,
        velocity: 0.8
      });
      
      showSuccess(`Added note ${key.note}`);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <main className="flex-1 bg-slate-900 overflow-hidden flex flex-col">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Audio
            </TabsTrigger>
          </TabsList>
          
          {/* Toolbar */}
          <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('timeline')}
            >
              <Ruler className="h-4 w-4 mr-1" />
              Timeline
            </Button>
            <Button
              variant={viewMode === 'piano_roll' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('piano_roll')}
            >
              <Grid className="h-4 w-4 mr-1" />
              Piano Roll
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={snapEnabled ? 'default' : 'ghost'}
              size="sm"
              onClick={handleSnapToggle}
            >
              <Grid className="h-4 w-4 mr-1" />
              Snap
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Grid:</span>
              <Slider
                value={[gridResolution]}
                onValueChange={([value]) => handleGridResolutionChange(value)}
                min={1}
                max={32}
                step={1}
                className="w-20"
              />
              <span className="text-sm text-slate-400">{gridResolution}</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-slate-400">
          {notes.length} notes
        </div>
      </div>
      
      {/* Tab Content */}
      <TabsContent value="timeline" className="flex-1 flex flex-col">
        {/* Timeline */}
      <div 
        className="h-10 bg-slate-800 border-b border-slate-700 relative overflow-x-auto"
        style={{ paddingLeft: PIANO_WIDTH }}
      >
        <div className="h-full relative" style={{ width: `${Math.max(1000, PIXELS_PER_SECOND * 10)}px` }}>
          {/* Time markers */}
          {Array.from({ length: 20 }, (_, i) => {
            const time = i * 0.5;
            const x = time * PIXELS_PER_SECOND;
            return (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-slate-600"
                style={{ left: x }}
              >
                <div className="text-xs text-slate-400 mt-1 ml-1">
                  {formatTime(time)}
                </div>
              </div>
            );
          })}
          
          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
            style={{ left: currentTime * PIXELS_PER_SECOND }}
          />
        </div>
      </div>
      
      {/* Piano Roll */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Piano Keys */}
          <div className="w-15 bg-slate-800 border-r border-slate-700 flex-shrink-0">
            {pianoKeys.map((key) => (
              <div
                key={key.note}
                className={`h-5 border-b border-slate-700 flex items-center justify-center text-xs ${
                  key.isBlack 
                    ? 'bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 text-slate-800'
                }`}
                style={{ height: NOTE_HEIGHT }}
              >
                {key.note}
              </div>
            ))}
          </div>
          
          {/* Note Area */}
          <div 
            ref={setPianoRollRef}
            className="flex-1 relative cursor-crosshair"
            onClick={handlePianoRollClick}
            style={{ 
              width: `${Math.max(1000, PIXELS_PER_SECOND * 10)}px`,
              height: `${pianoKeys.length * NOTE_HEIGHT}px`
            }}
          >
            {/* Grid lines */}
            {Array.from({ length: 20 }, (_, i) => {
              const time = i * 0.5;
              const x = time * PIXELS_PER_SECOND;
              return (
                <div
                  key={`grid-${i}`}
                  className="absolute top-0 h-full border-l border-slate-700"
                  style={{ left: x }}
                />
              );
            })}
            
            {/* Notes */}
            {notes.map(note => {
              const position = getNotePosition(note);
              const isSelected = selectedNote === note.id;
              
              return (
                <div
                  key={note.id}
                  className={`absolute rounded cursor-pointer border-2 ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-300' 
                      : 'bg-blue-600 border-blue-400'
                  }`}
                  style={{
                    left: position.x,
                    top: position.y,
                    width: position.width,
                    height: position.height - 2,
                    marginTop: 1
                  }}
                  onClick={(e) => handleNoteClick(note.id, e)}
                  onMouseDown={(e) => handleNoteDragStart(note.id, e)}
                >
                  <div className="h-full flex items-center justify-between px-1">
                    <span className="text-xs text-white truncate">
                      {note.pitch}
                    </span>
                    <div
                      className="w-2 h-full bg-white/30 rounded cursor-ew-resize"
                      onMouseDown={(e) => handleNoteResizeStart(note.id, e)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </TabsContent>
      
      <TabsContent value="upload" className="flex-1 p-6">
        <FileUpload 
          onAnalysisComplete={(result) => {
            console.log('Analysis complete:', result);
            showSuccess('Audio analysis completed!');
          }}
        />
      </TabsContent>
    </Tabs>
    </main>
  );
}
