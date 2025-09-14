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
      <div className="timeline-header bg-slate-800/50 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Timeline</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">BPM:</span>
            <input
              type="number"
              value={state.timeline.bpm}
              onChange={(e) => actions.setBpm(parseInt(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              min="60"
              max="200"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Zoom:</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={state.timeline.zoom}
              onChange={(e) => actions.setZoom(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-slate-400">{state.timeline.zoom.toFixed(1)}x</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={actions.play}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ▶️ Play
          </button>
          <button
            onClick={actions.pause}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⏸️ Pause
          </button>
          <button
            onClick={actions.stop}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      {/* Timeline Canvas */}
      <div
        ref={timelineRef}
        className="timeline-canvas flex-1 relative overflow-x-auto overflow-y-hidden bg-slate-900/30"
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
      className={`timeline-block absolute rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-white shadow-lg shadow-purple-500/50' 
          : 'border-slate-600 hover:border-slate-400'
      }`}
      style={{
        left: blockLeft,
        top: trackTop,
        width: blockWidth,
        height: 40,
        backgroundColor: block.color + '40',
        borderColor: isSelected ? 'white' : block.color
      }}
      onClick={() => onBlockClick(block.id)}
      onMouseDown={(e) => onMouseDown(e, block.id)}
    >
      {/* Block content */}
      <div className="h-full flex items-center justify-between px-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {block.title}
          </div>
          <div className="text-xs text-slate-300 truncate">
            {block.type} • {block.duration.toFixed(1)}s
          </div>
        </div>
        
        {/* Block controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle play block
            }}
          >
            ▶️
          </button>
          <button
            className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs"
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
        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize bg-slate-600 hover:bg-slate-500 rounded-r"
        onMouseDown={(e) => {
          e.stopPropagation();
          // Handle resize
        }}
      />
    </div>
  );
}
