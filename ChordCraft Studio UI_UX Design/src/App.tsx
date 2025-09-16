import { useState } from "react";
import { Header } from "./components/Header";
import { LeftPanel } from "./components/LeftPanel";
import { MainPanel } from "./components/MainPanel";
import { RightPanel } from "./components/RightPanel";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { LandingPage } from "./components/LandingPage";
import { ResponsiveLayout } from "./components/ResponsiveLayout";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "studio">("landing");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (currentView === "landing") {
    return (
      <LandingPage onEnterStudio={() => setCurrentView("studio")} />
    );
  }

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