import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Music, Piano, Headphones, Mic, Volume2, VolumeX, 
  Trash2, Edit3, Copy, Plus, Settings, Eye, EyeOff
} from 'lucide-react';

// Ultra-compact constants
const TRACK_TYPES = [
  { id: 'audio', label: 'Audio', icon: Music, color: 'bg-blue-500' },
  { id: 'midi', label: 'MIDI', icon: Piano, color: 'bg-green-500' },
  { id: 'drum', label: 'Drums', icon: Headphones, color: 'bg-purple-500' },
  { id: 'vocal', label: 'Vocals', icon: Mic, color: 'bg-pink-500' }
];

export function TrackManager({ tracks = [], onAddTrack, onUpdateTrack, onDeleteTrack, onSelectTrack }) {
  const [state, setState] = useState({
    selectedTracks: [],
    showSettings: false,
    draggedTrack: null
  });

  // Ultra-compact update function
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Ultra-compact handlers
  const handlers = {
    addTrack: (type) => {
      const newTrack = {
        id: Date.now(),
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track`,
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        color: TRACK_TYPES.find(t => t.id === type)?.color || 'bg-gray-500'
      };
      onAddTrack?.(newTrack);
    },

    updateTrack: (trackId, updates) => {
      onUpdateTrack?.(trackId, updates);
    },

    deleteTrack: (trackId) => {
      onDeleteTrack?.(trackId);
      updateState({ selectedTracks: state.selectedTracks.filter(id => id !== trackId) });
    },

    toggleSelection: (trackId) => {
      const newSelection = state.selectedTracks.includes(trackId)
        ? state.selectedTracks.filter(id => id !== trackId)
        : [...state.selectedTracks, trackId];
      updateState({ selectedTracks: newSelection });
      onSelectTrack?.(newSelection);
    },

    toggleMute: (trackId) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) handlers.updateTrack(trackId, { mute: !track.mute });
    },

    toggleSolo: (trackId) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) handlers.updateTrack(trackId, { solo: !track.solo });
    },

    duplicateTrack: (trackId) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        const newTrack = { ...track, id: Date.now(), name: `${track.name} Copy` };
        onAddTrack?.(newTrack);
      }
    }
  };

  // Ultra-compact components
  const TrackItem = ({ track }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
      state.selectedTracks.includes(track.id) 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-primary/50'
    }`}>
      {/* Track color indicator */}
      <div className={`w-3 h-3 rounded-full ${track.color}`} />
      
      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium truncate">{track.name}</p>
          <Badge variant="outline" className="text-xs">
            {TRACK_TYPES.find(t => t.id === track.type)?.label || track.type}
          </Badge>
        </div>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-muted-foreground">
            Vol: {Math.round(track.volume * 100)}%
          </span>
          <span className="text-xs text-muted-foreground">
            Pan: {track.pan > 0 ? `R${track.pan}` : track.pan < 0 ? `L${Math.abs(track.pan)}` : 'C'}
          </span>
        </div>
      </div>

      {/* Track controls */}
      <div className="flex items-center space-x-2">
        {/* Mute button */}
        <Button
          size="sm"
          variant={track.mute ? "destructive" : "ghost"}
          onClick={() => handlers.toggleMute(track.id)}
          className="h-8 w-8 p-0"
        >
          {track.mute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        {/* Solo button */}
        <Button
          size="sm"
          variant={track.solo ? "default" : "ghost"}
          onClick={() => handlers.toggleSolo(track.id)}
          className="h-8 w-8 p-0"
        >
          {track.solo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>

        {/* Volume slider */}
        <div className="w-20">
          <Slider
            value={[track.volume]}
            onValueChange={([value]) => handlers.updateTrack(track.id, { volume: value })}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlers.duplicateTrack(track.id)}
            className="h-8 w-8 p-0"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlers.deleteTrack(track.id)}
            className="h-8 w-8 p-0 hover:bg-destructive/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const AddTrackButton = ({ type, label, icon: Icon }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handlers.addTrack(type)}
      className="justify-start hover:bg-primary/20"
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Track Manager
          </span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateState({ showSettings: !state.showSettings })}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Badge variant="secondary" className="text-xs">
              {tracks.length} tracks
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tracks List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tracks yet</p>
              <p className="text-xs">Add a track to get started</p>
            </div>
          ) : (
            tracks.map(track => (
              <TrackItem key={track.id} track={track} />
            ))
          )}
        </div>

        {/* Add Track Buttons */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Add Track</h4>
          <div className="grid grid-cols-2 gap-2">
            {TRACK_TYPES.map(({ id, label, icon }) => (
              <AddTrackButton key={id} type={id} label={label} icon={icon} />
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        {state.showSettings && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium">Track Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-mute when soloing</span>
                <Button size="sm" variant="outline">Toggle</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show track numbers</span>
                <Button size="sm" variant="outline">Toggle</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable track grouping</span>
                <Button size="sm" variant="outline">Toggle</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}