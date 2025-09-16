import { useState } from "react";
import { AuthProvider, useAuth } from "./components/Auth";
import { Header } from "./components/Header";
import { LeftPanel } from "./components/LeftPanel";
import { MainPanel } from "./components/MainPanel";
import { RightPanel } from "./components/RightPanel";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { ResponsiveLayout } from "./components/ResponsiveLayout";

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"landing" | "login" | "studio">("landing");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Show loading spinner while checking auth
  if (loading) {
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}