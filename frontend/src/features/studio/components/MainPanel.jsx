import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { usePlaybackStore } from '../../../stores/usePlaybackStore';
import { useUIStore } from '../../../stores/useUIStore';
import { noteToMidi, snapToGrid, formatTime } from '../../../chordcraftUtils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { FileUpload } from '../../components/FileUpload';
import { ZoomIn, ZoomOut, Grid, Ruler, Upload, Music } from 'lucide-react';

export function MainPanel() {
      const {
        notes,
        selectedNote,
        setSelectedNote,
        tempo,
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
  const pianoKeys = useMemo(() => {
    const keys = [];
    for (let octave = 1; octave <= 8; octave++) {
      const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      notes.forEach(note => {
        keys.push({
          note: `${note}${octave}`,
          midi: noteToMidi(`${note}${octave}`),
          isSharp: note.includes('#')
        });
      });
    }
    return keys;
  }, []);
  pianoKeys.reverse(); // C8 at top, C1 at bottom

  const getNotePosition = useCallback((note) => {
    // Find index in reversed pianoKeys
    const keyIndex = pianoKeys.findIndex(key => key.note === note.pitch);
    if (keyIndex === -1) return { x: 0, y: 0, width: 0, height: NOTE_HEIGHT };

    const x = note.startTime * PIXELS_PER_SECOND + PIANO_WIDTH;
    const y = keyIndex * NOTE_HEIGHT;
    const width = note.duration * PIXELS_PER_SECOND;
    return { x, y, width, height: NOTE_HEIGHT };
  }, [PIXELS_PER_SECOND, pianoKeys]);

  const handleNoteClick = (noteId, event) => {
    event.stopPropagation();
    setSelectedNote(selectedNote === noteId ? null : noteId);
  };

  const handlePianoRollClick = (event) => {
    if (isDragging || isResizing) return;
    
    const rect = pianoRollRef.getBoundingClientRect();
    const x = event.clientX - rect.left - PIANO_WIDTH;
    const y = event.clientY - rect.top;
    
    const startTime = snapToGrid(x / PIXELS_PER_SECOND, gridResolution, tempo);
    const keyIndex = Math.floor(y / NOTE_HEIGHT);
    const pitch = pianoKeys[keyIndex]?.note;

    if (pitch) {
      addNote({ pitch, startTime, duration: 1 }); // Default duration 1 second
      showSuccess(`Added note: ${pitch} at ${formatTime(startTime)}`);
    }
  };

  const handleNoteDragStart = (noteId, event) => {
    event.stopPropagation();
    setIsDragging(true);
    setSelectedNote(noteId);
    setDragStart({
      startX: event.clientX,
      startY: event.clientY,
      initialNote: notes.find(n => n.id === noteId),
    });
  };

  const handleNoteResizeStart = (noteId, event) => {
    event.stopPropagation();
    setIsResizing(true);
    setSelectedNote(noteId);
    setResizeStart({
      startX: event.clientX,
      initialNote: notes.find(n => n.id === noteId),
    });
  };

  const handleMouseMove = useCallback((event) => {
    if (isDragging && dragStart) {
      const deltaX = event.clientX - dragStart.startX;
      const deltaY = event.clientY - dragStart.startY;
      
      const newStartTime = snapToGrid(dragStart.initialNote.startTime + deltaX / PIXELS_PER_SECOND, gridResolution, tempo);
      const newKeyIndex = Math.floor((pianoKeys.findIndex(key => key.note === dragStart.initialNote.pitch) * NOTE_HEIGHT - deltaY) / NOTE_HEIGHT);
      const newPitch = pianoKeys[newKeyIndex]?.note || dragStart.initialNote.pitch;

      updateNote(dragStart.initialNote.id, { 
        startTime: Math.max(0, newStartTime),
        pitch: newPitch
      });
    } else if (isResizing && resizeStart) {
      const deltaX = event.clientX - resizeStart.startX;
      const newDuration = snapToGrid(resizeStart.initialNote.duration + deltaX / PIXELS_PER_SECOND, gridResolution, tempo);
      updateNote(resizeStart.initialNote.id, { duration: Math.max(0.1, newDuration) });
    }
  }, [isDragging, dragStart, isResizing, resizeStart, PIXELS_PER_SECOND, gridResolution, tempo, pianoKeys, updateNote]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setIsResizing(false);
    setResizeStart(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  

  const handleSnapToggle = () => {
    setSnapToGrid(!snapEnabled);
  };

  const handleGridResolutionChange = (value) => {
    setGridResolution(value);
  };

  return (
    <main className="flex-1 bg-slate-900 overflow-hidden flex flex-col">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="h-12 bg-gray-800 border-b border-slate-700 flex items-center justify-between px-4">
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
            
            <div className="text-sm text-slate-400">
              {notes.length} notes
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <TabsContent value="timeline" className="flex-1 flex flex-col">
          {/* Timeline */}
          <div 
            className="h-10 bg-gray-800 border-b border-slate-700 relative overflow-x-auto"
            style={{ paddingLeft: PIANO_WIDTH }}
          >
            <div className="h-full relative" style={{ width: `${Math.max(1000, PIXELS_PER_SECOND * 10)}px` }}>
              {/* Time markers */}
                  {Array.from({ length: 20 }, (_, i) => {
                    const time = i * 1; // Every second
                    const x = time * PIXELS_PER_SECOND;
                    return (
                      <div
                        key={`timeline-${i}`}
                        className="absolute top-0 h-full border-l border-slate-600"
                        style={{ left: x }}
                      >
                        <span className="absolute -bottom-6 left-1 text-xs text-slate-400">
                          {formatTime(time)}
                        </span>
                      </div>
                    );
                  })}
              {/* Playhead */}
              <div 
                className="absolute top-0 h-full w-0.5 bg-blue-500 z-10" 
                style={{ left: currentTime * PIXELS_PER_SECOND + PIANO_WIDTH }} 
              />
            </div>
          </div>
          
          {/* Piano Roll */}
          <div className="flex-1 flex overflow-auto relative">
            {/* Piano Keys */}
            <div className="w-16 shrink-0 bg-gray-800 border-r border-slate-700">
              {pianoKeys.map((key) => (
                <div
                  key={key.note}
                  className={`flex items-center justify-center text-xs border-b border-slate-700 ${
                    key.isSharp 
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
                      height: position.height,
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
        </TabsContent>
        
            <TabsContent value="upload" className="flex-1 p-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Upload className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Audio Upload</h3>
                <p className="text-slate-400 mb-4">Upload audio files for analysis and processing</p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </TabsContent>
      </Tabs>
    </main>
  );
}