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

    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sidebarRef = useRef(null);
    const resizeRef = useRef(null);

    const selectedBlock = blocks.find(block => block.id === selectedBlockId);

    useEffect(() => {
        setIsVisible(true);
    }, []);

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

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-float" />
                <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-500/5 to-yellow-500/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Layout */}
            <div className="relative z-10 min-h-screen flex">
                {/* Sidebar */}
                <div 
                    ref={sidebarRef}
                    className="glass-strong border-r border-white/10 flex flex-col"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-white/10">
                        <h1 className="text-display-sm font-bold text-white mb-2">
                            <span className="text-gradient">Timeline Studio</span>
                        </h1>
                        <p className="text-sm text-slate-400">
                            Professional music production environment
                        </p>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto">
                        <LyricsStyleEditor />
                        <ArrangementPanel />
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    ref={resizeRef}
                    className="w-1 bg-slate-700/50 hover:bg-slate-600/50 cursor-col-resize transition-colors relative group"
                    onMouseDown={handleResizeStart}
                >
                    <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20 transition-colors" />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Timeline Header */}
                    <div className="glass-strong border-b border-white/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-semibold text-white">Timeline</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <span>BPM: {timelineSettings.bpm}</span>
                                    <span>•</span>
                                    <span>Zoom: {timelineSettings.zoom}x</span>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handlePlayPause}
                                    className="btn btn-primary btn-sm"
                                >
                                    {isPlaying ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>

                                <button
                                    onClick={handleStop}
                                    className="btn btn-ghost btn-sm text-white border-white/20 hover:bg-white/10"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6h12v12H6z" />
                                    </svg>
                                    Stop
                                </button>

                                <div className="text-sm text-slate-400">
                                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
                                </div>
                            </div>
                        </div>

                        {/* Timeline Controls */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-300">BPM:</label>
                                <input
                                    type="number"
                                    value={timelineSettings.bpm}
                                    onChange={(e) => updateTimelineSettings({ bpm: parseInt(e.target.value) || 120 })}
                                    className="input input-glass w-20 text-center"
                                    min="60"
                                    max="200"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-300">Zoom:</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="4"
                                    step="0.1"
                                    value={timelineSettings.zoom}
                                    onChange={(e) => updateTimelineSettings({ zoom: parseFloat(e.target.value) })}
                                    className="w-24"
                                />
                                <span className="text-sm text-slate-400 w-8">{timelineSettings.zoom}x</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Area */}
                    <div className="flex-1 flex">
                        {/* Timeline */}
                        <div className="flex-1 p-6">
                            <Timeline />
                        </div>

                        {/* Code Editor Panel */}
                        {selectedBlock && (
                            <div className="w-96 glass-strong border-l border-white/10 flex flex-col">
                                <div className="p-4 border-b border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Code Editor
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Block: {selectedBlock.name}
                                    </p>
                                </div>

                                <div className="flex-1 p-4">
                                    <Editor
                                        value={selectedBlock.code}
                                        onValueChange={(code) => updateBlock(selectedBlockId, { code })}
                                        highlight={(code) => highlight(code, languages.chordcraft, 'chordcraft')}
                                        padding={16}
                                        className="w-full h-full font-mono text-sm"
                                        style={{
                                            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
                                            fontSize: 13,
                                            lineHeight: 1.5,
                                            backgroundColor: 'transparent',
                                            color: '#f1f5f9'
                                        }}
                                    />
                                </div>

                                <div className="p-4 border-t border-white/10">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedBlock.code);
                                            }}
                                            className="btn btn-ghost btn-sm text-white border-white/20 hover:bg-white/10"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy
                                        </button>

                                        <button
                                            onClick={() => {
                                                // Play this specific block
                                                console.log('Playing block:', selectedBlock.name);
                                            }}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Play
                                        </button>

                                        <button
                                            onClick={() => deleteBlock(selectedBlockId)}
                                            className="btn btn-ghost btn-sm text-red-400 border-red-500/20 hover:bg-red-500/10"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-4">
                        <span>Blocks: {blocks.length}</span>
                        <span>•</span>
                        <span>Duration: {Math.max(...blocks.map(b => b.startTime + b.duration), 0).toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Microsoft Muzic AI</span>
                        <span>•</span>
                        <span>ChordCraft Studio</span>
                    </div>
                </div>
            </div>
        </div>
    );
}