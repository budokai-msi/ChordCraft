import { create } from 'zustand';

export const usePlaybackStore = create((set, get) => ({
  // Playback State
  isPlaying: false,
  isRecording: false,
  currentTime: 0,
  tempo: 120,
  isPaused: false,
  
  // Audio Context State
  audioContext: null,
  isAudioInitialized: false,
  
  // Actions
  play: () => set({ isPlaying: true, isPaused: false }),
  pause: () => set({ isPlaying: false, isPaused: true }),
  stop: () => set({ isPlaying: false, isPaused: false, currentTime: 0 }),
  seek: (time) => set({ currentTime: time }),
  setTempo: (newTempo) => set({ tempo: Math.max(60, Math.min(200, newTempo)) }),
  
  // Recording
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  
  // Audio Context Management
  setAudioContext: (context) => set({ audioContext: context }),
  setAudioInitialized: (initialized) => set({ isAudioInitialized: initialized }),
  
  // Time Management
  updateCurrentTime: (time) => set({ currentTime: time }),
  
  // Playback Control
  togglePlayPause: () => {
    const { isPlaying, isPaused } = get();
    if (isPlaying) {
      get().pause();
    } else if (isPaused) {
      get().play();
    } else {
      get().play();
    }
  },
  
  // Reset all playback state
  reset: () => set({
    isPlaying: false,
    isRecording: false,
    currentTime: 0,
    isPaused: false
  })
}));
