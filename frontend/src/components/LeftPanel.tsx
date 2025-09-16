import { useState } from "react";
import { Upload, Music, Volume2, VolumeX, Play, Pause, Plus } from "lucide-react";
import { HapticButton } from "./HapticButton";
import { HapticSlider } from "./HapticSlider";
import { SimpleFileUpload } from "./SimpleFileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Track {
  id: string;
  name: string;
  type: "audio" | "midi";
  duration: string;
  volume: number;
  muted: boolean;
  solo: boolean;
}

interface LeftPanelProps {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export function LeftPanel({ currentTrack, setCurrentTrack, isPlaying, setIsPlaying }: LeftPanelProps) {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "1",
      name: "Piano Melody",
      type: "midi",
      duration: "2:34",
      volume: 80,
      muted: false,
      solo: false
    },
    {
      id: "2", 
      name: "Bass Line",
      type: "audio",
      duration: "2:34",
      volume: 65,
      muted: false,
      solo: false
    },
    {
      id: "3",
      name: "Drum Pattern",
      type: "midi", 
      duration: "2:34",
      volume: 90,
      muted: true,
      solo: false
    }
  ]);

  const handleFileUpload = (result: any) => {
    const newTrack = {
      id: Date.now().toString(),
      name: result.fileName.replace(/\.[^/.]+$/, ""),
      type: "audio" as const,
      duration: "0:00",
      volume: 80,
      muted: false,
      solo: false
    };
    setTracks([...tracks, newTrack]);
    
    // Success haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  };

  const toggleMute = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const updateVolume = (trackId: string, volume: number) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  return (
    <div className="w-80 border-r border-purple-800/30 bg-black/10 backdrop-blur-sm flex flex-col">
      {/* Audio Upload Section */}
      <Card className="m-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-400" />
            Audio Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SimpleFileUpload onUpload={handleFileUpload} />
          <HapticButton 
            variant="outline" 
            hapticType="medium"
            className="w-full bg-pink-600/20 border-pink-500/30 hover:bg-pink-600/30 hover:scale-[1.02] transition-all"
          >
            <Music className="w-4 h-4 mr-2" />
            Record New Track
          </HapticButton>
        </CardContent>
      </Card>

      {/* Track List */}
      <div className="flex-1 mx-4 mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-purple-200">Tracks</h3>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
            {tracks.length} tracks
          </Badge>
        </div>
        
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-2">
            <AnimatePresence>
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30 cursor-pointer transition-all hover:from-slate-700/50 hover:to-slate-600/50 hover:scale-[1.02] hover:shadow-lg ${
                      currentTrack?.id === track.id ? 'ring-2 ring-purple-400 shadow-purple-400/20' : ''
                    }`}
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(5);
                      setCurrentTrack(track);
                    }}
                  >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-white">{track.name}</h4>
                      <p className="text-xs text-slate-400">
                        {track.type} • {track.duration}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <HapticButton
                        size="sm"
                        variant="ghost"
                        hapticType="selection"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(track.id);
                        }}
                        className={`w-6 h-6 p-0 transition-all hover:scale-110 ${
                          track.muted ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <motion.div
                          animate={track.muted ? { rotate: [0, -10, 10, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </motion.div>
                      </HapticButton>
                      <HapticButton
                        size="sm"
                        variant="ghost"
                        hapticType="selection"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolo(track.id);
                        }}
                        className={`w-6 h-6 p-0 text-xs transition-all hover:scale-110 ${
                          track.solo ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <motion.span
                          animate={track.solo ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          S
                        </motion.span>
                      </HapticButton>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    <HapticSlider
                      value={[track.volume]}
                      onValueChange={(value) => updateVolume(track.id, value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <motion.span 
                      className="text-xs text-slate-400 w-8 font-mono"
                      key={track.volume}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      {track.volume}
                    </motion.span>
                  </div>
                </CardContent>
              </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}