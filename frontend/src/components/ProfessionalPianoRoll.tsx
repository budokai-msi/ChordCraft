import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "./ui/card";

interface Note {
  id: string;
  note: string;
  startTime: number;
  duration: number;
  velocity: number;
  color: string;
}

interface ProfessionalPianoRollProps {
  notes: Note[];
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  onNoteClick?: (note: Note) => void;
  onNoteMove?: (noteId: string, newStart: number, newNote: string) => void;
  onNoteResize?: (noteId: string, newDuration: number) => void;
}

export function ProfessionalPianoRoll({
  notes,
  isPlaying,
  currentTime,
  zoom,
  onNoteClick,
  onNoteMove,
  onNoteResize
}: ProfessionalPianoRollProps) {
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [resizingNote, setResizingNote] = useState<Note | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  // Professional piano note layout (88 keys like a real piano)
  const allNotes = [
    'C8', 'B7', 'A#7', 'A7', 'G#7', 'G7', 'F#7', 'F7', 'E7', 'D#7', 'D7', 'C#7',
    'C7', 'B6', 'A#6', 'A6', 'G#6', 'G6', 'F#6', 'F6', 'E6', 'D#6', 'D6', 'C#6',
    'C6', 'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5',
    'C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4',
    'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3',
    'C3', 'B2', 'A#2', 'A2', 'G#2', 'G2', 'F#2', 'F2', 'E2', 'D#2', 'D2', 'C#2',
    'C2', 'B1', 'A#1', 'A1'
  ];

  const noteIndex = useRef(new Map(allNotes.map((note, index) => [note, index])));

  const isSharpNote = (note: string) => {
    return note.includes('#');
  };

  const handleTouchStart = (e: React.TouchEvent, note: Note) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDraggedNote(note);
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });

    // Enhanced haptic feedback for note interaction
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDraggedNote(note);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Haptic feedback for desktop interaction
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedNote || !gridRef.current) return;
    
    e.preventDefault();
    const gridRect = gridRef.current.getBoundingClientRect();
    
    const relativeX = e.clientX - gridRect.left - dragOffset.x;
    const relativeY = e.clientY - gridRect.top - dragOffset.y;
    
    // Calculate new position
    const timePerPixel = 1 / (40 * zoom / 100); // Adjust based on zoom
    const newStart = Math.max(0, relativeX * timePerPixel);
    const noteHeight = 100 / allNotes.length;
    const noteIndex = Math.floor(relativeY / (gridRect.height * noteHeight / 100));
    const newNote = allNotes[noteIndex];
    
    if (newNote && onNoteMove) {
      onNoteMove(draggedNote.id, newStart, newNote);
    }
  };

  const handlePointerUp = () => {
    if (draggedNote) {
      // Success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
    setDraggedNote(null);
    setResizingNote(null);
    setDragOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (draggedNote || resizingNote) {
      document.addEventListener('pointermove', handlePointerMove as any);
      document.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove as any);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [draggedNote, resizingNote]);

  const gridWidth = 2000 * (zoom / 100); // Scalable grid width
  const noteHeight = 100 / allNotes.length;
  const pixelsPerSecond = 40 * (zoom / 100);

  return (
    <div className="h-full">
      <Card className="h-full">
        <CardContent className="p-0 h-full relative overflow-hidden flex">
          
          {/* Piano Keys Sidebar */}
          <div className="w-20 h-full border-r border-border/50 bg-card/80 backdrop-blur-sm flex-shrink-0 z-20">
            <div className="flex flex-col-reverse h-full">
              {allNotes.map((note, index) => (
                <motion.div 
                  key={note} 
                  className={`flex items-center justify-center border-b border-border/20 cursor-pointer transition-all duration-200 ${
                    isSharpNote(note) 
                      ? 'bg-slate-800 text-white/70 border-r-4 border-r-border/80 hover:bg-slate-700' 
                      : 'bg-card hover:bg-accent text-foreground/80'
                  }`}
                  style={{ height: `${noteHeight}%` }}
                  whileHover={{ scale: 1.02, backgroundColor: isSharpNote(note) ? 'rgb(51, 65, 85)' : 'rgb(248, 250, 252)' }}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(3);
                    // Play note preview here
                  }}
                >
                  <span className="text-xs font-mono select-none">
                    {note}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Main Grid Area */}
          <div className="flex-1 overflow-auto relative" ref={gridRef}>
            <div 
              className="relative bg-gradient-to-br from-muted/20 to-muted/10"
              style={{ 
                width: `${gridWidth}px`, 
                height: '100%',
                minHeight: `${allNotes.length * 20}px`
              }}
            >
              {/* Vertical Grid Lines (Time) */}
              {Array.from({ length: Math.ceil(gridWidth / (pixelsPerSecond / 4)) }).map((_, i) => {
                const isBarLine = i % 16 === 0; // Every 4 beats
                const isBeatLine = i % 4 === 0; // Every beat
                
                return (
                  <div
                    key={`v-${i}`}
                    className={`absolute top-0 bottom-0 border-r ${
                      isBarLine 
                        ? 'border-primary/40 z-10' 
                        : isBeatLine 
                        ? 'border-primary/20' 
                        : 'border-border/30'
                    }`}
                    style={{ left: `${i * (pixelsPerSecond / 4)}px` }}
                  />
                );
              })}

              {/* Horizontal Grid Lines (Notes) */}
              <div className="absolute inset-0 flex flex-col">
                {allNotes.map((note, i) => (
                  <div 
                    key={`h-${i}`} 
                    className={`flex-1 border-b border-border/20 ${
                      isSharpNote(note) ? 'bg-slate-950/10 dark:bg-slate-800/20' : 'bg-transparent'
                    }`}
                    style={{ height: `${noteHeight}%` }}
                  />
                ))}
              </div>
              
              {/* Notes */}
              <div className="absolute inset-0 z-10">
                <AnimatePresence>
                  {notes.map((note) => {
                    const noteIdx = noteIndex.current.get(note.note);
                    if (noteIdx === undefined) return null;
                    
                    const isDragging = draggedNote?.id === note.id;
                    const isResizing = resizingNote?.id === note.id;
                    
                    const top = noteIdx * noteHeight;
                    const left = note.startTime * pixelsPerSecond;
                    const width = Math.max(8, note.duration * pixelsPerSecond);
                    const height = noteHeight;

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: isDragging ? 1.05 : 1, 
                          opacity: note.velocity / 127,
                          zIndex: isDragging ? 100 : 1
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.02, opacity: 1 }}
                        className={`absolute rounded-sm cursor-move select-none touch-manipulation group ${
                          isDragging ? 'shadow-2xl ring-2 ring-primary/50' : 'hover:shadow-lg'
                        } transition-all duration-200`}
                        style={{
                          top: `${top}%`,
                          left: `${left}px`,
                          width: `${width}px`,
                          height: `${height}%`,
                          backgroundColor: note.color,
                          minWidth: window.innerWidth < 768 ? '16px' : '8px' // Touch-friendly minimum
                        }}
                        onPointerDown={(e) => handleMouseDown(e as any, note)}
                        onTouchStart={(e) => handleTouchStart(e, note)}
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(3);
                          onNoteClick?.(note);
                        }}
                      >
                        {/* Note Content */}
                        <div className="h-full w-full flex items-center justify-start px-1">
                          <span className="text-xs text-white/90 font-mono truncate">
                            {note.note}
                          </span>
                        </div>
                        
                        {/* Resize Handle */}
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/30 transition-opacity"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setResizingNote(note);
                            if (navigator.vibrate) navigator.vibrate(5);
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Enhanced Playhead */}
              <motion.div
                className="absolute top-0 bottom-0 bg-gradient-to-b from-yellow-400 to-orange-500 shadow-lg z-50 pointer-events-none"
                style={{ 
                  left: `${currentTime * pixelsPerSecond}px`,
                  width: window.innerWidth < 768 ? '3px' : '2px'
                }}
                animate={isPlaying ? { 
                  boxShadow: [
                    "0 0 5px rgba(250, 204, 21, 0.5)", 
                    "0 0 20px rgba(250, 204, 21, 0.8)", 
                    "0 0 5px rgba(250, 204, 21, 0.5)"
                  ]
                } : {}}
                transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
              >
                <motion.div 
                  className="bg-yellow-400 rounded-full -ml-1 -mt-2 pointer-events-none"
                  style={{
                    width: window.innerWidth < 768 ? '20px' : '16px',
                    height: window.innerWidth < 768 ? '20px' : '16px'
                  }}
                  animate={isPlaying ? { 
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(250, 204, 21, 0.7)",
                      "0 0 0 10px rgba(250, 204, 21, 0)",
                      "0 0 0 0 rgba(250, 204, 21, 0)"
                    ]
                  } : { scale: 1 }}
                  transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
                />
              </motion.div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}