import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Copy, Play, Download, Sparkles } from 'lucide-react';
import { musicApiService } from '../services/musicApiService';

export default function AICompanion({ isPro }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI music companion. I can help you generate ChordCraft code, analyze musical patterns, and create new compositions. What would you like to create today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !isPro) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      // Call the generative-companion API
      const response = await musicApiService.generateMusic({
        prompt: input,
        userId: 'current-user', // This would come from auth context
        context: {
          key: 'C_major',
          tempo: 120,
          style: 'general'
        }
      });

      if (response.success && response.chordCraftCode) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response.explanation || "Here's a ChordCraft composition based on your request:",
          timestamp: new Date(),
          codeSnippet: response.chordCraftCode,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to generate music');
      }
    } catch (error) {
      console.error('[AICompanion] Error generating music:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I couldn't generate music for that request. Please try again with a different prompt.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const playCode = (code) => {
    console.log('[AICompanion] Playing ChordCraft code:', code);
    // This would integrate with the audio engine
  };

  const downloadCode = (code) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chordcraft-composition.cc";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isPro) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Companion</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Unlock the power of AI-generated music with ChordCraft's intelligent companion. Generate code, analyze
          patterns, and create compositions.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Generate ChordCraft DSL code</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Analyze musical patterns</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Create custom compositions</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                <Card className={`${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <CardContent className="p-3">
                    <p className="text-sm">{message.content}</p>

                    {message.codeSnippet && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            ChordCraft DSL
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(message.codeSnippet)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => playCode(message.codeSnippet)}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => downloadCode(message.codeSnippet)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                          {message.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="text-xs text-muted-foreground mt-1 px-1">{message.timestamp.toLocaleTimeString()}</div>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground animate-pulse" />
              </div>
              <Card className="bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Generating...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe the music you want to create..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="min-h-[60px] resize-none"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isGenerating} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => setInput("Create a jazz chord progression in Bb major")}>
            Jazz Progression
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput("Generate a bass line for a rock song")}>
            Rock Bass
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput("Create a melodic phrase in pentatonic scale")}>
            Pentatonic Melody
          </Button>
        </div>
      </div>
    </div>
  );
}
