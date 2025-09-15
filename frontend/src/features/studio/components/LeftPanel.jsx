import React, { useState, useRef } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useUIStore } from '../../../stores/useUIStore';
import { 
  Upload, 
  Music, 
  Settings, 
  FileAudio, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiService } from '../../../services/apiService';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { loggerService } from '../../../services/loggerService';

export function LeftPanel() {
    const { tracks, notes, updateNote, addTrack, updateCode, deleteTrack } = useProjectStore();
    const { selectedNote, setSelectedNote, showSuccess, showError } = useUIStore();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [recentFiles, setRecentFiles] = useState([]);
    const [playingTrack, setPlayingTrack] = useState(null);
    const [mutedTracks, setMutedTracks] = useState(new Set());
    const [visibleTracks, setVisibleTracks] = useState(new Set(tracks.map(t => t.id)));
    const fileInputRef = useRef(null);

    const handleFileUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac', 'audio/ogg'];
        if (!allowedTypes.includes(file.type)) {
            showError('Please upload a valid audio file (WAV, MP3, M4A, FLAC, or OGG)');
            return;
        }

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            showError('File size must be less than 100MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setAnalysisResult(null);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Upload and analyze the file
            const result = await apiService.analyzeAudio(file, {
                onProgress: (progress) => {
                    setUploadProgress(progress);
                }
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result.success) {
                setAnalysisResult(result);
                
                // Add the generated code to the project
                if (result.chordCraftCode) {
                    updateCode(result.chordCraftCode);
                }

                // Create a new track for the analyzed audio
                const newTrack = {
                    id: `track_${Date.now()}`,
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    type: 'audio',
                    source: 'uploaded',
                    analysis: result.analysis,
                    fileSize: file.size,
                    duration: result.analysis?.duration || 0,
                    createdAt: new Date().toISOString(),
                    isMuted: false,
                    isVisible: true,
                    volume: 1.0
                };
                addTrack(newTrack);

                // Add to recent files
                setRecentFiles(prev => [
                    {
                        id: `file_${Date.now()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        uploadedAt: new Date().toISOString(),
                        analysis: result.analysis,
                        trackId: newTrack.id
                    },
                    ...prev.slice(0, 4) // Keep only 5 recent files
                ]);

                showSuccess('Audio file analyzed successfully!');
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            loggerService.error('Error analyzing audio:', error);
            showError(`Failed to analyze audio: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const audioFile = files.find(file => file.type.startsWith('audio/'));
        if (audioFile) {
            handleFileUpload(audioFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const toggleTrackMute = (trackId) => {
        setMutedTracks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trackId)) {
                newSet.delete(trackId);
            } else {
                newSet.add(trackId);
            }
            return newSet;
        });
    };

    const toggleTrackVisibility = (trackId) => {
        setVisibleTracks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trackId)) {
                newSet.delete(trackId);
            } else {
                newSet.add(trackId);
            }
            return newSet;
        });
    };

    const playTrack = (trackId) => {
        setPlayingTrack(playingTrack === trackId ? null : trackId);
        // Audio playback will be implemented with the audio engine
        loggerService.info('Track playback toggled', { trackId, isPlaying: playingTrack !== trackId });
    };

    const deleteTrackHandler = (trackId) => {
        deleteTrack(trackId);
        setRecentFiles(prev => prev.filter(file => file.trackId !== trackId));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <aside className="w-80 bg-gray-800 bg-opacity-50 border-r border-slate-700 p-4 flex flex-col gap-4 shrink-0">
            {/* Upload Section */}
            <Card className="glass-pane">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" />
                        Audio Upload
                    </CardTitle>
                    <CardDescription>
                        Upload audio files for AI analysis and processing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div
                        className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <div className="space-y-3">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                                <p className="text-sm text-slate-300">Analyzing audio...</p>
                                <Progress value={uploadProgress} className="w-full" />
                                <p className="text-xs text-slate-400">{uploadProgress}% complete</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <FileAudio className="w-8 h-8 text-slate-400 mx-auto" />
                                <p className="text-sm text-slate-300">Drop audio files here or click to browse</p>
                                <p className="text-xs text-slate-500">Supports WAV, MP3, M4A, FLAC, OGG (max 100MB)</p>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Analysis Result */}
                    {analysisResult && (
                        <div className="space-y-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Analysis Complete</span>
                            </div>
                            <div className="text-xs text-slate-300 space-y-1">
                                <p><strong>Tempo:</strong> {analysisResult.analysis?.tempo || 'Unknown'} BPM</p>
                                <p><strong>Key:</strong> {analysisResult.analysis?.key || 'Unknown'}</p>
                                <p><strong>Duration:</strong> {formatDuration(analysisResult.analysis?.duration || 0)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tracks Section */}
            <Card className="glass-pane flex-1">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-400" />
                        Tracks ({tracks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-64">
                        <div className="space-y-2 p-4">
                            {tracks.map(track => (
                                <div 
                                    key={track.id} 
                                    className="bg-slate-700/50 p-3 rounded-lg hover:bg-slate-600/50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => playTrack(track.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                {playingTrack === track.id ? (
                                                    <Pause className="h-3 w-3" />
                                                ) : (
                                                    <Play className="h-3 w-3" />
                                                )}
                                            </Button>
                                            <h3 className="font-medium text-sm truncate">{track.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleTrackVisibility(track.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                {visibleTracks.has(track.id) ? (
                                                    <Eye className="h-3 w-3" />
                                                ) : (
                                                    <EyeOff className="h-3 w-3" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleTrackMute(track.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                {mutedTracks.has(track.id) ? (
                                                    <VolumeX className="h-3 w-3 text-red-400" />
                                                ) : (
                                                    <Volume2 className="h-3 w-3" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteTrackHandler(track.id)}
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3 text-red-400" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>{notes.filter(n => n.trackId === track.id).length} notes</span>
                                        {track.duration && (
                                            <span>{formatDuration(track.duration)}</span>
                                        )}
                                    </div>

                                    {track.analysis && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {track.analysis.tempo && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {track.analysis.tempo} BPM
                                                </Badge>
                                            )}
                                            {track.analysis.key && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {track.analysis.key}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {tracks.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No tracks yet</p>
                                    <p className="text-xs">Upload audio files to get started</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Recent Files */}
            {recentFiles.length > 0 && (
                <Card className="glass-pane">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileAudio className="w-5 h-5 text-green-400" />
                            Recent Files
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-32">
                            <div className="space-y-2 p-4">
                                {recentFiles.map(file => (
                                    <div key={file.id} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <FileAudio className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span>{formatFileSize(file.size)}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteTrackHandler(file.trackId)}
                                                className="h-4 w-4 p-0"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}

            {/* Inspector */}
            <Card className="glass-pane">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5 text-orange-400" />
                        Inspector
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48">
                        {selectedNote ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400">ID:</span>
                                        <p className="font-mono">{selectedNote.id}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Pitch:</span>
                                        <p className="font-mono">{selectedNote.pitch}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Start:</span>
                                        <p className="font-mono">{selectedNote.startTime?.toFixed(2)}s</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Duration:</span>
                                        <p className="font-mono">{selectedNote.duration?.toFixed(2)}s</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400">Velocity</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.05"
                                        value={selectedNote.velocity || 0.8}
                                        onChange={(e) => updateNote(selectedNote.id, { velocity: parseFloat(e.target.value) })}
                                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>0.1</span>
                                        <span>{(selectedNote.velocity || 0.8).toFixed(2)}</span>
                                        <span>1.0</span>
                                    </div>
                                </div>

                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => {
                                        // Delete note functionality
                                        if (selectedNote) {
                                            // This would be implemented with the note management system
                                            loggerService.info('Note delete requested', { noteId: selectedNote.id });
                                        }
                                        setSelectedNote(null);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete Note
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Select a note to inspect</p>
                                <p className="text-xs">Click on any note in the timeline</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </aside>
    );
}
