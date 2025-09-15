import React, { useState } from 'react';
import { useTimeline } from './TimelineContext';

export function LyricsStyleEditor() {
  const { lyrics, setLyrics, style, setStyle } = useTimeline();
  const [activeTab, setActiveTab] = useState('lyrics');

  const handleLyricsChange = (e) => {
    setLyrics(e.target.value);
  };

  const handleStyleChange = (e) => {
    setStyle(e.target.value);
  };

  const handleReplaceLyrics = () => {
    // Placeholder for replace lyrics functionality
    alert('Replace lyrics functionality coming soon!');
  };

  const handleExcludeStyles = () => {
    // Placeholder for exclude styles functionality
    alert('Exclude styles functionality coming soon!');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'lyrics'
              ? 'text-white border-b-2 border-blue-500 bg-gray-800/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
          }`}
          onClick={() => setActiveTab('lyrics')}
        >
          Lyrics
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === 'style'
              ? 'text-white border-b-2 border-blue-500 bg-gray-800/50'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
          }`}
          onClick={() => setActiveTab('style')}
        >
          Styles
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'lyrics' && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song Lyrics
              </label>
              <textarea
                value={lyrics}
                onChange={handleLyricsChange}
                placeholder="[Intro, Muffled Bass + Silencer Click]
Bradenton, Bay Dr...
941 - not safe
You talkin'? Then I'm walkin.

[Verse 1 - Static Pressure]
I'm a drilla - not for play
She text bold, I text decay
Still hit her phone just to ruin her day
Just to show she a mark that'll never escape
I don't move for the clout - I move for the kill
You post for likes - I post on the real
Bay Dr silent, I walk with the night
Addie in blood, got my focus right"
                className="w-full h-64 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={handleReplaceLyrics}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Replace Lyrics
            </button>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Musical Style
              </label>
              <textarea
                value={style}
                onChange={handleStyleChange}
                placeholder="Style: Dark Florida Drill, no chorus, full-pressure stream of bars, dead-eyed energy, no emotions, just order"
                className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={handleExcludeStyles}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Exclude Styles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}