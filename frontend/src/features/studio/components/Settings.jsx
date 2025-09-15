import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Volume2, 
  Keyboard, 
  Mouse, 
  Monitor, 
  Headphones,
  Mic,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Zap,
  Brain,
  Music,
  Code,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../../Auth';

export function Settings() {
  const { user, signOut } = useAuth();
  
  const [settings, setSettings] = useState({
    // Audio Settings
    audio: {
      sampleRate: 44100,
      bufferSize: 512,
      latency: 128,
      masterVolume: 80,
      monitorVolume: 60,
      inputGain: 0,
      outputGain: 0,
      enableMonitoring: true,
      enableMetronome: true,
      metronomeVolume: 50,
      metronomeBPM: 120
    },
    // UI Settings
    ui: {
      theme: 'dark',
      accentColor: 'blue',
      fontSize: 'medium',
      density: 'comfortable',
      showGrid: true,
      snapToGrid: true,
      gridResolution: 16,
      zoomLevel: 100,
      showWaveforms: true,
      showSpectrum: false,
      showPianoRoll: true,
      showTimeline: true,
      showTransport: true,
      showInspector: true
    },
    // Keyboard Shortcuts
    shortcuts: {
      playPause: 'Space',
      stop: 'Escape',
      record: 'R',
      undo: 'Ctrl+Z',
      redo: 'Ctrl+Y',
      copy: 'Ctrl+C',
      paste: 'Ctrl+V',
      cut: 'Ctrl+X',
      selectAll: 'Ctrl+A',
      delete: 'Delete',
      duplicate: 'Ctrl+D',
      quantize: 'Q',
      snapToGrid: 'G'
    },
    // AI Settings
    ai: {
      enableAI: true,
      aiModel: 'muzic-enhanced',
      autoSuggestions: true,
      smartQuantize: true,
      harmonicAnalysis: true,
      tempoDetection: true,
      keyDetection: true,
      stemSeparation: false,
      realTimeProcessing: false,
      confidenceThreshold: 0.8
    },
    // Collaboration
    collaboration: {
      enableRealTime: false,
      showCursors: true,
      showUserNames: true,
      autoSave: true,
      saveInterval: 30,
      conflictResolution: 'manual',
      shareAudio: false,
      shareVideo: false
    },
    // Export/Import
    export: {
      defaultFormat: 'midi',
      includeMetadata: true,
      includeAnalysis: true,
      compressionLevel: 'medium',
      bitDepth: 24,
      sampleRate: 44100,
      channels: 'stereo'
    },
    // Privacy & Security
    privacy: {
      analytics: true,
      crashReports: true,
      usageData: false,
      shareProjects: false,
      publicProfile: false,
      twoFactorAuth: false,
      sessionTimeout: 60
    }
  });

  const [activeTab, setActiveTab] = useState('audio');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    // Save to localStorage or backend
    localStorage.setItem('chordcraft-settings', JSON.stringify(settings));
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default settings
      setHasUnsavedChanges(true);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chordcraft-settings.json';
    link.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasUnsavedChanges(true);
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <SettingsIcon className="w-6 h-6 mr-2 text-slate-400" />
            Settings
          </h2>
          <p className="text-slate-400">Customize your ChordCraft experience</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={!hasUnsavedChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="collaboration">Collaborate</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="w-5 h-5 mr-2 text-blue-400" />
                  Audio Configuration
                </CardTitle>
                <CardDescription>
                  Configure audio input/output and processing settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Sample Rate</Label>
                      <Select 
                        value={settings.audio.sampleRate.toString()} 
                        onValueChange={(value) => updateSetting('audio', 'sampleRate', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="44100">44.1 kHz</SelectItem>
                          <SelectItem value="48000">48 kHz</SelectItem>
                          <SelectItem value="88200">88.2 kHz</SelectItem>
                          <SelectItem value="96000">96 kHz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Buffer Size</Label>
                      <Select 
                        value={settings.audio.bufferSize.toString()} 
                        onValueChange={(value) => updateSetting('audio', 'bufferSize', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="256">256 samples</SelectItem>
                          <SelectItem value="512">512 samples</SelectItem>
                          <SelectItem value="1024">1024 samples</SelectItem>
                          <SelectItem value="2048">2048 samples</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Master Volume: {settings.audio.masterVolume}%</Label>
                      <Slider
                        value={[settings.audio.masterVolume]}
                        onValueChange={([value]) => updateSetting('audio', 'masterVolume', value)}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Monitoring</Label>
                      <Switch
                        checked={settings.audio.enableMonitoring}
                        onCheckedChange={(checked) => updateSetting('audio', 'enableMonitoring', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable Metronome</Label>
                      <Switch
                        checked={settings.audio.enableMetronome}
                        onCheckedChange={(checked) => updateSetting('audio', 'enableMetronome', checked)}
                      />
                    </div>
                    <div>
                      <Label>Metronome BPM: {settings.audio.metronomeBPM}</Label>
                      <Slider
                        value={[settings.audio.metronomeBPM]}
                        onValueChange={([value]) => updateSetting('audio', 'metronomeBPM', value)}
                        min={60}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ui" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-purple-400" />
                  Interface Settings
                </CardTitle>
                <CardDescription>
                  Customize the appearance and behavior of the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Theme</Label>
                      <Select 
                        value={settings.ui.theme} 
                        onValueChange={(value) => updateSetting('ui', 'theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <Select 
                        value={settings.ui.accentColor} 
                        onValueChange={(value) => updateSetting('ui', 'accentColor', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Font Size</Label>
                      <Select 
                        value={settings.ui.fontSize} 
                        onValueChange={(value) => updateSetting('ui', 'fontSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Grid</Label>
                      <Switch
                        checked={settings.ui.showGrid}
                        onCheckedChange={(checked) => updateSetting('ui', 'showGrid', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Snap to Grid</Label>
                      <Switch
                        checked={settings.ui.snapToGrid}
                        onCheckedChange={(checked) => updateSetting('ui', 'snapToGrid', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Waveforms</Label>
                      <Switch
                        checked={settings.ui.showWaveforms}
                        onCheckedChange={(checked) => updateSetting('ui', 'showWaveforms', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Piano Roll</Label>
                      <Switch
                        checked={settings.ui.showPianoRoll}
                        onCheckedChange={(checked) => updateSetting('ui', 'showPianoRoll', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Keyboard className="w-5 h-5 mr-2 text-green-400" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Customize keyboard shortcuts for faster workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(settings.shortcuts).map(([action, shortcut]) => (
                    <div key={action} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                      <Label className="capitalize">{action.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <div className="flex items-center space-x-2">
                        <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm">
                          {shortcut}
                        </kbd>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI features and processing options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable AI Features</Label>
                      <Switch
                        checked={settings.ai.enableAI}
                        onCheckedChange={(checked) => updateSetting('ai', 'enableAI', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto Suggestions</Label>
                      <Switch
                        checked={settings.ai.autoSuggestions}
                        onCheckedChange={(checked) => updateSetting('ai', 'autoSuggestions', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Smart Quantize</Label>
                      <Switch
                        checked={settings.ai.smartQuantize}
                        onCheckedChange={(checked) => updateSetting('ai', 'smartQuantize', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Harmonic Analysis</Label>
                      <Switch
                        checked={settings.ai.harmonicAnalysis}
                        onCheckedChange={(checked) => updateSetting('ai', 'harmonicAnalysis', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>AI Model</Label>
                      <Select 
                        value={settings.ai.aiModel} 
                        onValueChange={(value) => updateSetting('ai', 'aiModel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="muzic-enhanced">Muzic Enhanced</SelectItem>
                          <SelectItem value="muzic-basic">Muzic Basic</SelectItem>
                          <SelectItem value="openai-music">OpenAI Music</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Confidence Threshold: {Math.round(settings.ai.confidenceThreshold * 100)}%</Label>
                      <Slider
                        value={[settings.ai.confidenceThreshold]}
                        onValueChange={([value]) => updateSetting('ai', 'confidenceThreshold', value)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-400" />
                  Collaboration Settings
                </CardTitle>
                <CardDescription>
                  Configure real-time collaboration features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Real-time Collaboration</Label>
                      <Switch
                        checked={settings.collaboration.enableRealTime}
                        onCheckedChange={(checked) => updateSetting('collaboration', 'enableRealTime', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show User Cursors</Label>
                      <Switch
                        checked={settings.collaboration.showCursors}
                        onCheckedChange={(checked) => updateSetting('collaboration', 'showCursors', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show User Names</Label>
                      <Switch
                        checked={settings.collaboration.showUserNames}
                        onCheckedChange={(checked) => updateSetting('collaboration', 'showUserNames', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto Save</Label>
                      <Switch
                        checked={settings.collaboration.autoSave}
                        onCheckedChange={(checked) => updateSetting('collaboration', 'autoSave', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Save Interval (seconds)</Label>
                      <Input
                        type="number"
                        value={settings.collaboration.saveInterval}
                        onChange={(e) => updateSetting('collaboration', 'saveInterval', parseInt(e.target.value))}
                        min={10}
                        max={300}
                      />
                    </div>
                    <div>
                      <Label>Conflict Resolution</Label>
                      <Select 
                        value={settings.collaboration.conflictResolution} 
                        onValueChange={(value) => updateSetting('collaboration', 'conflictResolution', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="last-writer-wins">Last Writer Wins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy settings and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Analytics</Label>
                      <Switch
                        checked={settings.privacy.analytics}
                        onCheckedChange={(checked) => updateSetting('privacy', 'analytics', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Crash Reports</Label>
                      <Switch
                        checked={settings.privacy.crashReports}
                        onCheckedChange={(checked) => updateSetting('privacy', 'crashReports', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Usage Data</Label>
                      <Switch
                        checked={settings.privacy.usageData}
                        onCheckedChange={(checked) => updateSetting('privacy', 'usageData', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Share Projects</Label>
                      <Switch
                        checked={settings.privacy.shareProjects}
                        onCheckedChange={(checked) => updateSetting('privacy', 'shareProjects', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Two-Factor Authentication</Label>
                      <Switch
                        checked={settings.privacy.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting('privacy', 'twoFactorAuth', checked)}
                      />
                    </div>
                    <div>
                      <Label>Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.privacy.sessionTimeout}
                        onChange={(e) => updateSetting('privacy', 'sessionTimeout', parseInt(e.target.value))}
                        min={5}
                        max={480}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, import, or manage your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={exportSettings}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('import-settings').click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Settings
                  </Button>
                  <input
                    id="import-settings"
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Export Projects
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
