import React from "react";

interface WaveformVisualizerProps {
  peaks: { min: number[]; max: number[] } | null;
  duration: number;
  currentTime: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export function WaveformVisualizer({ 
  peaks, 
  duration, 
  currentTime, 
  onSeek, 
  className = "" 
}: WaveformVisualizerProps) {
  if (!peaks || duration <= 0) {
    return (
      <div className={`h-16 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-sm text-gray-500">No waveform data</span>
      </div>
    );
  }

  const { min, max } = peaks;
  const progress = duration > 0 ? currentTime / duration : 0;
  const progressIndex = Math.floor(progress * min.length);

  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    if (!onSeek || duration <= 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickProgress = x / rect.width;
    const newTime = clickProgress * duration;
    onSeek(Math.max(0, Math.min(duration, newTime)));
  };

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${min.length} 100`}
        className="w-full h-16 cursor-pointer"
        onClick={handleClick}
        preserveAspectRatio="none"
      >
        {/* Background */}
        <rect width="100%" height="100%" fill="#f8fafc" />
        
        {/* Waveform bars */}
        {min.map((minVal, i) => {
          const maxVal = max[i];
          const height = Math.max(1, (maxVal - minVal) * 50); // Scale to 0-50
          const y = 50 - (maxVal + minVal) * 25; // Center vertically
          const isPlayed = i <= progressIndex;
          
          return (
            <rect
              key={i}
              x={i}
              y={y}
              width="1"
              height={height}
              fill={isPlayed ? "#3b82f6" : "#cbd5e1"}
              className="transition-colors duration-75"
            />
          );
        })}
        
        {/* Progress line */}
        <line
          x1={progressIndex}
          y1="0"
          x2={progressIndex}
          y2="100"
          stroke="#1d4ed8"
          strokeWidth="1"
          opacity="0.8"
        />
      </svg>
      
      {/* Time labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
