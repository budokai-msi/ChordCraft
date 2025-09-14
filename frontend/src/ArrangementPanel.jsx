import React, { useState } from 'react';
import { useTimeline } from './TimelineContext';

export function ArrangementPanel() {
  const { state, actions } = useTimeline();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addNewSection = (type) => {
    const sectionTypes = {
      intro: { title: 'Intro', color: '#7c3aed', duration: 2.0 },
      verse: { title: 'Verse', color: '#059669', duration: 4.0 },
      chorus: { title: 'Chorus', color: '#dc2626', duration: 3.0 },
      bridge: { title: 'Bridge', color: '#ea580c', duration: 2.5 },
      outro: { title: 'Outro', color: '#7c2d12', duration: 2.0 }
    };

    const section = sectionTypes[type] || sectionTypes.verse;
    const startTime = state.timeline.totalDuration;

    actions.addBlock({
      blockType: type,
      title: section.title,
      code: `// ${section.title} section\nPLAY C4 FOR 1.0s AT 0.0s\nPLAY E4 FOR 1.0s AT 1.0s\nPLAY G4 FOR 1.0s AT 2.0s`,
      duration: section.duration,
      color: section.color,
      startTime
    });

    setShowAddMenu(false);
  };

  const duplicateSelectedBlock = () => {
    const selectedBlock = state.blocks.find(block => block.id === state.selectedBlockId);
    if (selectedBlock) {
      actions.addBlock({
        blockType: selectedBlock.type,
        title: `${selectedBlock.title} (Copy)`,
        code: selectedBlock.code,
        duration: selectedBlock.duration,
        color: selectedBlock.color,
        startTime: selectedBlock.startTime + selectedBlock.duration
      });
    }
  };

  const deleteSelectedBlock = () => {
    if (state.selectedBlockId) {
      actions.deleteBlock(state.selectedBlockId);
    }
  };

  const extendSong = () => {
    // Add 4 more seconds to the timeline
    const newDuration = state.timeline.totalDuration + 4.0;
    // This would need to be added to the timeline state
  };

  const extractStems = () => {
    // This would be a more advanced feature for separating instruments
    console.log('Extract stems functionality would go here');
  };

  return (
    <div className="arrangement-panel bg-slate-800/50 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Song info */}
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Arrangement</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{state.blocks.length} sections</span>
            <span>•</span>
            <span>{state.timeline.totalDuration.toFixed(1)}s</span>
            <span>•</span>
            <span>{state.timeline.bpm} BPM</span>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Add Section Button */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              + Add Section
              <span className="text-xs">▼</span>
            </button>
            
            {showAddMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50">
                <div className="py-2">
                  <button
                    onClick={() => addNewSection('intro')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 text-sm flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7c3aed' }}></div>
                    Intro
                  </button>
                  <button
                    onClick={() => addNewSection('verse')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 text-sm flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#059669' }}></div>
                    Verse
                  </button>
                  <button
                    onClick={() => addNewSection('chorus')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 text-sm flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                    Chorus
                  </button>
                  <button
                    onClick={() => addNewSection('bridge')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 text-sm flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ea580c' }}></div>
                    Bridge
                  </button>
                  <button
                    onClick={() => addNewSection('outro')}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-600 text-sm flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7c2d12' }}></div>
                    Outro
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Block Actions */}
          {state.selectedBlockId && (
            <>
              <button
                onClick={duplicateSelectedBlock}
                className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                title="Duplicate selected block"
              >
                📋 Duplicate
              </button>
              <button
                onClick={deleteSelectedBlock}
                className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                title="Delete selected block"
              >
                🗑️ Delete
              </button>
            </>
          )}

          {/* Advanced Actions */}
          <div className="h-6 w-px bg-slate-600 mx-2"></div>
          
          <button
            onClick={extendSong}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            title="Extend song by 4 seconds"
          >
            ⏱️ Extend
          </button>
          
          <button
            onClick={extractStems}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            title="Extract instrument stems (coming soon)"
          >
            🎵 Extract Stems
          </button>
        </div>
      </div>

      {/* Section Overview */}
      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Song Structure:</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {state.blocks.map((block, index) => (
            <div
              key={block.id}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                block.id === state.selectedBlockId
                  ? 'ring-2 ring-white'
                  : 'hover:ring-1 hover:ring-slate-400'
              }`}
              style={{
                backgroundColor: block.color + '40',
                borderColor: block.color,
                color: 'white'
              }}
              onClick={() => actions.selectBlock(block.id)}
            >
              {block.title}
            </div>
          ))}
          {state.blocks.length === 0 && (
            <span className="text-slate-500 text-sm italic">No sections yet. Add one to get started!</span>
          )}
        </div>
      </div>
    </div>
  );
}
