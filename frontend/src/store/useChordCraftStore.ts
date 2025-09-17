import { create } from 'zustand';
import { ChordCraftSong } from '../utils/ChordCraftDecoder';

interface ChordCraftState {
  // Current song data
  code: string | null;
  song: ChordCraftSong | null;
  playbackStrategy: 'lossless' | 'neural' | 'synthetic';
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  
  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: number;
  
  // Integrity verification
  checksumStatus: {
    valid: boolean;
    hash: string;
    expected: string;
  } | null;
  
  // Settings
  settings: {
    backendUrl: string;
    useNativeFlac: boolean;
    loadFfmpegOnDemand: boolean;
  };
  
  // Actions
  setCode: (code: string) => void;
  setSong: (song: ChordCraftSong) => void;
  setPlaybackStrategy: (strategy: 'lossless' | 'neural' | 'synthetic') => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setChecksumStatus: (status: { valid: boolean; hash: string; expected: string } | null) => void;
  updateSettings: (settings: Partial<ChordCraftState['settings']>) => void;
  reset: () => void;
}

export const useChordCraftStore = create<ChordCraftState>((set, get) => ({
  // Initial state
  code: null,
  song: null,
  playbackStrategy: 'synthetic',
  isUploading: false,
  uploadProgress: 0,
  isAnalyzing: false,
  analysisProgress: 0,
  checksumStatus: null,
  settings: {
    backendUrl: (import.meta as any).env?.VITE_BACKEND_URL || 'http://127.0.0.1:5000',
    useNativeFlac: true,
    loadFfmpegOnDemand: true,
  },
  
  // Actions
  setCode: (code) => set({ code }),
  setSong: (song) => set({ song }),
  setPlaybackStrategy: (playbackStrategy) => set({ playbackStrategy }),
  setUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),
  setChecksumStatus: (checksumStatus) => set({ checksumStatus }),
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  reset: () => set({
    code: null,
    song: null,
    playbackStrategy: 'synthetic',
    isUploading: false,
    uploadProgress: 0,
    isAnalyzing: false,
    analysisProgress: 0,
    checksumStatus: null,
  }),
}));
