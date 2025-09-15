import React, { useState } from 'react';
import { useAuth } from '../../Auth';
import { TransportControls } from './components/TransportControls';
import { LeftPanel } from './components/LeftPanel';
import { MainPanel } from './components/MainPanel';
import { BottomPanel } from './components/BottomPanel';
import { AICompanion } from './components/AICompanion';
import { ProjectManager } from './components/ProjectManager';
import { Settings } from './components/Settings';
import { FileUpload } from '../../components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Music, 
  Sparkles, 
  FolderOpen, 
  Settings as SettingsIcon,
  Users,
  Download,
  Upload,
  Share2,
  Zap,
  Brain,
  Mic,
  Headphones,
  Play,
  Pause,
  Square,
  Save,
  Bell,
  Activity
} from 'lucide-react';

export function Studio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('studio');
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  return (
    <div className="flex flex-col h-screen w-screen animated-bg text-white font-sans overflow-hidden">
      {/* Professional Header */}
      <header className="h-16 glass-pane border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg neon-glow">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold vibrant-gradient-text">
                  ChordCraft Studio
                </h1>
                <p className="text-xs text-slate-300">Professional Music Production</p>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 neon-glow">
                <Zap className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Brain className="w-3 h-3 mr-1" />
                Muzic AI
              </Badge>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Collaboration Status */}
            {isCollaborating && (
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Users className="w-4 h-4" />
                <span>{onlineUsers} online</span>
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hover:bg-slate-700/50">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-slate-700/50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-slate-700/50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-medium neon-glow-pink">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.email || 'Guest'}</p>
                <p className="text-xs text-slate-400">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <TabsList className="shrink-0 glass-pane border-b border-white/10 rounded-none h-16 px-6">
            <TabsTrigger value="studio" className="flex items-center space-x-2 data-[state=active]:bg-slate-700/50 text-base px-6 py-3">
              <Music className="w-5 h-5" />
              <span>Studio</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2 data-[state=active]:bg-slate-700/50 text-base px-6 py-3">
              <Sparkles className="w-5 h-5" />
              <span>AI Companion</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2 data-[state=active]:bg-slate-700/50 text-base px-6 py-3">
              <FolderOpen className="w-5 h-5" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="flex items-center space-x-2 data-[state=active]:bg-slate-700/50 text-base px-6 py-3">
              <Users className="w-5 h-5" />
              <span>Collaborate</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-slate-700/50 text-base px-6 py-3">
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="studio" className="h-full m-0 p-0">
              <div className="flex h-full">
                {/* Left Panel (Tracks / Inspector) */}
                <LeftPanel />

                {/* Center Panel (Timeline / Piano Roll) */}
                <MainPanel />
              </div>
            </TabsContent>

            <TabsContent value="ai" className="h-full m-0 p-6">
              <AICompanion />
            </TabsContent>

            <TabsContent value="projects" className="h-full m-0 p-6">
              <ProjectManager />
            </TabsContent>

            <TabsContent value="collaborate" className="h-full m-0 p-6">
              <div className="h-full flex flex-col">
                <Card className="mb-6 glass-pane">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Users className="w-6 h-6 mr-3 text-blue-400 pulse-glow" />
                      Real-time Collaboration
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Work together with your team in real-time. Share projects, chat, and create music together.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Active Sessions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 glass-pane rounded-xl hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center neon-glow">
                                <Activity className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-lg">Main Project</p>
                                <p className="text-sm text-slate-400">3 collaborators</p>
                              </div>
                            </div>
                            <Button className="btn-primary">
                              <Users className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 glass-pane rounded-xl hover:scale-105 transition-transform duration-300">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-lg">Jazz Session</p>
                                <p className="text-sm text-slate-400">2 collaborators</p>
                              </div>
                            </div>
                            <Button variant="outline" className="hover:bg-blue-500/20">
                              <Users className="w-4 h-4 mr-2" />
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Invite Team</h3>
                        <div className="space-y-3">
                          <Button className="w-full btn-primary text-lg py-4">
                            <Share2 className="w-5 h-5 mr-3" />
                            Share Project Link
                          </Button>
                          <Button variant="outline" className="w-full text-lg py-4 hover:bg-slate-700/50">
                            <Users className="w-5 h-5 mr-3" />
                            Invite by Email
                          </Button>
                          <Button variant="outline" className="w-full text-lg py-4 hover:bg-slate-700/50">
                            <Bell className="w-5 h-5 mr-3" />
                            Set Up Notifications
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Collaboration Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass-pane hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Mic className="w-5 h-5 mr-2 text-green-400" />
                        Voice Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">Communicate with your team in real-time while working on projects.</p>
                      <Button variant="outline" className="w-full hover:bg-green-500/20">
                        Start Voice Chat
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-pane hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Headphones className="w-5 h-5 mr-2 text-blue-400" />
                        Audio Sharing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">Share audio files and listen together with synchronized playback.</p>
                      <Button variant="outline" className="w-full hover:bg-blue-500/20">
                        Share Audio
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-pane hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Save className="w-5 h-5 mr-2 text-purple-400" />
                        Version Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">Track changes, create branches, and merge updates seamlessly.</p>
                      <Button variant="outline" className="w-full hover:bg-purple-500/20">
                        View History
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0 p-6">
              <Settings />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Bottom Panel (Code Editor / Analysis) */}
      <BottomPanel />
    </div>
  );
}