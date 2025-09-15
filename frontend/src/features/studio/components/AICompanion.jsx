import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Brain, 
  Music, 
  Zap, 
  Wand2, 
  Lightbulb,
  Play,
  Pause,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MessageSquare,
  FileText,
  Headphones,
  Stars,
  Rocket,
  Target,
  Sparkle
} from 'lucide-react';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useUIStore } from '../../../stores/useUIStore';
import axios from 'axios';

export function AICompanion() {
  const { chordCraftCode, updateCode, musicAnalysis } = useProjectStore();
  const { showSuccess, showError, setAnalyzing } = useUIStore();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'ai',
      message: "🎵 Hello! I'm your AI music companion. I can help you create, analyze, and enhance your music. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Create a drum and bass drop",
        "Generate an ambient pad progression", 
        "Add a jazz chord progression",
        "Create a trap beat pattern"
      ]
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setRecordingText(transcript);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        if (recordingText) {
          setPrompt(recordingText);
        }
      };
      
      setRecognition(recognition);
    }
  }, [recordingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAnalyzing(true);

    // Add user message to conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: prompt,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      const response = await axios.post(
        import.meta.env.PROD 
          ? 'https://chord-craft-l32h.vercel.app/api/generative-companion'
          : 'http://localhost:5000/api/generative-companion',
        { 
          prompt: prompt, 
          code: chordCraftCode,
          context: musicAnalysis 
        }
      );

      if (response.data.success) {
        const generatedCode = response.data.generated_code;
        setGeneratedCode(generatedCode);
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: `✨ I've generated this music for you based on your request: "${prompt}"`,
          code: generatedCode,
          timestamp: new Date(),
          suggestions: [
            "Add more variation",
            "Change the tempo",
            "Add a different instrument",
            "Create a bridge section"
          ]
        };
        
        setConversation(prev => [...prev, aiMessage]);
        showSuccess('AI generated music successfully!');
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: `❌ Sorry, I encountered an error: ${error.message}. Please try again with a different prompt.`,
        timestamp: new Date(),
        isError: true
      };
      setConversation(prev => [...prev, errorMessage]);
      showError('AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setAnalyzing(false);
      setPrompt('');
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setRecordingText('');
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleApplyCode = () => {
    if (generatedCode) {
      updateCode(chordCraftCode + '\n\n' + generatedCode);
      showSuccess('Generated code applied to your project!');
    }
  };

  const handleSuggestion = (suggestion) => {
    setPrompt(suggestion);
  };

  const handlePlayGenerated = async () => {
    if (!generatedCode) return;
    
    setIsPlaying(true);
    // Here you would implement audio playback
    // For now, just simulate playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    showSuccess('Code copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col space-y-6 animated-bg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center vibrant-gradient-text">
            <Sparkles className="w-8 h-8 mr-3 text-purple-400 pulse-glow" />
            AI Music Companion
          </h2>
          <p className="text-slate-300 mt-2">Your intelligent co-creator for music production</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30 neon-glow-pink">
            <Brain className="w-4 h-4 mr-2" />
            Advanced AI
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Zap className="w-4 h-4 mr-2" />
            Real-time
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 glass-pane">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4" />
            <span>Generate</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center space-x-2">
            <Headphones className="w-4 h-4" />
            <span>Analyze</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col space-y-4">
          {/* Conversation Area */}
          <Card className="flex-1 glass-pane">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageSquare className="w-6 h-6 mr-2 text-blue-400" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-6">
                  {conversation.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestion(suggestion)}
                                    className="text-xs hover:bg-primary/20 hover:border-primary/50 transition-all duration-200"
                                  >
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
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

          {/* Input Area */}
          <Card className="glass-pane">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    placeholder="Describe the music you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                    disabled={isGenerating}
                    className="vibrant-input"
                  />
                </div>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={handleVoiceInput}
                  disabled={isGenerating}
                  className="px-4"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="btn-primary px-6"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {recordingText && (
                <div className="mt-3 p-3 glass-pane rounded-lg text-sm text-slate-300">
                  <Mic className="w-4 h-4 inline mr-2" />
                  {recordingText}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generation Options */}
            <Card className="glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Wand2 className="w-6 h-6 mr-2 text-purple-400" />
                  Generation Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Electronic', 'Jazz', 'Classical', 'Rock', 'Hip-Hop', 'Ambient'].map(style => (
                      <Button key={style} variant="outline" size="sm" className="justify-start hover:bg-primary/20">
                        <Music className="w-4 h-4 mr-2" />
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Mood</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Energetic', 'Calm', 'Dark', 'Bright', 'Melancholic', 'Uplifting'].map(mood => (
                      <Button key={mood} variant="outline" size="sm" className="justify-start hover:bg-accent/20">
                        <Stars className="w-4 h-4 mr-2" />
                        {mood}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">Length</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['8 bars', '16 bars', '32 bars'].map(length => (
                      <Button key={length} variant="outline" size="sm" className="hover:bg-primary/20">
                        <Target className="w-4 h-4 mr-2" />
                        {length}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Code */}
            <Card className="glass-pane">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-green-400" />
                    Generated Code
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handleCopyCode} className="hover:bg-primary/20">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePlayGenerated} className="hover:bg-accent/20">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
                    {generatedCode || '// Generated code will appear here...'}
                  </pre>
                </ScrollArea>
                {generatedCode && (
                  <div className="mt-4 flex space-x-2">
                    <Button onClick={handleApplyCode} className="btn-primary flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Apply to Project
                    </Button>
                    <Button variant="outline" onClick={() => setGeneratedCode('')} className="hover:bg-destructive/20">
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="flex-1 space-y-6">
          <Card className="glass-pane">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Headphones className="w-6 h-6 mr-2 text-blue-400" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                Upload audio or analyze your current project with advanced AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 vibrant-gradient-text">Advanced Analysis Coming Soon</h3>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  Stem separation, harmonic analysis, and intelligent suggestions powered by Microsoft Muzic AI
                </p>
                <Button className="btn-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio for Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
