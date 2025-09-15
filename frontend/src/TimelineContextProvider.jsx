import React, { createContext, useReducer } from 'react';
import { TIMELINE_ACTIONS } from './timelineConstants';

// Timeline State Structure
const initialState = {
  // Code blocks array - each block represents a section of the song
  blocks: [
    {
      id: 'intro-1',
      type: 'intro',
      name: 'INTRO, MUFFLED BASS +',
      code: '// Intro section\nPLAY C2 FOR 2.0s AT 0.0s\nPLAY E2 FOR 2.0s AT 2.0s\nPLAY G2 FOR 2.0s AT 4.0s',
      duration: 15.0,
      color: '#10B981',
      waveform: null,
      isSelected: false,
      isPlaying: false,
      startTime: 0.0
    },
    {
      id: 'verse-1',
      type: 'verse',
      name: 'VERSE 1 - STATIC PRESSURE',
      code: '// Verse section\nPLAY C4 FOR 0.5s AT 0.0s\nPLAY D4 FOR 0.5s AT 0.5s\nPLAY E4 FOR 0.5s AT 1.0s\nPLAY F4 FOR 0.5s AT 1.5s',
      duration: 30.0,
      color: '#EC4899',
      waveform: null,
      isSelected: false,
      isPlaying: false,
      startTime: 15.0
    },
    {
      id: 'verse-2',
      type: 'verse',
      name: 'VERSE 2 - BLACKOUT ENERGY',
      code: '// Verse 2 section\nPLAY A3 FOR 0.25s AT 0.0s\nPLAY C4 FOR 0.25s AT 0.25s\nPLAY E4 FOR 0.25s AT 0.5s\nPLAY A4 FOR 0.5s AT 0.75s',
      duration: 30.0,
      color: '#8B5CF6',
      waveform: null,
      isSelected: false,
      isPlaying: false,
      startTime: 45.0
    },
    {
      id: 'outro-1',
      type: 'outro',
      name: 'OUTRO - FOCUS',
      code: '// Outro section\nPLAY G2 FOR 2.0s AT 0.0s\nPLAY C3 FOR 2.0s AT 2.0s\nPLAY G3 FOR 2.0s AT 4.0s',
      duration: 15.0,
      color: '#F59E0B',
      waveform: null,
      isSelected: false,
      isPlaying: false,
      startTime: 75.0
    }
  ],
  
  // Timeline settings
  timeline: {
    zoom: 1.0,
    scrollPosition: 0,
    bpm: 140,
    timeSignature: '4/4',
    totalDuration: 90.0
  },
  
  // Playback state
  isPlaying: false,
  currentTime: 0.0,
  
  // Lyrics and style
  lyrics: {
    sections: [
      { id: 'intro', title: 'Intro', content: '[Intro, Muffled Bass + Silencer Click]\nBradenton, Bay Dr...\n941 - not safe\nYou talkin\'? Then I\'m walkin.' },
      { id: 'verse-1', title: 'Verse 1', content: 'I\'m a drilla - not for play\nShe text bold, I text decay\nStill hit her phone just to ruin her day\nJust to show she a mark that\'ll never escape\nI don\'t move for the clout - I move for the kill\nYou post for likes - I post on the real\nBay Dr silent, I walk with the night\nAddie in blood, got my focus right' },
      { id: 'verse-2', title: 'Verse 2', content: 'Blackout energy, no emotions\nJust order, just focus\nDrill music, no chorus\nDeath talk, no remorse' }
    ]
  },
  style: {
    prompt: 'Style: Dark Florida Drill, no chorus, full-pressure stream of bars, dead-eyed energy, no emotions, just order',
    genre: 'drill',
    mood: 'dark',
    instruments: ['bass', 'drums', 'synth']
  }
};

// Reducer function
function timelineReducer(state, action) {
  switch (action.type) {
    case TIMELINE_ACTIONS.ADD_BLOCK: {
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
    }

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

    case TIMELINE_ACTIONS.MOVE_BLOCK: {
      const { blockId, newStartTime } = action;
      return {
        ...state,
        blocks: state.blocks.map(block =>
          block.id === blockId
            ? { ...block, startTime: newStartTime }
            : block
        )
      };
    }

    case TIMELINE_ACTIONS.RESIZE_BLOCK: {
      const { blockId: resizeBlockId, newDuration } = action;
      return {
        ...state,
        blocks: state.blocks.map(block =>
          block.id === resizeBlockId
            ? { ...block, duration: newDuration }
            : block
        )
      };
    }

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
        isPlaying: true
      };

    case TIMELINE_ACTIONS.PAUSE:
      return {
        ...state,
        isPlaying: false
      };

    case TIMELINE_ACTIONS.STOP:
      return {
        ...state,
        isPlaying: false,
        currentTime: 0
      };

    case TIMELINE_ACTIONS.SEEK:
      return {
        ...state,
        currentTime: action.time
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
        blocks: action.projectData.blocks || state.blocks,
        timeline: { ...state.timeline, ...action.projectData.timeline },
        lyrics: { ...state.lyrics, ...action.projectData.lyrics },
        style: { ...state.style, ...action.projectData.style }
      };

    default:
      return state;
  }
}

// Context creation
export const TimelineContext = createContext();

// Provider component
export function TimelineProvider({ children }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  const value = {
    // State
    ...state,
    
    // Actions
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
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}
