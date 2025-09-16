import React, { useState } from 'react';
import { useAuth } from '../../Auth';
import { SimpleFileUpload } from '../../components/SimpleFileUpload';
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
  Activity,
  FileAudio,
  Volume2,
  Eye,
  EyeOff,
  Trash2,
  Send
} from 'lucide-react';

export function EnhancedStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('studio');
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Melody Synth', notes: 0, isPlaying: false, isMuted: false, isVisible: true }
  ]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = (result) => {
    console.log('File uploaded:', result);
    // Add a new track for the uploaded file
    const newTrack = {
      id: Date.now(),
      name: result.fileName || 'New Track',
      notes: 0,
      isPlaying: false,
      isMuted: false,
      isVisible: true
    };
    setTracks(prev => [...prev, newTrack]);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleTrackMute = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    ));
  };

  const toggleTrackVisibility = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, isVisible: !track.isVisible } : track
    ));
  };

  const deleteTrack = (trackId) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  };

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
            <div className="flex items-center space-x-3 px-4 py-2 glass-pane rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{user?.email || 'User'}</p>
                <p className="text-xs text-green-400">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="h-12 glass-pane border-b border-white/10 shrink-0">
        <div className="flex items-center h-full px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-0 p-0 space-x-1">
              <TabsTrigger 
                value="studio" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'studio' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Music className="w-4 h-4 mr-2" />
                Studio
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'ai' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Companion
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'projects' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="collaborate" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'collaborate' 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Collaborate
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30 neon-glow' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} className="w-full h-full">
          <TabsContent value="studio" className="h-full m-0 p-0">
            <div className="flex h-full">
              {/* Left Panel */}
              <div className="w-80 glass-pane border-r border-white/10 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Audio Upload */}
                  <SimpleFileUpload 
                    onAnalysisComplete={handleFileUpload}
                    className="mb-6"
                  />

                  {/* Tracks */}
                  <Card className="glass-pane">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Music className="w-5 h-5 mr-2 text-blue-400" />
                        Tracks ({tracks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tracks.map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-3 glass-pane rounded-lg hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setTracks(prev => prev.map(t => 
                                t.id === track.id ? { ...t, isPlaying: !t.isPlaying } : t
                              ))}
                              className="p-1"
                            >
                              {track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <FileAudio className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-sm">{track.name}</p>
                              <p className="text-xs text-slate-400">{track.notes} notes</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleTrackVisibility(track.id)}
                              className="p-1"
                            >
                              {track.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleTrackMute(track.id)}
                              className="p-1"
                            >
                              {track.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTrack(track.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Inspector */}
                  <Card className="glass-pane">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Settings className="w-5 h-5 mr-2 text-purple-400" />
                        Inspector
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-400 text-sm">
                          Select a note to inspect
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Panel - Timeline */}
              <div className="flex-1 flex flex-col">
                {/* Transport Controls */}
                <div className="h-16 glass-pane border-b border-white/10 flex items-center justify-center px-6">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 neon-glow"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Square className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>BPM: 120</span>
                      <span>•</span>
                      <span>4/4</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Grid */}
                <div className="flex-1 p-6">
                  <div className="h-full glass-pane rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 relative">
                      {/* Grid Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-16 gap-0 h-full">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="border-r border-slate-600"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Note Labels */}
                      <div className="absolute left-0 top-0 w-16 h-full border-r border-slate-600 bg-slate-800/50">
                        <div className="p-2 space-y-1">
                          {['C8', 'B7', 'A#7', 'A7', 'G#7', 'G7', 'F#7', 'F7', 'E7', 'D#7', 'D7', 'C#7', 'C7'].map((note, i) => (
                            <div key={note} className="text-xs text-slate-400 text-center py-1">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline Area */}
                      <div className="ml-16 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Music className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                          <p className="text-slate-400 text-lg">Timeline</p>
                          <p className="text-slate-500 text-sm">Click to add notes or drag to create melodies</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Brain className="w-6 h-6 mr-3 text-purple-400 pulse-glow" />
                  AI Music Companion
                </CardTitle>
                <CardDescription className="text-lg">
                  Your intelligent co-creator for music production
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Advanced AI
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Real-time
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Music className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Conversation</h3>
                    <div className="h-64 glass-pane rounded-lg p-4 overflow-y-auto">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-300">
                              🎵 Hello! I'm your AI music companion. I can help you create, analyze, and enhance your music. What would you like to work on today?
                            </p>
                            <p className="text-xs text-slate-500 mt-1">7:23:40 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 justify-end">
                          <div className="flex-1 text-right">
                            <p className="text-sm bg-blue-500/20 text-blue-300 p-2 rounded-lg inline-block">
                              Generate an ambient pad progression
                            </p>
                            <p className="text-xs text-slate-500 mt-1">7:23:45 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-red-300">
                              ❌ Sorry, I encountered an error: AI generation failed. Please try again with a different prompt.
                            </p>
                            <p className="text-xs text-slate-500 mt-1">7:23:46 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Describe the music you want to create..."
                        className="flex-1 px-3 py-2 glass-pane rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                      <Button className="px-6">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <FolderOpen className="w-6 h-6 mr-3 text-green-400 pulse-glow" />
                  Project Manager
                </CardTitle>
                <CardDescription className="text-lg">
                  Organize and manage your music projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">No projects yet</p>
                  <p className="text-slate-500 text-sm">Create your first project to get started</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborate" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Users className="w-6 h-6 mr-3 text-orange-400 pulse-glow" />
                  Real-time Collaboration
                </CardTitle>
                <CardDescription className="text-lg">
                  Work together with your team in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">Collaboration features coming soon</p>
                  <p className="text-slate-500 text-sm">Invite team members and create music together</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 p-6">
            <Card className="h-full glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <SettingsIcon className="w-6 h-6 mr-3 text-slate-400 pulse-glow" />
                  Settings
                </CardTitle>
                <CardDescription className="text-lg">
                  Configure your ChordCraft Studio experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <SettingsIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">Settings panel coming soon</p>
                  <p className="text-slate-500 text-sm">Customize your workspace and preferences</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Panel */}
      <div className="h-32 glass-pane border-t border-white/10 shrink-0 p-6">
        <Tabs defaultValue="code" className="h-full">
          <TabsList className="bg-transparent border-0 p-0 mb-4">
            <TabsTrigger value="code" className="px-4 py-2 rounded-lg">Code Editor</TabsTrigger>
            <TabsTrigger value="analysis" className="px-4 py-2 rounded-lg">Music Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="h-full m-0">
            <div className="flex space-x-2 h-full">
              <textarea
                className="flex-1 glass-pane rounded-lg p-4 border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="// Your music code will appear here&#10;// Try: PLAY C4 FOR 1s AT 0s"
                defaultValue="// Your music code will appear here&#10;// Try: PLAY C4 FOR 1s AT 0s"
              />
              <div className="flex flex-col space-y-2">
                <Button className="px-4">
                  <Play className="w-4 h-4 mr-2" />
                  Play Code
                </Button>
                <Button variant="outline" className="px-4">
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Code
                </Button>
                <Button variant="outline" className="px-4">
                  <Save className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="analysis" className="h-full m-0">
            <div className="h-full glass-pane rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <p className="text-slate-400">Music analysis will appear here</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
