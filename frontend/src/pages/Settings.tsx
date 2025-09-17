"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChordCraftStore } from '../store/useChordCraftStore';
import { HapticButton } from '../components/HapticButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useChordCraftStore();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const handleBackendUrlChange = (value: string) => {
    setLocalSettings(prev => ({ ...prev, backendUrl: value }));
  };

  const handleUseNativeFlacChange = (checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, useNativeFlac: checked }));
  };

  const handleLoadFfmpegOnDemandChange = (checked: boolean) => {
    setLocalSettings(prev => ({ ...prev, loadFfmpegOnDemand: checked }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <HapticButton
              onClick={() => navigate('/')}
              variant="outline"
              hapticType="light"
              className="w-10 h-10 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </HapticButton>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backend Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Backend Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backend-url">Backend URL</Label>
                <Input
                  id="backend-url"
                  value={localSettings.backendUrl}
                  onChange={(e) => handleBackendUrlChange(e.target.value)}
                  placeholder="http://127.0.0.1:5000"
                  className="font-mono"
                />
                <p className="text-xs text-slate-400">
                  URL of your ChordCraft backend server
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Audio Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Use Native FLAC Decoding</Label>
                  <p className="text-xs text-slate-400">
                    Try browser's native FLAC support first
                  </p>
                </div>
                <Switch
                  checked={localSettings.useNativeFlac}
                  onCheckedChange={handleUseNativeFlacChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Load ffmpeg.wasm On Demand</Label>
                  <p className="text-xs text-slate-400">
                    Only load when needed for FLAC fallback
                  </p>
                </div>
                <Switch
                  checked={localSettings.loadFfmpegOnDemand}
                  onCheckedChange={handleLoadFfmpegOnDemandChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">ffmpeg.wasm</span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Checksum Engine</span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio Context</span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Available
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <HapticButton
                  onClick={handleSave}
                  hapticType="medium"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saved ? 'Saved!' : 'Save Settings'}
                </HapticButton>
                
                <HapticButton
                  onClick={handleReset}
                  variant="outline"
                  hapticType="light"
                >
                  <RotateCcw className="w-4 h-4" />
                </HapticButton>
              </div>
              
              <div className="text-xs text-slate-400">
                Settings are automatically saved to your browser's local storage.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Advanced Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-white">Environment Variables</h4>
                <div className="bg-slate-800 rounded p-3 font-mono text-xs">
                  <div>VITE_BACKEND_URL={localSettings.backendUrl}</div>
                  <div>VITE_USE_NATIVE_FLAC={localSettings.useNativeFlac.toString()}</div>
                  <div>VITE_LOAD_FFMPEG_ON_DEMAND={localSettings.loadFfmpegOnDemand.toString()}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-white">Performance</h4>
                <div className="space-y-1 text-slate-400">
                  <div>• Chunk size: 92KB main bundle</div>
                  <div>• CDN: unpkg.com for ffmpeg.wasm</div>
                  <div>• Memory: Auto-cleanup after decode</div>
                  <div>• Workers: FLAC transcoding offloaded</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
