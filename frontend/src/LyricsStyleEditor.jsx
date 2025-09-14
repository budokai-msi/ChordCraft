import React, { useState } from 'react';
import { useTimeline } from './TimelineContext';

export function LyricsStyleEditor() {
  const { state, actions } = useTimeline();
  const [activeTab, setActiveTab] = useState('lyrics');

  return (
    <div className="lyrics-style-editor h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="tab-navigation flex border-b border-slate-700/50">
        <button
          className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'lyrics'
              ? 'text-white border-b-2 border-purple-500 bg-slate-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
          }`}
          onClick={() => setActiveTab('lyrics')}
        >
          📝 Lyrics
        </button>
        <button
          className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'style'
              ? 'text-white border-b-2 border-purple-500 bg-slate-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
          }`}
          onClick={() => setActiveTab('style')}
        >
          🎨 Style
        </button>
        <button
          className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'generate'
              ? 'text-white border-b-2 border-purple-500 bg-slate-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
          }`}
          onClick={() => setActiveTab('generate')}
        >
          ✨ Generate
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content flex-1 overflow-y-auto">
        {activeTab === 'lyrics' && <LyricsPanel />}
        {activeTab === 'style' && <StylePanel />}
        {activeTab === 'generate' && <GeneratePanel />}
      </div>
    </div>
  );
}

// Lyrics Panel Component
function LyricsPanel() {
  const { state, actions } = useTimeline();
  const [editingSection, setEditingSection] = useState(null);

  const handleLyricsChange = (sectionId, content) => {
    const updatedSections = state.lyrics.sections.map(section =>
      section.id === sectionId ? { ...section, content } : section
    );
    actions.updateLyrics({ sections: updatedSections });
  };

  const addNewSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: ''
    };
    const updatedSections = [...state.lyrics.sections, newSection];
    actions.updateLyrics({ sections: updatedSections });
  };

  return (
    <div className="lyrics-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Song Structure</h3>
        <button
          onClick={addNewSection}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          + Add Section
        </button>
      </div>

      <div className="space-y-3">
        {state.lyrics.sections.map((section) => (
          <div key={section.id} className="lyrics-section bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  const updatedSections = state.lyrics.sections.map(s =>
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  );
                  actions.updateLyrics({ sections: updatedSections });
                }}
                className="bg-transparent border-none text-white font-medium text-sm focus:outline-none"
                placeholder="Section title..."
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  {editingSection === section.id ? '✏️' : '📝'}
                </button>
                <button
                  onClick={() => {
                    const updatedSections = state.lyrics.sections.filter(s => s.id !== section.id);
                    actions.updateLyrics({ sections: updatedSections });
                  }}
                  className="text-slate-400 hover:text-red-400 text-xs"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            {editingSection === section.id ? (
              <textarea
                value={section.content}
                onChange={(e) => handleLyricsChange(section.id, e.target.value)}
                className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm resize-none focus:outline-none focus:border-purple-500"
                placeholder="Enter lyrics for this section..."
              />
            ) : (
              <div className="text-slate-300 text-sm whitespace-pre-wrap">
                {section.content || 'Click edit to add lyrics...'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Style Panel Component
function StylePanel() {
  const { state, actions } = useTimeline();

  const handleStyleChange = (key, value) => {
    actions.updateStyle({ [key]: value });
  };

  const genres = [
    'pop', 'rock', 'jazz', 'classical', 'electronic', 'hip-hop', 'country', 'blues', 'folk', 'reggae'
  ];

  const moods = [
    'upbeat', 'melancholic', 'energetic', 'calm', 'dramatic', 'romantic', 'aggressive', 'peaceful', 'mysterious', 'joyful'
  ];

  const instruments = [
    'piano', 'guitar', 'drums', 'bass', 'violin', 'trumpet', 'saxophone', 'flute', 'synthesizer', 'vocals'
  ];

  return (
    <div className="style-panel p-4 space-y-6">
      <h3 className="text-lg font-semibold text-white">Musical Style</h3>

      {/* Style Prompt */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Style Description
        </label>
        <textarea
          value={state.style.prompt}
          onChange={(e) => handleStyleChange('prompt', e.target.value)}
          className="w-full h-20 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-purple-500"
          placeholder="Describe the musical style you want... (e.g., 'Dark Florida Drill, no chorus, heavy bass, aggressive drums')"
        />
      </div>

      {/* Genre Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Genre
        </label>
        <select
          value={state.style.genre}
          onChange={(e) => handleStyleChange('genre', e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          {genres.map(genre => (
            <option key={genre} value={genre} className="capitalize">
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Mood Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Mood
        </label>
        <select
          value={state.style.mood}
          onChange={(e) => handleStyleChange('mood', e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
        >
          {moods.map(mood => (
            <option key={mood} value={mood} className="capitalize">
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Instrument Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Instruments
        </label>
        <div className="grid grid-cols-2 gap-2">
          {instruments.map(instrument => (
            <label key={instrument} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.style.instruments.includes(instrument)}
                onChange={(e) => {
                  const newInstruments = e.target.checked
                    ? [...state.style.instruments, instrument]
                    : state.style.instruments.filter(i => i !== instrument);
                  handleStyleChange('instruments', newInstruments);
                }}
                className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-slate-300 capitalize">{instrument}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Style Preview */}
      <div className="bg-slate-700/50 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Style Preview</h4>
        <div className="text-xs text-slate-300 space-y-1">
          <div><strong>Genre:</strong> {state.style.genre}</div>
          <div><strong>Mood:</strong> {state.style.mood}</div>
          <div><strong>Instruments:</strong> {state.style.instruments.join(', ')}</div>
          {state.style.prompt && (
            <div><strong>Description:</strong> {state.style.prompt}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate Panel Component
function GeneratePanel() {
  const { state, actions } = useTimeline();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const newBlock = {
        blockType: 'generated',
        title: 'AI Generated Section',
        code: `// Generated based on style: ${state.style.genre}, ${state.style.mood}\n// Instruments: ${state.style.instruments.join(', ')}\n\nPLAY C4 FOR 0.5s AT 0.0s\nPLAY E4 FOR 0.5s AT 0.5s\nPLAY G4 FOR 0.5s AT 1.0s\nPLAY C5 FOR 1.0s AT 1.5s`,
        duration: 2.5,
        color: '#8b5cf6',
        startTime: state.timeline.totalDuration
      };
      
      actions.addBlock(newBlock);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="generate-panel p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">AI Generation</h3>
      
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Generate New Section</h4>
        <p className="text-xs text-slate-300 mb-4">
          Create a new musical section based on your lyrics and style preferences.
        </p>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isGenerating
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
          }`}
        >
          {isGenerating ? '✨ Generating...' : '✨ Generate Section'}
        </button>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full py-2 px-3 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors">
            🎵 Generate Intro
          </button>
          <button className="w-full py-2 px-3 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors">
            🎤 Generate Verse
          </button>
          <button className="w-full py-2 px-3 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors">
            🎶 Generate Chorus
          </button>
          <button className="w-full py-2 px-3 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors">
            🎸 Generate Bridge
          </button>
        </div>
      </div>
    </div>
  );
}
