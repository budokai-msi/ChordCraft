import React from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useUIStore } from '../../../stores/useUIStore';
import { Upload, Music, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LeftPanel() {
    const { tracks, notes, updateNote } = useProjectStore();
    const { selectedNote, setSelectedNote } = useUIStore();

    const handleFileChange = (e) => {
        console.log("File selected:", e.target.files[0]);
        // TODO: Implement audio file upload and analysis trigger
    };

    return (
        <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 flex flex-col gap-4 shrink-0">
            <h2 className="text-lg font-semibold">Tracks</h2>
            <div className="flex-1 space-y-2 overflow-y-auto">
                {tracks.map(track => (
                    <div 
                        key={track.id} 
                        className="bg-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                    >
                        <h3 className="font-medium flex items-center gap-2">
                            <Music className="h-4 w-4 text-blue-400" />
                            {track.name}
                        </h3>
                        <p className="text-sm text-slate-400">{notes.filter(n => n.trackId === track.id).length} notes</p>
                    </div>
                ))}
                <div className="bg-slate-700/50 p-3 rounded-lg border-2 border-dashed border-slate-600 text-center">
                    <label htmlFor="audio-upload" className="cursor-pointer block py-2">
                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Upload Audio</p>
                    </label>
                    <input id="audio-upload" type="file" className="hidden" onChange={handleFileChange} />
                </div>
            </div>
            
            <div>
                <h2 className="text-lg font-semibold mb-2">Inspector</h2>
                <div className="bg-slate-700 p-3 rounded-lg h-48 overflow-y-auto">
                    {selectedNote ? (
                        <div className="space-y-2">
                            <p className="text-sm"><strong>ID:</strong> {selectedNote.id}</p>
                            <p className="text-sm"><strong>Pitch:</strong> {selectedNote.pitch}</p>
                            <p className="text-sm"><strong>Start:</strong> {selectedNote.startTime.toFixed(2)}s</p>
                            <p className="text-sm"><strong>Duration:</strong> {selectedNote.duration.toFixed(2)}s</p>
                            <label className="text-sm block mt-2">Velocity:</label>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={selectedNote.velocity || 0.8}
                                onChange={(e) => updateNote(selectedNote.id, { velocity: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            {/* Add more editable properties here */}
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full mt-4"
                                onClick={() => { /* TODO: Implement delete note */ setSelectedNote(null); }}
                            >
                                Delete Note
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Select a note to see details...</p>
                    )}
                </div>
            </div>
        </aside>
    );
}
