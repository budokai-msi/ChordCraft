import React, { useRef, useEffect, useState } from 'react';
import { useTimeline } from './TimelineContext';

export function Timeline() {
  const { 
    blocks, 
    selectedBlockId, 
    setSelectedBlockId, 
    updateBlock,
    isPlaying,
    currentTime
  } = useTimeline();
  
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, blockId: null });

  // Timeline settings
  const pixelsPerSecond = 200;
  const timelineHeight = 120;
  const blockHeight = 80;

  // Generate time markers
  const totalDuration = Math.max(120, blocks.reduce((max, block) => Math.max(max, block.startTime + block.duration), 0));
  const timeMarkers = [];
  for (let i = 0; i <= totalDuration; i += 10) {
    timeMarkers.push(i);
  }

  // Handle block selection
  const handleBlockClick = (blockId) => {
    setSelectedBlockId(blockId);
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
    const block = blocks.find(b => b.id === dragStart.blockId);
    const newStartTime = Math.max(0, block.startTime + deltaTime);
    
    updateBlock(dragStart.blockId, { ...block, startTime: newStartTime });
    setDragStart({ ...dragStart, x: e.clientX });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart({ x: 0, blockId: null });
  };

  // Handle timeline scrolling
  const handleWheel = (e) => {
    e.preventDefault();
    // Zoom functionality can be added here
  };

  // Generate waveform data for blocks
  const generateWaveform = (block) => {
    const samples = 50;
    const waveform = [];
    for (let i = 0; i < samples; i++) {
      waveform.push(Math.random() * 0.8 + 0.1);
    }
    return waveform;
  };

  // Get block color based on type
  const getBlockColor = (block) => {
    switch (block.type) {
      case 'intro': return '#10B981'; // Green
      case 'verse': return '#EC4899'; // Pink
      case 'chorus': return '#8B5CF6'; // Purple
      case 'bridge': return '#F59E0B'; // Yellow
      case 'outro': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  // Get block label
  const getBlockLabel = (block) => {
    if (block.name) return block.name.toUpperCase();
    return block.type.toUpperCase();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Timeline Header */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="text-sm text-gray-400 font-mono">
          Choose a section of the timeline or lyrics to start editing
        </div>
      </div>

      {/* Timeline Container */}
      <div 
        ref={timelineRef}
        className="flex-1 bg-gray-900 relative overflow-x-auto overflow-y-hidden"
        onWheel={handleWheel}
        style={{ height: `${timelineHeight}px` }}
      >
        {/* Time Markers */}
        <div className="absolute top-0 left-0 h-full flex">
          {timeMarkers.map(time => (
            <div key={time} className="relative">
              <div 
                className="absolute top-0 w-px h-full bg-gray-600"
                style={{ left: `${time * pixelsPerSecond}px` }}
              />
              <div 
                className="absolute top-2 text-xs text-gray-400 font-mono"
                style={{ left: `${time * pixelsPerSecond + 4}px` }}
              >
                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div 
          className="absolute top-0 w-0.5 h-full bg-white z-10"
          style={{ left: `${currentTime * pixelsPerSecond}px` }}
        />

        {/* Timeline Blocks */}
        {blocks.map(block => {
          const blockWidth = block.duration * pixelsPerSecond;
          const blockLeft = block.startTime * pixelsPerSecond;
          const isSelected = selectedBlockId === block.id;
          const blockColor = getBlockColor(block);
          const waveform = generateWaveform(block);

          return (
            <div
              key={block.id}
              className={`absolute top-4 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected ? 'ring-2 ring-white shadow-lg' : 'hover:shadow-md'
              }`}
              style={{
                left: `${blockLeft}px`,
                width: `${blockWidth}px`,
                height: `${blockHeight}px`,
                backgroundColor: blockColor
              }}
              onClick={() => handleBlockClick(block.id)}
              onMouseDown={(e) => handleMouseDown(e, block.id)}
            >
              {/* Block Content */}
              <div className="p-3 h-full flex flex-col">
                {/* Block Label */}
                <div className="text-white font-semibold text-sm mb-2 truncate">
                  {getBlockLabel(block)}
                </div>

                {/* Waveform Visualization */}
                <div className="flex-1 flex items-end space-x-0.5">
                  {waveform.map((amplitude, index) => (
                    <div
                      key={index}
                      className="bg-white/30 rounded-sm"
                      style={{
                        width: '2px',
                        height: `${amplitude * 100}%`,
                        minHeight: '2px'
                      }}
                    />
                  ))}
                </div>

                {/* Fade indicator for outro */}
                {block.type === 'outro' && (
                  <div className="absolute bottom-2 right-2 text-xs text-white/70 font-medium">
                    FADE
                  </div>
                )}
              </div>

              {/* Block Resize Handles */}
              <div className="absolute top-0 right-0 w-2 h-full cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-full h-full bg-white/20 rounded-r-lg" />
              </div>
            </div>
          );
        })}

        {/* Empty Timeline Message */}
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🎵</div>
              <div className="text-lg font-medium">No sections yet</div>
              <div className="text-sm">Add a new section to get started</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Footer */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
        <div className="text-sm text-gray-400">
          {blocks.length} sections • {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')} total
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Zoom In
          </button>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Zoom Out
          </button>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Fit to Screen
          </button>
        </div>
      </div>
    </div>
  );
}