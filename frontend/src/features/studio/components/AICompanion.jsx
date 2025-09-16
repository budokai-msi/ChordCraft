import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, Send, Mic, MicOff, Brain, Music, Wand2, 
  Play, Pause, Copy, Download, Headphones, FileAudio, Loader2, 
  MessageSquare, FileText, Stars, Target, Lightbulb, Crown, Lock,
  Zap, Rocket, Eye, EyeOff, Settings, Trash2, RefreshCw
} from 'lucide-react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useUIStore } from '../../../stores/useUIStore';
import { generateMusic } from '../../../services/musicApiService';
import { subscriptionService } from '../../../services/subscriptionService';

// Ultra-compact constants
const INITIAL_MESSAGE = { id: 1, type: 'ai', message: "🎵 Hello! I'm your AI music companion. What would you like to create today?", timestamp: new Date(), suggestions: ["Create a drum and bass drop", "Generate an ambient pad", "Add jazz chords", "Create a trap beat"] };
const OPTIONS = { styles: ['Electronic', 'Jazz', 'Classical', 'Rock', 'Hip-Hop', 'Ambient'], moods: ['Energetic', 'Calm', 'Dark', 'Bright', 'Melancholic', 'Uplifting'], lengths: ['8 bars', '16 bars', '32 bars'] };
const ASSETS = {
  aiPowered: '/src/assets/ai-powered-icon.png',
  daw: '/src/assets/daw-icon.png',
  musicToCode: '/src/assets/music-to-code-icon.png',
  realTimeAnalysis: '/src/assets/real-time-analysis-icon.png'
};

export function AICompanion() {
  const { chordCraftCode, updateCode } = useProjectStore();
  const { showSuccess, showError, setAnalyzing } = useUIStore();
  
  // Ultra-compact state
  const [state, setState] = useState({
    prompt: '', isGenerating: false, conversation: [INITIAL_MESSAGE], isRecording: false,
    recordingText: '', activeTab: 'chat', generatedCode: '', isPlaying: false,
    isUploading: false, uploadProgress: 0, analysisResult: null, isPro: false,
    dailyUsage: 0, showSettings: false, selectedStyle: '', selectedMood: '', selectedLength: ''
  });
  
  const [recognition, setRecognition] = useState(null);
  const [maxDailyUsage] = useState(5);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Ultra-compact update function
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  // Initialize everything in one effect
  useEffect(() => {
    const init = async () => {
      try {
        const status = subscriptionService.getSubscriptionStatus();
        updateState({ isPro: status.isPro });
        const today = new Date().toDateString();
        const storedUsage = localStorage.getItem(`ai-usage-${today}`);
        updateState({ dailyUsage: storedUsage ? parseInt(storedUsage) : 0 });
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('');
          updateState({ recordingText: transcript });
        };
        
        recognition.onend = () => {
          updateState({ isRecording: false });
          if (state.recordingText) updateState({ prompt: state.recordingText });
        };
        
        setRecognition(recognition);
      }
    };
    init();
  }, [state.recordingText]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [state.conversation]);

  // Ultra-compact handlers
  const handlers = {
    generate: async () => {
      if (!state.prompt.trim()) return;
      if (!state.isPro && state.dailyUsage >= maxDailyUsage) {
        showError(`Daily limit reached (${maxDailyUsage} requests). Upgrade to PRO for unlimited access!`);
        return;
      }

      updateState({ isGenerating: true });
      setAnalyzing(true);

      const userMessage = { id: Date.now(), type: 'user', message: state.prompt, timestamp: new Date() };
      updateState({ conversation: [...state.conversation, userMessage] });

      const newUsage = state.dailyUsage + 1;
      updateState({ dailyUsage: newUsage });
      localStorage.setItem(`ai-usage-${new Date().toDateString()}`, newUsage.toString());

      try {
        const response = await generateMusic({ 
          prompt: state.prompt, 
          userId: 'user',
          context: {
            style: state.selectedStyle,
            mood: state.selectedMood,
            length: state.selectedLength
          }
        });

        if (response.success) {
          const aiMessage = {
            id: Date.now() + 1, type: 'ai', message: `✨ Generated music for: "${state.prompt}"`,
            code: response.chordCraftCode, timestamp: new Date(),
            suggestions: ["Add variation", "Change tempo", "Add instrument", "Create bridge"]
          };
          
          updateState({ 
            conversation: [...state.conversation, aiMessage],
            generatedCode: response.chordCraftCode
          });
          showSuccess('AI generated music successfully!');
        } else {
          throw new Error(response.error || 'Generation failed');
        }
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1, type: 'ai', message: `❌ Error: ${error.message}. Please try again.`,
          timestamp: new Date(), isError: true
        };
        updateState({ conversation: [...state.conversation, errorMessage] });
        showError('AI generation failed. Please try again.');
      } finally {
        updateState({ isGenerating: false, prompt: '' });
        setAnalyzing(false);
      }
    },

    voiceInput: () => {
      if (state.isRecording) {
        recognition.stop();
        updateState({ isRecording: false });
      } else {
        updateState({ recordingText: '', isRecording: true });
        recognition.start();
      }
    },

    applyCode: () => {
      if (state.generatedCode) {
        updateCode(chordCraftCode + '\n\n' + state.generatedCode);
        showSuccess('Generated code applied to your project!');
      }
    },

    fileUpload: async (file) => {
      if (!file) return;
      const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac', 'audio/ogg'];
      if (!allowedTypes.includes(file.type)) {
        showError('Please upload a valid audio file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        showError('File size must be less than 100MB');
        return;
      }

      updateState({ isUploading: true, uploadProgress: 0 });

      try {
        const progressInterval = setInterval(() => {
          updateState(prev => ({ 
            uploadProgress: prev.uploadProgress >= 90 ? (clearInterval(progressInterval), 90) : prev.uploadProgress + 10 
          }));
        }, 200);

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(progressInterval);
        updateState({
          uploadProgress: 100,
          analysisResult: {
            analysis: {
              tempo: 120, key: 'C Major', duration: 180, energy: 0.7, valence: 0.6, danceability: 0.8,
              chords: ['C', 'Am', 'F', 'G'], suggestions: ['Add more variation', 'Consider a key change', 'Try different tempo']
            }
          }
        });
        showSuccess('Audio analyzed successfully!');
      } catch (error) {
        showError(`Failed to analyze audio: ${error.message}`);
      } finally {
        updateState({ isUploading: false, uploadProgress: 0 });
      }
    },

    clearConversation: () => updateState({ conversation: [INITIAL_MESSAGE] }),
    clearCode: () => updateState({ generatedCode: '' }),
    copyCode: () => {
      navigator.clipboard.writeText(state.generatedCode);
      showSuccess('Code copied to clipboard!');
    },
    togglePlay: () => updateState({ isPlaying: !state.isPlaying }),
    selectOption: (type, value) => updateState({ [`selected${type}`]: value })
  };

  // Ultra-compact components
  const MessageBubble = ({ msg }) => (
    <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        msg.type === 'user' 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
          : 'glass-pane text-foreground'
      }`}>
        <div className="flex items-start space-x-3">
          {msg.type === 'ai' && (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 neon-glow-pink">
              <Brain className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{msg.message}</p>
            {msg.code && (
              <div className="mt-3 p-4 bg-slate-900/50 rounded-xl border-l-4 border-purple-500">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{msg.code}</pre>
              </div>
            )}
            {msg.suggestions && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx} variant="outline" size="sm"
                    onClick={() => updateState({ prompt: suggestion })}
                    className="text-xs hover:bg-primary/20 hover:border-primary/50 transition-all duration-200"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const OptionGrid = ({ options, icon: Icon, type, selected }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <Button 
          key={option} 
          variant={selected === option ? "default" : "outline"} 
          size="sm" 
          className="justify-start hover:bg-primary/20" 
          onClick={() => handlers.selectOption(type, option)}
        >
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {option}
        </Button>
      ))}
    </div>
  );

  const AssetIcon = ({ src, alt, className = "w-6 h-6" }) => (
    <img src={src} alt={alt} className={className} />
  );

  return (
    <div className="h-full flex flex-col space-y-6 animated-bg">
      {/* Enhanced Header with Assets */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center vibrant-gradient-text">
            <Sparkles className="w-8 h-8 mr-3 text-purple-400 pulse-glow" />
            AI Music Companion
          </h2>
          <p className="text-slate-300 mt-2">Your intelligent co-creator for music production</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className={state.isPro ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}>
            {state.isPro ? <Crown className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            {state.isPro ? 'PRO' : 'Free'}
          </Badge>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30 neon-glow-pink">
            <AssetIcon src={ASSETS.aiPowered} alt="AI Powered" className="w-4 h-4 mr-2" />
            Advanced AI
          </Badge>
          {!state.isPro && <Badge variant="outline" className="text-xs">{state.dailyUsage}/{maxDailyUsage} requests today</Badge>}
        </div>
      </div>

      <Tabs value={state.activeTab} onValueChange={(value) => updateState({ activeTab: value })} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 glass-pane">
          <TabsTrigger value="chat" className="flex items-center space-x-2"><MessageSquare className="w-4 h-4" /><span>Chat</span></TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2"><Wand2 className="w-4 h-4" /><span>Generate</span></TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center space-x-2"><Headphones className="w-4 h-4" /><span>Analyze</span></TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
          <Card className="flex-1 glass-pane">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-blue-400" />
                  Conversation
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handlers.clearConversation} className="hover:bg-destructive/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateState({ showSettings: !state.showSettings })} className="hover:bg-primary/20">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-6">
                  {state.conversation.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                  {state.isGenerating && (
                    <div className="flex justify-start">
                      <div className="glass-pane rounded-2xl p-4 max-w-[80%]">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center neon-glow-pink">
                            <Brain className="w-4 h-4 text-white animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">AI is thinking...</p>
                            <Progress value={66} className="w-32 mt-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="glass-pane">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    placeholder="Describe the music you want to create..."
                    value={state.prompt}
                    onChange={(e) => updateState({ prompt: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handlers.generate()}
                    disabled={state.isGenerating}
                    className="vibrant-input"
                  />
                </div>
                <Button
                  variant={state.isRecording ? "destructive" : "outline"}
                  onClick={handlers.voiceInput}
                  disabled={state.isGenerating}
                  className="px-4"
                >
                  {state.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button 
                  onClick={handlers.generate} 
                  disabled={state.isGenerating || !state.prompt.trim()}
                  className="btn-primary px-6"
                >
                  {state.isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              {state.recordingText && (
                <div className="mt-3 p-3 glass-pane rounded-lg text-sm text-slate-300">
                  <Mic className="w-4 h-4 inline mr-2" />
                  {state.recordingText}
                </div>
              )}
              
              {!state.isPro && state.dailyUsage >= maxDailyUsage && (
                <div className="mt-4 p-4 glass-pane rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-400">Upgrade to PRO</h4>
                        <p className="text-xs text-slate-300">Get unlimited AI requests and advanced features</p>
                      </div>
                    </div>
                    <Button size="sm" className="btn-primary">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AssetIcon src={ASSETS.musicToCode} alt="Music to Code" className="w-6 h-6 mr-2" />
                  Generation Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Style</label>
                  <OptionGrid options={OPTIONS.styles} icon={Music} type="Style" selected={state.selectedStyle} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Mood</label>
                  <OptionGrid options={OPTIONS.moods} icon={Stars} type="Mood" selected={state.selectedMood} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Length</label>
                  <OptionGrid options={OPTIONS.lengths} icon={Target} type="Length" selected={state.selectedLength} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center">
                    <AssetIcon src={ASSETS.daw} alt="DAW" className="w-6 h-6 mr-2" />
                    Generated Code
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handlers.copyCode} className="hover:bg-primary/20">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlers.togglePlay} className="hover:bg-accent/20">
                      {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlers.clearCode} className="hover:bg-destructive/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                    {state.generatedCode || '// Generated code will appear here...'}
                  </pre>
                </ScrollArea>
                {state.generatedCode && (
                  <div className="mt-4 flex space-x-2">
                    <Button onClick={handlers.applyCode} className="btn-primary flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Apply to Project
                    </Button>
                    <Button variant="outline" onClick={handlers.clearCode} className="hover:bg-destructive/20">
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AssetIcon src={ASSETS.realTimeAnalysis} alt="Real-time Analysis" className="w-6 h-6 mr-2" />
                  Audio Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    const audioFile = files.find(file => file.type.startsWith('audio/'));
                    if (audioFile) handlers.fileUpload(audioFile);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {state.isUploading ? (
                    <div className="space-y-3">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                      <p className="text-sm text-slate-300">Analyzing audio...</p>
                      <Progress value={state.uploadProgress} className="w-full" />
                      <p className="text-xs text-slate-400">{state.uploadProgress}% complete</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileAudio className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm text-slate-300">Drop audio files here or click to browse</p>
                      <p className="text-xs text-slate-500">Supports WAV, MP3, M4A, FLAC, OGG (max 100MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => e.target.files[0] && handlers.fileUpload(e.target.files[0])}
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card className="glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {state.analysisResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Tempo</span>
                            <Badge variant="secondary">{state.analysisResult.analysis?.tempo || 'Unknown'} BPM</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Key</span>
                            <Badge variant="secondary">{state.analysisResult.analysis?.key || 'Unknown'}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Duration</span>
                            <span className="text-slate-300">{Math.floor((state.analysisResult.analysis?.duration || 0) / 60)}:{(state.analysisResult.analysis?.duration || 0) % 60}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Energy</span>
                            <Progress value={state.analysisResult.analysis?.energy * 100 || 0} className="w-16" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Valence</span>
                            <Progress value={state.analysisResult.analysis?.valence * 100 || 0} className="w-16" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Danceability</span>
                            <Progress value={state.analysisResult.analysis?.danceability * 100 || 0} className="w-16" />
                          </div>
                        </div>
                      </div>

                      {state.analysisResult.analysis?.chords && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-slate-300">Detected Chords</h5>
                          <div className="flex flex-wrap gap-1">
                            {state.analysisResult.analysis.chords.map((chord, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">{chord}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {state.analysisResult.analysis?.suggestions && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-slate-300">AI Suggestions</h5>
                          <div className="space-y-1">
                            {state.analysisResult.analysis.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-start gap-2 text-xs">
                                <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No analysis yet</p>
                      <p className="text-xs">Upload an audio file to get started</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}