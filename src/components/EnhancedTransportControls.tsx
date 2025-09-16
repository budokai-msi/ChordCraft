import { useState, useEffect } from "react";
import { Play, Pause, Square, SkipBack, SkipForward, Clock } from "lucide-react";
import { HapticButton } from "./HapticButton";
import { HapticSlider } from "./HapticSlider";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";

interface EnhancedTransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentTime: number;
  totalTime: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function EnhancedTransportControls({
  isPlaying,
  onPlayPause,
  onStop,
  onNext,
  onPrevious,
  currentTime,
  totalTime,
  zoom,
  onZoomChange
}: EnhancedTransportControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showBeatPulse, setShowBeatPulse] = useState(false);

  // Beat pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setShowBeatPulse(true);
        setTimeout(() => setShowBeatPulse(false), 100);
      }, 500); // 120 BPM = 500ms per beat
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Transport Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <HapticButton 
            size="sm" 
            variant="ghost" 
            hapticType="medium"
            onClick={onPrevious}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20"
          >
            <SkipBack className="w-4 h-4" />
          </HapticButton>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HapticButton 
              size="sm" 
              hapticType="heavy"
              onClick={onPlayPause}
              className={`relative overflow-hidden ${
                isPlaying 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? "pause" : "play"}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
              
              {/* Beat pulse effect */}
              <AnimatePresence>
                {showBeatPulse && isPlaying && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.1, 1] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  />
                )}
              </AnimatePresence>
            </HapticButton>
          </motion.div>
          
          <HapticButton 
            size="sm" 
            variant="ghost" 
            hapticType="medium"
            onClick={onStop}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20"
          >
            <Square className="w-4 h-4" />
          </HapticButton>
          
          <HapticButton 
            size="sm" 
            variant="ghost" 
            hapticType="medium"
            onClick={onNext}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/20"
          >
            <SkipForward className="w-4 h-4" />
          </HapticButton>
        </div>
        
        <motion.div 
          className="flex items-center gap-2"
          animate={isPlaying ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
          transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
        >
          <Clock className="w-4 h-4 text-purple-400" />
          <Badge variant="outline" className="bg-purple-900/50 text-purple-200 border-purple-600/30 font-mono">
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </Badge>
        </motion.div>
      </div>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
            <span className="text-sm text-red-400 font-medium">REC</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-200">Zoom:</span>
          <HapticSlider
            value={[zoom]}
            onValueChange={(value) => onZoomChange(value[0])}
            min={25}
            max={400}
            step={25}
            className="w-24"
          />
          <motion.span 
            className="text-sm text-purple-200 w-10 font-mono"
            key={zoom}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {zoom}%
          </motion.span>
        </div>
      </div>
    </div>
  );
}