import { useState, useEffect } from 'react';
import { Settings, Volume2, Music, Palette, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ChordCraftCookies, CookieConsentManager } from '../utils/cookies';

interface UserPreferencesProps {
  onClose?: () => void;
}

export function UserPreferences({ onClose }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState({
    theme: 'auto' as 'light' | 'dark' | 'auto',
    volume: 0.7,
    tempo: 120,
    key: 'C',
    instrument: 'piano',
    autoSave: true,
    showTutorials: true,
    enableHaptics: true,
    language: 'en'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load preferences from cookies
    if (CookieConsentManager.canUsePreferences()) {
      const savedTheme = ChordCraftCookies.getTheme();
      const savedAudio = ChordCraftCookies.getAudioSettings();
      const savedPrefs = {
        theme: ChordCraftCookies.getUserPreference('theme', 'auto'),
        volume: savedAudio?.volume ?? 0.7,
        tempo: savedAudio?.tempo ?? 120,
        key: savedAudio?.key ?? 'C',
        instrument: savedAudio?.instrument ?? 'piano',
        autoSave: ChordCraftCookies.getUserPreference('autoSave', true),
        showTutorials: ChordCraftCookies.getUserPreference('showTutorials', true),
        enableHaptics: ChordCraftCookies.getUserPreference('enableHaptics', true),
        language: ChordCraftCookies.getUserPreference('language', 'en')
      };
      setPreferences(savedPrefs);
    }
  }, []);

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    if (!CookieConsentManager.canUsePreferences()) {
      alert('Please enable preference cookies to save your settings.');
      return;
    }

    // Save theme
    ChordCraftCookies.setTheme(preferences.theme);
    
    // Save audio settings
    ChordCraftCookies.setAudioSettings({
      volume: preferences.volume,
      tempo: preferences.tempo,
      key: preferences.key,
      instrument: preferences.instrument
    });

    // Save other preferences
    ChordCraftCookies.setUserPreference('autoSave', preferences.autoSave);
    ChordCraftCookies.setUserPreference('showTutorials', preferences.showTutorials);
    ChordCraftCookies.setUserPreference('enableHaptics', preferences.enableHaptics);
    ChordCraftCookies.setUserPreference('language', preferences.language);

    setHasChanges(false);
    
    // Apply theme immediately
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto theme - follow system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      theme: 'auto' as const,
      volume: 0.7,
      tempo: 120,
      key: 'C',
      instrument: 'piano',
      autoSave: true,
      showTutorials: true,
      enableHaptics: true,
      language: 'en'
    };
    setPreferences(defaults);
    setHasChanges(true);
  };

  return (
    <Card className="w-full max-w-2xl bg-slate-900/95 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">User Preferences</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="font-medium text-white">Appearance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Theme</label>
              <Select value={preferences.theme} onValueChange={(value: any) => updatePreference('theme', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Language</label>
              <Select value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Audio Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-green-400" />
            <h3 className="font-medium text-white">Audio Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Master Volume: {Math.round(preferences.volume * 100)}%
              </label>
              <Slider
                value={[preferences.volume]}
                onValueChange={([value]) => updatePreference('volume', value)}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Default Tempo</label>
                <Select value={preferences.tempo.toString()} onValueChange={(value) => updatePreference('tempo', parseInt(value))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 BPM</SelectItem>
                    <SelectItem value="80">80 BPM</SelectItem>
                    <SelectItem value="100">100 BPM</SelectItem>
                    <SelectItem value="120">120 BPM</SelectItem>
                    <SelectItem value="140">140 BPM</SelectItem>
                    <SelectItem value="160">160 BPM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Default Key</label>
                <Select value={preferences.key} onValueChange={(value) => updatePreference('key', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C Major</SelectItem>
                    <SelectItem value="G">G Major</SelectItem>
                    <SelectItem value="D">D Major</SelectItem>
                    <SelectItem value="A">A Major</SelectItem>
                    <SelectItem value="E">E Major</SelectItem>
                    <SelectItem value="B">B Major</SelectItem>
                    <SelectItem value="F#">F# Major</SelectItem>
                    <SelectItem value="C#">C# Major</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Default Instrument</label>
              <Select value={preferences.instrument} onValueChange={(value) => updatePreference('instrument', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piano">Piano</SelectItem>
                  <SelectItem value="guitar">Guitar</SelectItem>
                  <SelectItem value="violin">Violin</SelectItem>
                  <SelectItem value="trumpet">Trumpet</SelectItem>
                  <SelectItem value="saxophone">Saxophone</SelectItem>
                  <SelectItem value="drums">Drums</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* General Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-yellow-400" />
            <h3 className="font-medium text-white">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white">Auto-save projects</label>
                <p className="text-xs text-slate-400">Automatically save your work as you create</p>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) => updatePreference('autoSave', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white">Show tutorials</label>
                <p className="text-xs text-slate-400">Display helpful tips and guides</p>
              </div>
              <Switch
                checked={preferences.showTutorials}
                onCheckedChange={(checked) => updatePreference('showTutorials', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white">Enable haptic feedback</label>
                <p className="text-xs text-slate-400">Vibrate on touch interactions (mobile)</p>
              </div>
              <Switch
                checked={preferences.enableHaptics}
                onCheckedChange={(checked) => updatePreference('enableHaptics', checked)}
              />
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={savePreferences}
            disabled={!hasChanges}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>

        {!CookieConsentManager.canUsePreferences() && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              ⚠️ Preference cookies are disabled. Enable them in cookie settings to save your preferences.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
