import React, { useState, useRef, useEffect } from 'react';
import { useTimeline } from './TimelineContext';
import { Timeline } from './Timeline';
import { LyricsStyleEditor } from './LyricsStyleEditor';
import { ArrangementPanel } from './ArrangementPanel';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from './chordcraft.grammar.js';

if (languages.chordcraft === undefined) { 
    languages.chordcraft = chordCraftGrammar; 
}

export function TimelineStudio() {
  const { state, actions } = useTimeline();
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Handle sidebar resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 250 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Get the currently selected block's code
  const selectedBlock = state.blocks.find(block => block.id === state.selectedBlockId);
  const currentCode = selectedBlock ? selectedBlock.code : '// Select a block to edit its code...';

  // Handle code changes
  const handleCodeChange = (code) => {
    if (selectedBlock) {
      actions.updateBlock(selectedBlock.id, { code });
    }
  };

  // Handle play code
  const handlePlayCode = () => {
    if (selectedBlock) {
      // This would integrate with the audio playback system
      console.log('Playing code for block:', selectedBlock.id);
    }
  };

  // Handle analyze code
  const handleAnalyzeCode = () => {
    if (selectedBlock) {
      // This would analyze the musical features of the code
      console.log('Analyzing code for block:', selectedBlock.id);
    }
  };

  return (
    <div className="timeline-studio h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="header bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-glow">ChordCraft</span> Timeline Studio
            </h1>
            <div className="text-sm text-slate-400">
              {state.blocks.length} sections • {state.timeline.totalDuration.toFixed(1)}s • {state.timeline.bpm} BPM
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors">
              💾 Save Project
            </button>
            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors">
              📁 Load Project
            </button>
            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content flex-1 flex overflow-hidden">
        {/* Left Sidebar - Lyrics & Style Editor */}
        <div
          ref={sidebarRef}
          className="sidebar bg-slate-800/50 border-r border-slate-700 flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          <LyricsStyleEditor />
        </div>

        {/* Resize Handle */}
        <div
          className="resize-handle w-1 bg-slate-600 hover:bg-slate-500 cursor-ew-resize flex-shrink-0"
          onMouseDown={handleMouseDown}
        />

        {/* Center Area - Timeline and Code Editor */}
        <div className="center-area flex-1 flex flex-col">
          {/* Arrangement Panel */}
          <ArrangementPanel />

          {/* Timeline */}
          <div className="timeline-container flex-1">
            <Timeline />
          </div>

          {/* Code Editor */}
          <div className="code-editor bg-slate-800/50 border-t border-slate-700">
            <div className="code-editor-header bg-slate-700/50 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                {selectedBlock && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: selectedBlock.color }}
                    ></div>
                    <span>{selectedBlock.title}</span>
                    <span>•</span>
                    <span>{selectedBlock.duration.toFixed(1)}s</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayCode}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors"
                >
                  ▶️ Play Code
                </button>
                <button
                  onClick={handleAnalyzeCode}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
                >
                  🎼 Analyze Code
                </button>
                <button className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm font-medium transition-colors">
                  📋 Copy
                </button>
              </div>
            </div>
            
            <div className="code-editor-content h-64">
              <Editor
                value={currentCode}
                onValueChange={handleCodeChange}
                highlight={code => highlight(code, languages.chordcraft)}
                padding={16}
                style={{
                  fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                  fontSize: 14,
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  height: '100%',
                  overflow: 'auto'
                }}
                textareaClassName="code-textarea"
                preClassName="code-pre"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>Zoom: {state.timeline.zoom.toFixed(1)}x</span>
          <span>•</span>
          <span>Selected: {selectedBlock ? selectedBlock.title : 'None'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Cursor: 0:00</span>
          <span>•</span>
          <span>Selection: 0:00 - 0:00</span>
        </div>
      </div>

      {/* AuraOS Styles */}
      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 16px hsla(var(--hue, 260), 100%, 70%, 0.9), 0 0 4px hsla(var(--hue, 260), 100%, 70%, 0.7);
          animation: hue-rotate 10s linear infinite;
        }
        
        @keyframes hue-rotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        .code-textarea {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          resize: none !important;
          color: #d4d4d4 !important;
        }
        
        .code-pre {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .resize-handle:hover {
          background-color: #64748b !important;
        }
      `}</style>
    </div>
  );
}
