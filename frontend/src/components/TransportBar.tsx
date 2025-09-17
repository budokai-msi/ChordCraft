import React from "react";
import { useAudioEngine } from "../services/AudioEngine";

function fmt(t: number) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TransportBar() {
  const { isPlaying, currentTime, smoothTime, duration, volume, play, pause, stop, seekTo, setVolume } = useAudioEngine();

  // Space = toggle, arrows = seek
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.code === "Space") { e.preventDefault(); isPlaying ? pause() : play(); }
      if (e.code === "ArrowLeft") { seekTo(Math.max(0, currentTime - 5)); }
      if (e.code === "ArrowRight") { seekTo(Math.min(duration, currentTime + 5)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying, currentTime, duration, play, pause, seekTo]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    seekTo(v);
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="w-full rounded-xl border p-3 flex flex-col gap-3 bg-white">
      <div className="flex items-center gap-2">
        <button
          onClick={() => isPlaying ? pause() : play()}
          className="rounded-lg px-3 py-2 bg-black text-white"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={stop} className="rounded-lg px-3 py-2 bg-gray-200" aria-label="Stop">■ Stop</button>
        <div className="ml-auto text-sm tabular-nums">
          {fmt(currentTime)} / {fmt(duration)}
        </div>
      </div>

      <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={Number.isFinite(duration) ? duration : 0}
                  step={0.01}
                  value={Number.isFinite(smoothTime) ? smoothTime : 0}
                  onChange={onSeek}
                  className="w-full"
                  aria-label="Seek"
                />
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-60">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={onVolume}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
