import React, { useState } from "react";
import { AuthProvider, useAuth } from "./components/Auth";
import { AudioEngineProvider } from "./services/AudioEngine";
import { Header } from "./components/Header";
import { LeftPanel } from "./components/LeftPanel";
import { MainPanel } from "./components/MainPanel";
import { RightPanel } from "./components/RightPanel";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { ResponsiveLayout } from "./components/ResponsiveLayout";
import { Analytics } from "@vercel/analytics/react";

interface Track {
  id: string;
  name: string;
  type: "audio" | "midi";
  duration: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  generatedCode?: string;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"landing" | "login" | "studio">("landing");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Debug logging
  console.log('AppContent render:', { user, loading, currentView });

  // Show loading spinner while checking auth
  if (loading) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If user is authenticated, show studio
  if (user) {
    return (
      <>
        <ResponsiveLayout
          header={<Header onShowSubscription={() => setShowSubscriptionModal(true)} />}
          leftPanel={
            <LeftPanel 
              currentTrack={currentTrack}
              setCurrentTrack={setCurrentTrack}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          }
          mainPanel={
            <MainPanel 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
            />
          }
          rightPanel={<RightPanel />}
        />

        {/* Subscription Modal */}
        <SubscriptionModal 
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        />
      </>
    );
  }

  // Show login page
  if (currentView === "login") {
    return <Login onBack={() => setCurrentView("landing")} />;
  }

  // Show landing page
  return <LandingPage onEnterStudio={() => setCurrentView("login")} />;
}

export default function App() {
  console.log('App component rendering');
  
  return (
    <AuthProvider>
      <AudioEngineProvider>
        <AppContent />
        <Analytics />
      </AudioEngineProvider>
    </AuthProvider>
  );
}