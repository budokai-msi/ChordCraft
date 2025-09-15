import React from 'react';
import { TransportControls } from './components/TransportControls';
import { LeftPanel } from './components/LeftPanel';
import { MainPanel } from './components/MainPanel';
import { BottomPanel } from './components/BottomPanel';
import { useAuth } from '../../Auth';

// The main Studio component using the new enterprise architecture
export function Studio() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* Header / Transport Bar */}
      <TransportControls userEmail={user?.email} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel (Tracks / Inspector) */}
        <LeftPanel />

        {/* Center Panel (Timeline / Piano Roll) */}
        <MainPanel />
      </div>

      {/* Bottom Panel (Code Editor / Analysis) */}
      <BottomPanel />
    </div>
  );
}
