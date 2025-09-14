import React, { createContext, useContext, useReducer } from 'react';

// Timeline State Structure
const initialState = {
  // Code blocks array - each block represents a section of the song
  blocks: [
    {
      id: 'intro-1',
      type: 'intro',
      title: 'Intro',
      code: '// Intro section\nPLAY C4 FOR 1.0s AT 0.0s\nPLAY E4 FOR 1.0s AT 1.0s\nPLAY G4 FOR 1.0s AT 2.0s',
      duration: 3.0,
      color: '#7c3aed',
      waveform: null, // Will store waveform data
      isSelected: false,
      isPlaying: false,
      startTime: 0.0
    },
    {
      id: 'verse-1',
      type: 'verse',
      title: 'Verse 1',
      code: '// Verse section\nPLAY C4 FOR 0.5s AT 0.0s\nPLAY D4 FOR 0.5s AT 0.5s\nPLAY E4 FOR 0.5s AT 1.0s\nPLAY F4 FOR 0.5s AT 1.5s',
      duration: 2.0,
      color: '#059669',
      waveform: null,
      isSelected: false,
      isPlaying: false,
      startTime: 3.0
    }
  ],
  
  // Timeline settings
  timeline: {
    zoom: 1.0,
    scrollPosition: 0,
    totalDuration: 5.0,
    bpm: 120,
    timeSignature: '4/4'
  },
  
  // Currently selected block
  selectedBlockId: null,
  
  // Playback state
  playback: {
    isPlaying: false,
    currentTime: 0,
    playheadPosition: 0
  },
  
  // Lyrics and style input
  lyrics: {
    sections: [
      { id: 'intro', title: 'Intro', content: '' },
      { id: 'verse-1', title: 'Verse 1', content: '' },
      { id: 'chorus-1', title: 'Chorus 1', content: '' }
    ]
  },
  
  style: {
    prompt: '',
    genre: 'pop',
    mood: 'upbeat',
    instruments: ['piano', 'guitar', 'drums']
  }
};

// Action Types
const TIMELINE_ACTIONS = {
  // Block management
  ADD_BLOCK: 'ADD_BLOCK',
  UPDATE_BLOCK: 'UPDATE_BLOCK',
  DELETE_BLOCK: 'DELETE_BLOCK',
  SELECT_BLOCK: 'SELECT_BLOCK',
  DUPLICATE_BLOCK: 'DUPLICATE_BLOCK',
  
  // Block arrangement
  MOVE_BLOCK: 'MOVE_BLOCK',
  RESIZE_BLOCK: 'RESIZE_BLOCK',
  SPLIT_BLOCK: 'SPLIT_BLOCK',
  MERGE_BLOCKS: 'MERGE_BLOCKS',
  
  // Timeline controls
  SET_ZOOM: 'SET_ZOOM',
  SET_SCROLL: 'SET_SCROLL',
  SET_BPM: 'SET_BPM',
  SET_TIME_SIGNATURE: 'SET_TIME_SIGNATURE',
  
  // Playback
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  STOP: 'STOP',
  SEEK: 'SEEK',
  
  // Lyrics and style
  UPDATE_LYRICS: 'UPDATE_LYRICS',
  UPDATE_STYLE: 'UPDATE_STYLE',
  
  // Import/Export
  LOAD_PROJECT: 'LOAD_PROJECT',
  SAVE_PROJECT: 'SAVE_PROJECT'
};

// Reducer function
function timelineReducer(state, action) {
  switch (action.type) {
    case TIMELINE_ACTIONS.ADD_BLOCK:
      const newBlock = {
        id: `block-${Date.now()}`,
        type: action.blockType || 'section',
        title: action.title || 'New Section',
        code: action.code || '// New section\nPLAY C4 FOR 1.0s AT 0.0s',
        duration: action.duration || 2.0,
        color: action.color || '#6366f1',
        waveform: null,
        isSelected: false,
        isPlaying: false,
        startTime: action.startTime || 0
      };
      return {
        ...state,
        blocks: [...state.blocks, newBlock]
      };

    case TIMELINE_ACTIONS.UPDATE_BLOCK:
      return {
        ...state,
        blocks: state.blocks.map(block =>
          block.id === action.blockId
            ? { ...block, ...action.updates }
            : block
        )
      };

    case TIMELINE_ACTIONS.DELETE_BLOCK:
      return {
        ...state,
        blocks: state.blocks.filter(block => block.id !== action.blockId),
        selectedBlockId: state.selectedBlockId === action.blockId ? null : state.selectedBlockId
      };

    case TIMELINE_ACTIONS.SELECT_BLOCK:
      return {
        ...state,
        blocks: state.blocks.map(block => ({
          ...block,
          isSelected: block.id === action.blockId
        })),
        selectedBlockId: action.blockId
      };

    case TIMELINE_ACTIONS.MOVE_BLOCK:
      const { blockId, newStartTime } = action;
      return {
        ...state,
        blocks: state.blocks.map(block =>
          block.id === blockId
            ? { ...block, startTime: newStartTime }
            : block
        )
      };

    case TIMELINE_ACTIONS.RESIZE_BLOCK:
      const { blockId: resizeBlockId, newDuration } = action;
      return {
        ...state,
        blocks: state.blocks.map(block =>
          block.id === resizeBlockId
            ? { ...block, duration: newDuration }
            : block
        )
      };

    case TIMELINE_ACTIONS.SET_ZOOM:
      return {
        ...state,
        timeline: { ...state.timeline, zoom: action.zoom }
      };

    case TIMELINE_ACTIONS.SET_SCROLL:
      return {
        ...state,
        timeline: { ...state.timeline, scrollPosition: action.scrollPosition }
      };

    case TIMELINE_ACTIONS.SET_BPM:
      return {
        ...state,
        timeline: { ...state.timeline, bpm: action.bpm }
      };

    case TIMELINE_ACTIONS.PLAY:
      return {
        ...state,
        playback: { ...state.playback, isPlaying: true }
      };

    case TIMELINE_ACTIONS.PAUSE:
      return {
        ...state,
        playback: { ...state.playback, isPlaying: false }
      };

    case TIMELINE_ACTIONS.STOP:
      return {
        ...state,
        playback: { ...state.playback, isPlaying: false, currentTime: 0, playheadPosition: 0 }
      };

    case TIMELINE_ACTIONS.SEEK:
      return {
        ...state,
        playback: { ...state.playback, currentTime: action.time, playheadPosition: action.time }
      };

    case TIMELINE_ACTIONS.UPDATE_LYRICS:
      return {
        ...state,
        lyrics: { ...state.lyrics, ...action.updates }
      };

    case TIMELINE_ACTIONS.UPDATE_STYLE:
      return {
        ...state,
        style: { ...state.style, ...action.updates }
      };

    case TIMELINE_ACTIONS.LOAD_PROJECT:
      return {
        ...state,
        ...action.projectData
      };

    default:
      return state;
  }
}

// Context creation
const TimelineContext = createContext();

// Provider component
export function TimelineProvider({ children }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  // Action creators
  const actions = {
    addBlock: (blockData) => dispatch({ type: TIMELINE_ACTIONS.ADD_BLOCK, ...blockData }),
    updateBlock: (blockId, updates) => dispatch({ type: TIMELINE_ACTIONS.UPDATE_BLOCK, blockId, updates }),
    deleteBlock: (blockId) => dispatch({ type: TIMELINE_ACTIONS.DELETE_BLOCK, blockId }),
    selectBlock: (blockId) => dispatch({ type: TIMELINE_ACTIONS.SELECT_BLOCK, blockId }),
    moveBlock: (blockId, newStartTime) => dispatch({ type: TIMELINE_ACTIONS.MOVE_BLOCK, blockId, newStartTime }),
    resizeBlock: (blockId, newDuration) => dispatch({ type: TIMELINE_ACTIONS.RESIZE_BLOCK, blockId, newDuration }),
    setZoom: (zoom) => dispatch({ type: TIMELINE_ACTIONS.SET_ZOOM, zoom }),
    setScroll: (scrollPosition) => dispatch({ type: TIMELINE_ACTIONS.SET_SCROLL, scrollPosition }),
    setBpm: (bpm) => dispatch({ type: TIMELINE_ACTIONS.SET_BPM, bpm }),
    play: () => dispatch({ type: TIMELINE_ACTIONS.PLAY }),
    pause: () => dispatch({ type: TIMELINE_ACTIONS.PAUSE }),
    stop: () => dispatch({ type: TIMELINE_ACTIONS.STOP }),
    seek: (time) => dispatch({ type: TIMELINE_ACTIONS.SEEK, time }),
    updateLyrics: (updates) => dispatch({ type: TIMELINE_ACTIONS.UPDATE_LYRICS, updates }),
    updateStyle: (updates) => dispatch({ type: TIMELINE_ACTIONS.UPDATE_STYLE, updates }),
    loadProject: (projectData) => dispatch({ type: TIMELINE_ACTIONS.LOAD_PROJECT, projectData })
  };

  return (
    <TimelineContext.Provider value={{ state, actions }}>
      {children}
    </TimelineContext.Provider>
  );
}

// Custom hook to use timeline context
export function useTimeline() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
}

export { TIMELINE_ACTIONS };
