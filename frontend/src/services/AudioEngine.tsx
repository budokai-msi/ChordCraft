"use client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

interface AudioEngineContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  loadAudio: (audioUrl: string) => void;
  seekTo: (time: number) => void;
}

const AudioEngineContext = createContext<AudioEngineContextType | undefined>(
  undefined
);

export function AudioEngineProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafId = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  // ---- helpers ----
  const startRaf = useCallback(() => {
    if (rafId.current != null) return;
    const loop = () => {
      const a = audioRef.current;
      if (a) setCurrentTime(a.currentTime || 0);
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // ---- init element (browser only) ----
  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    a.crossOrigin = "anonymous"; // safer for remote files / analyzers
    a.volume = volume;

    const handleLoadedMeta = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const handleDurationChange = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      stopRaf();
    };
    const handlePlay = () => {
      setIsPlaying(true);
      startRaf();
    };
    const handlePause = () => {
      setIsPlaying(false);
      stopRaf();
      setCurrentTime(a.currentTime || 0);
    };
    const handleError = () => {
      // Fail quietly for now; consumers can add their own UI if needed.
      console.error("Audio error", a.error);
      setIsPlaying(false);
      stopRaf();
    };

    a.addEventListener("loadedmetadata", handleLoadedMeta);
    a.addEventListener("durationchange", handleDurationChange);
    a.addEventListener("ended", handleEnded);
    a.addEventListener("play", handlePlay);
    a.addEventListener("pause", handlePause);
    a.addEventListener("error", handleError);

    audioRef.current = a;

    return () => {
      // cleanup (React 18 StrictMode safe)
      a.pause();
      stopRaf();
      a.src = ""; // release resource
      a.load();

      a.removeEventListener("loadedmetadata", handleLoadedMeta);
      a.removeEventListener("durationchange", handleDurationChange);
      a.removeEventListener("ended", handleEnded);
      a.removeEventListener("play", handlePlay);
      a.removeEventListener("pause", handlePause);
      a.removeEventListener("error", handleError);

      audioRef.current = null;
    };
  }, [startRaf, stopRaf, volume]);

  // ---- controls ----
  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a
      .play()
      .then(() => {
        // isPlaying will be set by 'play' event
      })
      .catch((err) => {
        // Autoplay policy or quick toggle race; keep state consistent.
        console.warn("play() rejected:", err?.message || err);
        setIsPlaying(false);
      });
  }, []);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    // 'pause' event will handle state/rAF
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    stopRaf();
  }, [stopRaf]);

  const setVolumeLevel = useCallback((newVolume: number) => {
    const v = Math.min(1, Math.max(0, newVolume));
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const loadAudio = useCallback((audioUrl: string) => {
    const a = audioRef.current;
    if (!a) return;

    // Reset state before loading new source
    stopRaf();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Assign source & load
    a.src = audioUrl;
    // calling load() ensures 'loadedmetadata' fires reliably
    a.load();
  }, [stopRaf]);

  const seekTo = useCallback((time: number) => {
    const a = audioRef.current;
    if (!a) return;
    const d = Number.isFinite(a.duration) ? a.duration : 0;
    // allow seeking even if metadata isn't ready; clamp if known
    const t = d > 0 ? Math.min(Math.max(time, 0), d) : Math.max(time, 0);
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const value = useMemo(
    () => ({
      isPlaying,
      currentTime,
      duration,
      volume,
      play,
      pause,
      stop,
      setVolume: setVolumeLevel,
      loadAudio,
      seekTo,
    }),
    [isPlaying, currentTime, duration, volume, play, pause, stop, setVolumeLevel, loadAudio, seekTo]
  );

  return (
    <AudioEngineContext.Provider value={value}>
      {children}
    </AudioEngineContext.Provider>
  );
}

export function useAudioEngine() {
  const context = useContext(AudioEngineContext);
  if (context === undefined) {
    throw new Error("useAudioEngine must be used within an AudioEngineProvider");
  }
  return context;
}