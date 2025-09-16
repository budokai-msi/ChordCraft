import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Note {
  note: string;
  start: number;
  duration: number;
  velocity: number;
}

interface TouchOptimizedPianoRollProps {
  notes: Note[];
  pianoNotes: string[];
  timeMarkers: number[];
  zoom: number;
  isPlaying: boolean;
  currentTime: number;
  onNoteClick?: (note: Note) => void;
  onNoteMove?: (noteId: string, newStart: number, newNote: string) => void;
}

export function TouchOptimizedPianoRoll({
  notes,
  pianoNotes,
  timeMarkers,
  zoom,
  isPlaying,
  currentTime,
  onNoteClick,
  onNoteMove
}: TouchOptimizedPianoRollProps) {
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent, note: Note) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDraggedNote(note);
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });

    // Enhanced haptic feedback for touch interaction
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedNote || !gridRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const gridRect = gridRef.current.getBoundingClientRect();
    
    const relativeX = touch.clientX - gridRect.left - dragOffset.x;
    const relativeY = touch.clientY - gridRect.top - dragOffset.y;
    
    // Calculate new position
    const newStart = Math.max(0, (relativeX / (zoom * 8)) * 8);
    const noteIndex = Math.floor(relativeY / 16);
    const newNote = pianoNotes[noteIndex];
    
    if (newNote && onNoteMove) {
      onNoteMove(draggedNote.note, newStart, newNote);
    }
  };

  const handleTouchEnd = () => {
    if (draggedNote) {
      // Success haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
    setDraggedNote(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={gridRef}
      className="flex-1 overflow-auto relative touch-pan-y"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50"
        style={{ 
          width: `${zoom * 8}px`, 
          height: `${pianoNotes.length * 16}px` 
        }}
      >
        {/* Vertical Grid Lines */}
        {timeMarkers.map((time, index) => (
          <div
            key={`v-${index}`}
            className={`absolute top-0 bottom-0 ${
              index % 4 === 0 ? 'border-purple-600/30' : 'border-purple-800/20'
            } border-r`}
            style={{ left: `${(time / 8) * zoom * 8}px` }}
          />
        ))}

        {/* Horizontal Grid Lines */}
        {pianoNotes.map((note, index) => (
          <div
            key={`h-${index}`}
            className={`absolute left-0 right-0 border-b ${
              note.includes('#') 
                ? 'border-purple-800/20' 
                : 'border-purple-700/30'
            }`}
            style={{ top: `${index * 16}px` }}
          />
        ))}

        {/* Notes */}
        {notes.map((note, index) => {
          const noteIndex = pianoNotes.indexOf(note.note);
          if (noteIndex === -1) return null;
          
          const isDragging = draggedNote?.note === note.note;
          
          return (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isDragging ? 1.1 : 1, 
                opacity: note.velocity / 100,
                zIndex: isDragging ? 10 : 1
              }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              className={`absolute bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm border border-purple-400/50 cursor-pointer touch-manipulation select-none ${
                isDragging ? 'shadow-2xl shadow-purple-500/50' : 'hover:from-purple-400 hover:to-pink-400'
              } transition-all duration-200 hover:shadow-lg`}
              style={{
                left: `${(note.start / 8) * zoom * 8}px`,
                top: `${noteIndex * 16 + 2}px`,
                width: `${Math.max(8, (note.duration / 8) * zoom * 8)}px`, // Minimum touch target size
                height: '12px',
                minWidth: '24px' // Ensure touch-friendly size on mobile
              }}
              onTouchStart={(e) => handleTouchStart(e, note)}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                onNoteClick?.(note);
              }}
            />
          );
        })}

        {/* Enhanced Playhead with touch-friendly design */}
        <motion.div
          className="absolute top-0 bottom-0 bg-gradient-to-b from-yellow-400 to-orange-400 shadow-lg z-20 touch-none"
          style={{ 
            left: `${(currentTime / 8) * zoom * 8}px`,
            width: window.innerWidth < 768 ? '3px' : '2px' // Thicker on mobile
          }}
          animate={isPlaying ? { 
            boxShadow: ["0 0 5px rgba(250, 204, 21, 0.5)", "0 0 15px rgba(250, 204, 21, 0.8)", "0 0 5px rgba(250, 204, 21, 0.5)"]
          } : {}}
          transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
        >
          <motion.div 
            className="bg-yellow-400 rounded-full -ml-1 -mt-1.5 touch-none"
            style={{
              width: window.innerWidth < 768 ? '16px' : '12px', // Larger touch target on mobile
              height: window.innerWidth < 768 ? '16px' : '12px'
            }}
            animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
          />
        </motion.div>
      </div>
    </div>
  );
}