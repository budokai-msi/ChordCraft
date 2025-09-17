import { create } from "zustand";
import type { ChordCraftSong } from "../utils/ChordCraftDecoder";

export type Integrity = "unknown" | "verifying" | "ok" | "mismatch";
export type Strategy = "lossless" | "neural" | "synthetic";

type State = {
  code: string | null;
  song: ChordCraftSong | null;
  integrity: Integrity;
  strategy: Strategy | null;
  backendUrl: string;
  nativeFirst: boolean;         // try decodeAudioData first
  ffmpegLoaded: boolean;
};

type Actions = {
  setCode: (code: string | null) => void;
  setSong: (song: ChordCraftSong | null) => void;
  setIntegrity: (s: Integrity) => void;
  setStrategy: (s: Strategy | null) => void;
  setBackendUrl: (url: string) => void;
  setNativeFirst: (v: boolean) => void;
  setFfmpegLoaded: (v: boolean) => void;
  reset: () => void;
};

export const useChordCraftStore = create<State & Actions>((set) => ({
  code: null,
  song: null,
  integrity: "unknown",
  strategy: null,
  backendUrl: (import.meta as any).env?.VITE_BACKEND_URL || "http://127.0.0.1:5000",
  nativeFirst: true,
  ffmpegLoaded: false,
  setCode: (code) => set({ code }),
  setSong: (song) => set({ song }),
  setIntegrity: (integrity) => set({ integrity }),
  setStrategy: (strategy) => set({ strategy }),
  setBackendUrl: (backendUrl) => set({ backendUrl }),
  setNativeFirst: (nativeFirst) => set({ nativeFirst }),
  setFfmpegLoaded: (ffmpegLoaded) => set({ ffmpegLoaded }),
  reset: () =>
    set({
      code: null,
      song: null,
      integrity: "unknown",
      strategy: null,
    }),
}));
