import React, { useState, useRef, useEffect } from 'react';
import { useTimeline } from './useTimeline';
import { Timeline } from './Timeline';
import { LyricsStyleEditor } from './LyricsStyleEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Play, 
    Pause, 
    Square, 
    SkipBack, 
    SkipForward, 
    Volume2, 
    Settings, 
    Music, 
    Plus, 
    Copy, 
    RotateCcw,
    Grid3X3,
    ArrowRight,
    Headphones
} from 'lucide-react';

export function TimelineStudio() {
    const { 
        blocks, 
        selectedBlockId, 
        setSelectedBlockId, 
        updateBlock,
        addBlock,
        timelineSettings,
        updateTimelineSettings,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime
    } = useTimeline();

    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null);
    const resizeRef = useRef(null);

    const selectedBlock = blocks.find(block => block.id === selectedBlockId);

    // Resize functionality
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizing) {
                const newWidth = e.clientX;
                if (newWidth >= 280 && newWidth <= 600) {
                    setSidebarWidth(newWidth);
                }
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleStop = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleAddSection = () => {
        const newBlock = {
            id: `block-${Date.now()}`,
            type: 'verse',
            name: `Verse ${blocks.filter(b => b.type === 'verse').length + 1}`,
            startTime: blocks.length * 8,
            duration: 8,
            code: `// ${blocks.filter(b => b.type === 'verse').length + 1}\nPLAY C4 FOR 1.0s AT 0.0s\nPLAY E4 FOR 1.0s AT 1.0s\nPLAY G4 FOR 1.0s AT 2.0s`,
            color: '#EC4899'
        };
        addBlock(newBlock);
    };

    const handleDuplicateSection = () => {
        if (selectedBlockId) {
            const selectedBlock = blocks.find(b => b.id === selectedBlockId);
            if (selectedBlock) {
                const newBlock = {
                    ...selectedBlock,
                    id: `block-${Date.now()}`,
                    startTime: selectedBlock.startTime + selectedBlock.duration,
                    name: `${selectedBlock.name} (Copy)`
                };
                addBlock(newBlock);
            }
        }
    };

    const handleExtendSong = () => {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock) {
            const newBlock = {
                id: `block-${Date.now()}`,
                type: 'outro',
                name: 'Outro',
                startTime: lastBlock.startTime + lastBlock.duration,
                duration: 8,
                code: `// Outro\nPLAY C4 FOR 2.0s AT 0.0s\nPLAY G4 FOR 2.0s AT 2.0s`,
                color: '#10B981'
            };
            addBlock(newBlock);
        }
    };

    const handleRearrange = () => {
        if (selectedBlockId) {
            const selectedBlock = blocks.find(b => b.id === selectedBlockId);
            if (selectedBlock) {
                const otherBlocks = blocks.filter(b => b.id !== selectedBlockId);
                const newBlock = {
                    ...selectedBlock,
                    startTime: otherBlocks.length * 8
                };
                updateBlock(selectedBlockId, newBlock);
            }
        }
    };

    const handleExtractStems = () => {
        alert('Stem extraction feature coming soon!');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex h-screen">
                {/* Left Panel - Song Editor */}
                <div 
                    ref={sidebarRef}
                    className="bg-slate-900 border-r border-slate-700 flex flex-col"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    <div className="p-6 border-b border-slate-700">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Music className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Song Editor</h2>
                                <p className="text-sm text-slate-400">Beta</p>
                            </div>
                        </div>
                        <LyricsStyleEditor />
                    </div>
                    
                    {/* Credits Display */}
                    <div className="mt-auto p-6 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-400">1,060 Credits</div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                                <div className="text-xs">
                                    <div className="text-white font-medium">ChordCraft Project</div>
                                    <div className="text-slate-400">by ChordCraft AI</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    ref={resizeRef}
                    className="w-1 bg-slate-700 hover:bg-slate-600 cursor-col-resize flex-shrink-0"
                    onMouseDown={handleResizeStart}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-white">
                                Song Editor Beta
                            </h1>
                            <Badge variant="outline" className="text-slate-400">
                                Legacy Editor
                            </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset All
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                My Workspace
                            </Button>
                            <Button size="sm">
                                <Copy className="w-4 h-4 mr-2" />
                                Save as New Song
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Headphones className="w-4 h-4 mr-2" />
                                Stems New
                            </Button>
                        </div>
                    </div>

                    {/* Learn Section */}
                    <div className="h-32 bg-slate-800 border-b border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Learn</h2>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                Hide Tips
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-4">
                            <Button 
                                onClick={handleAddSection}
                                className="h-20 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                            >
                                <div className="text-center">
                                    <Music className="w-6 h-6 mx-auto mb-2" />
                                    <div className="text-sm font-medium">Change lyrics or melodies</div>
                                </div>
                            </Button>
                            
                            <Button 
                                onClick={handleAddSection}
                                className="h-20 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white"
                            >
                                <div className="text-center">
                                    <Plus className="w-6 h-6 mx-auto mb-2" />
                                    <div className="text-sm font-medium">Add a new section</div>
                                </div>
                            </Button>
                            
                            <Button 
                                onClick={handleExtendSong}
                                className="h-20 bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white"
                            >
                                <div className="text-center">
                                    <ArrowRight className="w-6 h-6 mx-auto mb-2" />
                                    <div className="text-sm font-medium">Extend your song</div>
                                </div>
                            </Button>
                            
                            <Button 
                                onClick={handleRearrange}
                                className="h-20 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white"
                            >
                                <div className="text-center">
                                    <Grid3X3 className="w-6 h-6 mx-auto mb-2" />
                                    <div className="text-sm font-medium">Rearrange your song</div>
                                </div>
                            </Button>
                            
                            <div className="relative">
                                <Badge className="absolute -top-2 left-0 right-0 text-center bg-slate-700">
                                    Stems
                                </Badge>
                                <Button 
                                    onClick={handleExtractStems}
                                    className="h-20 w-full bg-gradient-to-r from-indigo-500 to-orange-500 hover:from-indigo-600 hover:to-orange-600 text-white"
                                >
                                    <div className="text-center">
                                        <Headphones className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm font-medium">Extract stems</div>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Editor */}
                    <div className="flex-1 bg-slate-900 p-6">
                        <Timeline />
                    </div>
                </div>
            </div>

            {/* Bottom Playback Controls */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-6 z-20">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                        <SkipBack className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex items-center space-x-6">
                    <Button variant="ghost" size="sm">
                        <SkipBack className="w-5 h-5" />
                    </Button>
                    
                    <Button 
                        onClick={handlePlayPause}
                        size="lg"
                        className="w-12 h-12 rounded-full bg-white hover:bg-gray-200 text-black"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6" />
                        ) : (
                            <Play className="w-6 h-6" />
                        )}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                        <SkipForward className="w-5 h-5" />
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                        <Square className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-lg font-mono text-white">
                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(3).padStart(6, '0')}
                    </div>
                    <div className="text-sm text-slate-400">
                        143 BPM
                    </div>
                    <Button variant="ghost" size="sm">
                        <Volume2 className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="text-slate-400">-</Button>
                        <Button variant="ghost" size="sm" className="text-slate-400">+</Button>
                        <Button variant="ghost" size="sm" className="text-slate-400">⟷</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}