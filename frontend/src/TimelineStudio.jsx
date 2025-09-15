import React, { useState, useRef, useEffect } from 'react';
import { useTimeline } from './TimelineContext';
import { Timeline } from './Timeline';
import { LyricsStyleEditor } from './LyricsStyleEditor';
import { ArrangementPanel } from './ArrangementPanel';
import Editor from 'react-simple-code-editor';
import './design-system.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from './chordcraft.grammar.js';

if (languages.chordcraft === undefined) { 
    languages.chordcraft = chordCraftGrammar; 
}

export function TimelineStudio() {
    console.log('🎼 TimelineStudio component rendering...');
    
    const { 
        blocks, 
        selectedBlockId, 
        setSelectedBlockId, 
        updateBlock,
        addBlock,
        deleteBlock,
        timelineSettings,
        updateTimelineSettings,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime
    } = useTimeline();
    
    console.log('🎼 TimelineStudio - blocks:', blocks.length, 'selectedBlockId:', selectedBlockId);

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
        <div className="min-h-screen bg-black text-white">
            {/* Three.js Background */}
            <div id="three-canvas" className="fixed inset-0 z-0" />
            
            <div className="relative z-10 flex h-screen">
                {/* Left Panel - Song Editor */}
                <div 
                    ref={sidebarRef}
                    className="bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 flex flex-col"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4">Song Editor</h2>
                        <LyricsStyleEditor />
                    </div>
                    
                    {/* Credits Display */}
                    <div className="mt-auto p-6 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">1,060 Credits</div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                                <div className="text-xs">
                                    <div className="text-white font-medium">ChordCraft Project</div>
                                    <div className="text-gray-400">by ChordCraft AI</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    ref={resizeRef}
                    className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize flex-shrink-0"
                    onMouseDown={handleResizeStart}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="h-16 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 flex items-center justify-between px-6">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-white">
                                Song Editor Beta
                            </h1>
                            <div className="text-sm text-gray-400">
                                Legacy Editor
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                                Reset All
                            </button>
                            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                                My Workspace
                            </button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                                Save as New Song
                            </button>
                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm">
                                Stems New
                            </button>
                        </div>
                    </div>

                    {/* Learn Section */}
                    <div className="h-32 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Learn</h2>
                            <button className="text-sm text-gray-400 hover:text-white transition-colors">
                                Hide Tips
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-4">
                            <button 
                                onClick={handleAddSection}
                                className="p-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg hover:scale-105 transition-transform"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🎵</div>
                                    <div className="text-sm font-medium">Change lyrics or melodies</div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={handleAddSection}
                                className="p-4 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg hover:scale-105 transition-transform"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">➕</div>
                                    <div className="text-sm font-medium">Add a new section</div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={handleExtendSong}
                                className="p-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg hover:scale-105 transition-transform"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">⏱️</div>
                                    <div className="text-sm font-medium">Extend your song</div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={handleRearrange}
                                className="p-4 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg hover:scale-105 transition-transform"
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🔄</div>
                                    <div className="text-sm font-medium">Rearrange your song</div>
                                </div>
                            </button>
                            
                            <div className="relative">
                                <div className="absolute -top-2 left-0 right-0 text-center">
                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">Stems</span>
                                </div>
                                <button 
                                    onClick={handleExtractStems}
                                    className="p-4 bg-gradient-to-r from-indigo-500 to-orange-500 rounded-lg hover:scale-105 transition-transform w-full"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">🎛️</div>
                                        <div className="text-sm font-medium">Extract stems</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Editor */}
                    <div className="flex-1 bg-gray-900/95 backdrop-blur-xl p-6">
                        <Timeline />
                    </div>
                </div>
            </div>

            {/* Bottom Playback Controls */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-800/95 backdrop-blur-xl border-t border-gray-700 flex items-center justify-between px-6 z-20">
                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center space-x-6">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    <button 
                        onClick={handlePlayPause}
                        className="p-3 bg-white hover:bg-gray-200 rounded-full transition-colors"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 002 0V9a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v2a1 1 0 002 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-lg font-mono text-white">
                        {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(3).padStart(6, '0')}
                    </div>
                    <div className="text-sm text-gray-400">
                        143 BPM
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400">-</button>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400">+</button>
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400">⟷</button>
                    </div>
                </div>
            </div>
        </div>
    );
}