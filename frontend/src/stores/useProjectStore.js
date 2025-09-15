import { create } from 'zustand';
import { parseChordCraftCode, generateChordCraftCode } from '../chordcraftUtils';

export const useProjectStore = create((set, get) => ({
  // Project Data
  projectTitle: 'Untitled Project',
  chordCraftCode: '// Your music code will appear here\n// Try: PLAY C4 FOR 1s AT 0s',
  notes: [],
  tracks: [
    {
      id: 'synth-track',
      name: 'Melody Synth',
      type: 'synthesizer',
      color: '#3b82f6',
      volume: 0.8,
      muted: false,
      solo: false
    }
  ],
  musicAnalysis: null,
  selectedTrack: 'synth-track',
  
  // UI State
  selectedNote: null,
  viewMode: 'timeline', // 'timeline' or 'piano_roll'
  zoomLevel: 1.0,
  snapToGrid: true,
  gridResolution: 16, // 16th notes
  
  // Actions
  setProjectTitle: (title) => set({ projectTitle: title }),
  setMusicAnalysis: (analysis) => set({ musicAnalysis: analysis }),
  setSelectedTrack: (trackId) => set({ selectedTrack: trackId }),
  setSelectedNote: (noteId) => set({ selectedNote: noteId }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),
  setGridResolution: (resolution) => set({ gridResolution: resolution }),

  // Two-way sync actions
  updateCode: (newCode) => set({
    chordCraftCode: newCode,
    notes: parseChordCraftCode(newCode)
  }),
  
  updateNotes: (newNotes) => set({
    notes: newNotes,
    chordCraftCode: generateChordCraftCode(newNotes)
  }),
  
  // Note CRUD
  addNote: (note) => {
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pitch: 'C4',
      startTime: 0,
      duration: 1,
      velocity: 0.8,
      trackId: get().selectedTrack,
      ...note
    };
    get().updateNotes([...get().notes, newNote]);
  },
  
  updateNote: (noteId, updates) => {
    const newNotes = get().notes.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    );
    get().updateNotes(newNotes);
  },
  
  deleteNote: (noteId) => {
    const newNotes = get().notes.filter(note => note.id !== noteId);
    get().updateNotes(newNotes);
  },
  
  // Track CRUD
  addTrack: (track) => {
    const newTrack = {
      id: `track-${Date.now()}`,
      name: track.name || 'New Track',
      type: track.type || 'synthesizer',
      color: track.color || `hsl(${Math.random() * 360}, 70%, 50%)`,
      volume: track.volume || 0.8,
      muted: false,
      solo: false,
      ...track
    };
    set({ tracks: [...get().tracks, newTrack] });
  },
  
  updateTrack: (trackId, updates) => {
    const newTracks = get().tracks.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    );
    set({ tracks: newTracks });
  },
  
  deleteTrack: (trackId) => {
    const newTracks = get().tracks.filter(track => track.id !== trackId);
    set({ tracks: newTracks });
    // Remove notes from deleted track
    const newNotes = get().notes.filter(note => note.trackId !== trackId);
    get().updateNotes(newNotes);
  },
  
  // Bulk operations
  duplicateNote: (noteId, offset = 1) => {
    const note = get().notes.find(n => n.id === noteId);
    if (note) {
      get().addNote({
        ...note,
        startTime: note.startTime + offset
      });
    }
  },
  
  quantizeNotes: (resolution, tempo = 120) => {
    const { snapToGrid } = get();
    if (!snapToGrid) return;
    
    const newNotes = get().notes.map(note => ({
      ...note,
      startTime: snapToGrid(note.startTime, resolution, tempo)
    }));
    get().updateNotes(newNotes);
  },
  
  transposeNotes: (semitones) => {
    const newNotes = get().notes.map(note => {
      const midi = noteToMidi(note.pitch);
      const newMidi = midi + semitones;
      const newPitch = midiToNote(newMidi);
      return { ...note, pitch: newPitch };
    });
    get().updateNotes(newNotes);
  }
}));

// Helper functions for note manipulation
const noteToMidi = (note) => {
  const noteMap = { 
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 
  };
  
  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return 60;
  
  const [, pitch, octave] = match;
  const pitchValue = noteMap[pitch] || 0;
  const octaveValue = parseInt(octave, 10);
  
  return pitchValue + (octaveValue + 1) * 12;
};

const midiToNote = (midi) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
};

const snapToGrid = (time, resolution, tempo = 120) => {
  const beatDuration = 60 / tempo;
  const gridDuration = beatDuration / resolution;
  return Math.round(time / gridDuration) * gridDuration;
};
