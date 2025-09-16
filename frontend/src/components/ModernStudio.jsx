import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Volume2, Settings, Music, Bot, FolderOpen } from 'lucide-react';
import AudioUpload from './AudioUpload';
import Timeline from './Timeline';
import TrackManager from './TrackManager';
import AICompanion from './AICompanion';
import ProjectManager from './ProjectManager';
import SubscriptionModal from './SubscriptionModal';

export default function ModernStudio() {
  const [isPro, setIsPro] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true);
  };

  const handleUpgradeComplete = () => {
    setIsPro(true);
    console.log('[ModernStudio] User upgraded to PRO successfully');
  };

  const handleAnalysisComplete = (result) => {
    console.log('[ModernStudio] Audio analysis completed:', result);
    // Handle the analysis result - could update the timeline, generate code, etc.
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="studio-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">ChordCraft Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPro ? (
            <Badge className="pro-badge">PRO User</Badge>
          ) : (
            <Button className="upgrade-button" onClick={handleUpgradeClick}>
              Upgrade to PRO
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Studio Interface */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Left Panel - Track Management */}
        <div className="w-80 studio-panel">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-3">Track Manager</h2>
            <AudioUpload isPro={isPro} onAnalysisComplete={handleAnalysisComplete} />
          </div>
          <div className="p-4">
            <TrackManager />
          </div>
        </div>

        {/* Center Panel - Timeline */}
        <div className="flex-1 studio-panel">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Timeline</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 flex-1">
            <Timeline isPlaying={isPlaying} />
          </div>
        </div>

        {/* Right Panel - Tabbed Interface */}
        <div className="w-96 studio-panel">
          <Tabs defaultValue="ai-companion" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="ai-companion" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Companion
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-companion" className="flex-1 m-4 mt-2">
              <AICompanion isPro={isPro} />
            </TabsContent>

            <TabsContent value="projects" className="flex-1 m-4 mt-2">
              <ProjectManager isPro={isPro} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onUpgrade={handleUpgradeComplete}
      />
    </div>
  );
}
