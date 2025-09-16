import { useState, useRef, useEffect } from "react";
import { Send, Brain, Sparkles, Loader2 } from "lucide-react";
import { HapticButton } from "./HapticButton";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  codeBlock?: string;
}

export function AICompanion() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your AI music companion. I can help you analyze your music, generate chord progressions, and convert between music and code. What would you like to create today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsThinking(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      setIsThinking(false);
      
      const aiResponses = [
        {
          content: "I've analyzed your input! Here's a chord progression that would work well:",
          codeBlock: `// C Major Progression
const chords = [
  { chord: "C", duration: 1 },
  { chord: "Am", duration: 1 }, 
  { chord: "F", duration: 1 },
  { chord: "G", duration: 1 }
];`
        },
        {
          content: "I can help you create a melody pattern. Let me generate some MIDI data:",
          codeBlock: `// Melody Pattern
const melody = [
  { note: "C4", time: 0, duration: 0.5 },
  { note: "E4", time: 0.5, duration: 0.5 },
  { note: "G4", time: 1.0, duration: 1.0 }
];`
        },
        {
          content: "Based on your track, I recommend adding some harmonic movement. Here's what I suggest:"
        }
      ];

      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        codeBlock: response.codeBlock,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Haptic feedback for AI response
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-800/30 bg-black/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-medium text-purple-200">AI Companion</h3>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30 ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
        <p className="text-xs text-purple-300">
          Your personal music AI assistant
        </p>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-[80%] rounded-lg p-3 shadow-lg ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100"
                  }`}
                >
                <p className="text-sm">{message.content}</p>
                
                {message.codeBlock && (
                  <Card className="mt-3 bg-black/50 border-purple-500/30">
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-xs text-purple-300 ml-2">Generated Code</span>
                      </div>
                      <pre className="text-xs text-purple-200 font-mono overflow-x-auto">
                        {message.codeBlock}
                      </pre>
                    </div>
                  </Card>
                )}
                
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Enhanced Thinking Indicator */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <motion.div 
                  className="bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 rounded-lg p-3 max-w-[80%] shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(168, 85, 247, 0.4)",
                      "0 0 0 8px rgba(168, 85, 247, 0)",
                      "0 0 0 0 rgba(168, 85, 247, 0)"
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <motion.span 
                      className="text-sm"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      AI is thinking...
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-purple-800/30 bg-black/20">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your music..."
            className="bg-black/30 border-purple-700/30 text-white placeholder:text-purple-300 focus:border-purple-500"
            disabled={isThinking}
          />
          <HapticButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            size="sm"
            hapticType="medium"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.div
              animate={isThinking ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Send className="w-4 h-4" />
            </motion.div>
          </HapticButton>
        </div>
      </div>
    </div>
  );
}