import { useState } from "react";
import { Copy, Download, Play, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface CodeEditorProps {
  locked?: boolean;
}

export function CodeEditor({ locked = false }: CodeEditorProps) {
  const [code] = useState(`// ChordCraft Generated Music Code
const musicTrack = {
  title: "Piano Melody",
  tempo: 120,
  timeSignature: "4/4",
  key: "C Major",
  
  tracks: [
    {
      instrument: "piano",
      notes: [
        { note: "C4", time: 0, duration: 0.5, velocity: 80 },
        { note: "E4", time: 0.5, duration: 0.5, velocity: 75 },
        { note: "G4", time: 1.0, duration: 1.0, velocity: 85 },
        { note: "C5", time: 2.0, duration: 0.75, velocity: 90 }
      ]
    }
  ],
  
  chordProgression: [
    { chord: "C", time: 0, duration: 2 },
    { chord: "Am", time: 2, duration: 2 },
    { chord: "F", time: 4, duration: 2 },
    { chord: "G", time: 6, duration: 2 }
  ]
};

// Export as MIDI
export function generateMIDI() {
  return musicTrack.tracks.map(track => ({
    ...track,
    midiData: convertToMIDI(track.notes)
  }));
}

// Real-time playback
export function playTrack() {
  const audioContext = new AudioContext();
  musicTrack.tracks.forEach(track => {
    track.notes.forEach(note => {
      scheduleNote(audioContext, note);
    });
  });
}`);

  if (locked) {
    return (
      <Card className="h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-600/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-400 mb-2">PRO Feature</h3>
            <p className="text-sm text-yellow-200 mb-4 max-w-48">
              Unlock the code editor to view and modify AI-generated music code
            </p>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Upgrade to PRO
            </Button>
          </div>
        </div>
        
        {/* Blurred Preview */}
        <div className="blur-sm opacity-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-purple-200">Music Code</h3>
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                Generated
              </Badge>
            </div>
          </div>
          
          <pre className="text-xs text-purple-200 font-mono bg-black/30 p-3 rounded border border-purple-700/30 overflow-hidden">
            {code.substring(0, 200)}...
          </pre>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-600/30">
      <div className="p-4 border-b border-purple-800/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-purple-200">Music Code</h3>
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
              Generated
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
              <Copy className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
              <Download className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
              <Play className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-purple-300">
          AI-generated code from your musical input
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100%-5rem)]">
        <div className="p-4">
          <pre className="text-xs text-purple-200 font-mono bg-black/30 p-3 rounded border border-purple-700/30 overflow-x-auto">
            {code}
          </pre>
        </div>
      </ScrollArea>
    </Card>
  );
}