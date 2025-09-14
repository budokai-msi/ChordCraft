import React, { useRef, useEffect, useState } from 'react';
import { useTimeline } from './TimelineContext';

export function Timeline() {
  const { state, actions } = useTimeline();
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, blockId: null });

  // Calculate timeline dimensions and scaling
  const pixelsPerSecond = 100 * state.timeline.zoom;
  const timelineWidth = state.timeline.totalDuration * pixelsPerSecond;
  const visibleWidth = timelineRef.current?.clientWidth || 800;

  // Handle block selection
  const handleBlockClick = (blockId) => {
    actions.selectBlock(blockId);
  };

  // Handle block dragging
  const handleMouseDown = (e, blockId) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, blockId });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart.blockId) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaTime = deltaX / pixelsPerSecond;
    const newStartTime = Math.max(0, state.blocks.find(b => b.id === dragStart.blockId).startTime + deltaTime);
    
    actions.moveBlock(dragStart.blockId, newStartTime);
    setDragStart({ ...dragStart, x: e.clientX });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart({ x: 0, blockId: null });
  };

  // Handle timeline scrolling
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.1, Math.min(5.0, state.timeline.zoom + delta));
    actions.setZoom(newZoom);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Render time markers
  const renderTimeMarkers = () => {
    const markers = [];
    const interval = state.timeline.zoom > 2 ? 0.5 : state.timeline.zoom > 1 ? 1 : 2;
    
    for (let time = 0; time <= state.timeline.totalDuration; time += interval) {
      const x = time * pixelsPerSecond;
      markers.push(
        <div
          key={time}
          className="absolute top-0 h-full border-l border-slate-600"
          style={{ left: x }}
        >
          <div className="text-xs text-slate-400 mt-1 ml-1">
            {time.toFixed(1)}s
          </div>
        </div>
      );
    }
    return markers;
  };

  // Render playhead
  const renderPlayhead = () => {
    const x = state.playback.playheadPosition * pixelsPerSecond;
    return (
      <div
        className="absolute top-0 h-full w-0.5 bg-red-500 z-20 pointer-events-none"
        style={{ left: x }}
      >
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="timeline-container h-full flex flex-col">
      {/* Timeline Header */}
      <div className="timeline-header bg-slate-800/30 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-semibold text-white">Timeline</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">BPM:</span>
            <input
              type="number"
              value={state.timeline.bpm}
              onChange={(e) => actions.setBpm(parseInt(e.target.value))}
              className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              min="60"
              max="200"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Zoom:</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={state.timeline.zoom}
              onChange={(e) => actions.setZoom(parseFloat(e.target.value))}
              className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(state.timeline.zoom - 0.1) / 4.9 * 100}%, #374151 ${(state.timeline.zoom - 0.1) / 4.9 * 100}%, #374151 100%)`
              }}
            />
            <span className="text-sm text-slate-400 font-medium">{state.timeline.zoom.toFixed(1)}x</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={actions.play}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-medium transition-all transform hover:scale-105"
          >
            ▶️ Play
          </button>
          <button
            onClick={actions.pause}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl text-sm font-medium transition-all transform hover:scale-105"
          >
            ⏸️ Pause
          </button>
          <button
            onClick={actions.stop}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl text-sm font-medium transition-all transform hover:scale-105"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div
        ref={timelineRef}
        className="timeline-canvas flex-1 relative overflow-x-auto overflow-y-hidden bg-slate-900/20"
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="timeline-track relative h-full"
          style={{ width: Math.max(timelineWidth, visibleWidth) }}
        >
          {/* Time markers */}
          {renderTimeMarkers()}
          
          {/* Playhead */}
          {renderPlayhead()}
          
          {/* Block tracks */}
          <div className="block-tracks absolute inset-0">
            {state.blocks.map((block, index) => (
              <TimelineBlock
                key={block.id}
                block={block}
                pixelsPerSecond={pixelsPerSecond}
                trackIndex={index}
                isSelected={block.id === state.selectedBlockId}
                onBlockClick={handleBlockClick}
                onMouseDown={handleMouseDown}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Timeline Block Component
function TimelineBlock({ block, pixelsPerSecond, trackIndex, isSelected, onBlockClick, onMouseDown }) {
  const blockWidth = block.duration * pixelsPerSecond;
  const blockLeft = block.startTime * pixelsPerSecond;
  const trackTop = 20 + (trackIndex * 60); // 60px per track

  return (
    <div
      className={`timeline-block absolute rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
        isSelected 
          ? 'border-white shadow-2xl shadow-purple-500/50 scale-105' 
          : 'border-slate-600/50 hover:border-slate-400 hover:scale-102'
      }`}
      style={{
        left: blockLeft,
        top: trackTop,
        width: blockWidth,
        height: 48,
        background: `linear-gradient(135deg, ${block.color}40, ${block.color}20)`,
        borderColor: isSelected ? 'white' : block.color + '80',
        boxShadow: isSelected 
          ? `0 0 20px ${block.color}60, 0 0 40px ${block.color}40` 
          : `0 4px 12px ${block.color}20`
      }}
      onClick={() => onBlockClick(block.id)}
      onMouseDown={(e) => onMouseDown(e, block.id)}
    >
      {/* Block content */}
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {block.title}
          </div>
          <div className="text-xs text-slate-200/80 truncate">
            {block.type} • {block.duration.toFixed(1)}s
          </div>
        </div>
        
        {/* Block controls */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            className="w-7 h-7 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-white text-xs flex items-center justify-center backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle play block
            }}
          >
            ▶️
          </button>
          <button
            className="w-7 h-7 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-white text-xs flex items-center justify-center backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              // Handle duplicate block
            }}
          >
            📋
          </button>
        </div>
      </div>
      
      {/* Resize handles */}
      <div
        className="absolute right-0 top-0 w-3 h-full cursor-ew-resize bg-slate-600/50 hover:bg-slate-500/50 rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => {
          e.stopPropagation();
          // Handle resize
        }}
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
      )}
    </div>
  );
}
