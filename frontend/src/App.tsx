"use client";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AudioEngineProvider } from './services/AudioEngine';
import UploadPage from './pages/Upload';
import StudioPage from './pages/Studio';
import SettingsPage from './pages/Settings';
import LibraryPage from './pages/Library';

function App() {
  return (
    <AudioEngineProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Analytics />
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AudioEngineProvider>
  );
}

export default App;