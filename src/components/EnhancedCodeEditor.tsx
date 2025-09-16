import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Copy, 
  Download, 
  Play, 
  Lock, 
  Code2, 
  Music, 
  Wand2, 
  RefreshCw,
  Save,
  Upload,
  Eye,
  EyeOff,
  Zap,
  FileCode,
  Volume2,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";

interface EnhancedCodeEditorProps {
  locked?: boolean;
  currentTrack?: any;
  onCodeChange?: (code: string) => void;
  onMusicGenerated?: (musicData: any) => void;
}

interface MusicToken {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'chord' | 'note' | 'default';
  value: string;
  start: number;
  end: number;
}

export function EnhancedCodeEditor({ 
  locked = false, 
  currentTrack,
  onCodeChange,
  onMusicGenerated 
}: EnhancedCodeEditorProps) {
  const [code, setCode] = useState(`// ChordCraft Music Code v2.0
// AI-Generated from: "Chill Lo-Fi Beat"

const musicTrack = {
  metadata: {
    title: "Midnight Vibes",
    artist: "AI Composer",
    genre: "Lo-Fi Hip-Hop",
    bpm: 85,
    key: "Am",
    timeSignature: [4, 4],
    duration: 120.0 // seconds
  },
  
  structure: {
    intro: { bars: 8, start: 0 },
    verse: { bars: 16, start: 8 },
    chorus: { bars: 8, start: 24 },
    outro: { bars: 4, start: 32 }
  },
  
  instruments: {
    piano: {
      type: "acoustic_grand_piano",
      channel: 1,
      volume: 0.7,
      effects: ["reverb", "soft_attack"]
    },
    bass: {
      type: "electric_bass",
      channel: 2, 
      volume: 0.8,
      effects: ["compression", "low_pass_filter"]
    },
    drums: {
      type: "trap_kit",
      channel: 10,
      volume: 0.6,
      swing: 0.1
    }
  },
  
  chordProgression: [
    { chord: "Am", beat: 1, duration: 2, voicing: [57, 60, 64, 67] },
    { chord: "F", beat: 3, duration: 2, voicing: [53, 57, 60, 65] },
    { chord: "C", beat: 5, duration: 2, voicing: [48, 52, 55, 60] },
    { chord: "G", beat: 7, duration: 2, voicing: [55, 59, 62, 67] }
  ],
  
  melody: {
    piano: [
      { note: "C5", time: 0, duration: 0.5, velocity: 65, humanize: 0.02 },
      { note: "E5", time: 0.5, duration: 0.25, velocity: 70, slide: true },
      { note: "G4", time: 1.0, duration: 1.0, velocity: 60, sustain: true },
      { note: "A4", time: 2.0, duration: 0.75, velocity: 75, accent: true }
    ]
  },
  
  bassline: [
    { note: "A2", time: 0, duration: 1, velocity: 80, pattern: "root" },
    { note: "F2", time: 2, duration: 1, velocity: 75, pattern: "fifth" },
    { note: "C3", time: 4, duration: 1, velocity: 85, pattern: "octave" },
    { note: "G2", time: 6, duration: 1, velocity: 78, pattern: "approach" }
  ],
  
  drums: {
    kick: [0, 2, 4, 6],
    snare: [1, 3, 5, 7],
    hihat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5],
    openhat: [1.75, 5.75]
  },
  
  effects: {
    global: {
      reverb: { room: 0.3, decay: 2.1, wet: 0.25 },
      compression: { threshold: -18, ratio: 3.2, attack: 0.003, release: 0.1 },
      eq: { low: 1.1, mid: 0.9, high: 1.2 }
    }
  }
};

// Advanced Music Functions
export const MusicEngine = {
  
  // Convert to different formats
  toMIDI: (track) => {
    return {
      format: 1,
      division: 480,
      tracks: track.instruments.map(convertInstrumentToMIDI)
    };
  },
  
  // AI Analysis
  analyzeHarmony: (chords) => {
    const romanNumerals = chords.map(chord => analyzeChord(chord));
    const cadences = detectCadences(romanNumerals);
    const modulations = detectModulations(chords);
    
    return {
      analysis: romanNumerals,
      cadences,
      modulations,
      complexity: calculateComplexity(chords)
    };
  },
  
  // Generate variations
  generateVariation: (melody, style = "jazz") => {
    const variations = {
      jazz: () => addJazzInflections(melody),
      classical: () => addClassicalOrnamentation(melody), 
      electronic: () => addElectronicEffects(melody)
    };
    
    return variations[style] ? variations[style]() : melody;
  },
  
  // Live preview
  preview: async (track) => {
    const audioContext = new AudioContext();
    const scheduler = new MusicScheduler(audioContext);
    
    return scheduler.scheduleTrack(track);
  }
};

// Export ready for DAW
export function exportToDAW(format = "ableton") {
  const exporters = {
    ableton: () => generateAbletonLiveSet(musicTrack),
    logic: () => generateLogicProSession(musicTrack),
    flstudio: () => generateFLStudioProject(musicTrack),
    protools: () => generateProToolsSession(musicTrack)
  };
  
  return exporters[format]();
}`);

  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Syntax highlighting tokenizer
  const tokenizeCode = (codeStr: string): MusicToken[] => {
    const tokens: MusicToken[] = [];
    const patterns = [
      { type: 'comment' as const, regex: /\/\/.*$/gm },
      { type: 'string' as const, regex: /"[^"]*"/g },
      { type: 'chord' as const, regex: /\b[A-G][#b]?m?(?:7|9|11|13|sus[24]|add[0-9]|dim|aug)?\b/g },
      { type: 'note' as const, regex: /\b[A-G][#b]?[0-9]\b/g },
      { type: 'keyword' as const, regex: /\b(const|let|var|function|export|import|if|else|for|while|return|true|false|null|undefined)\b/g },
      { type: 'number' as const, regex: /\b\d+\.?\d*\b/g },
    ];

    let lastIndex = 0;
    const allMatches: Array<{ match: RegExpMatchArray; type: MusicToken['type'] }> = [];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(codeStr)) !== null) {
        allMatches.push({ match, type: pattern.type });
      }
    });

    allMatches.sort((a, b) => a.match.index! - b.match.index!);

    allMatches.forEach(({ match, type }) => {
      if (match.index! > lastIndex) {
        tokens.push({
          type: 'default',
          value: codeStr.slice(lastIndex, match.index),
          start: lastIndex,
          end: match.index!
        });
      }
      tokens.push({
        type,
        value: match[0],
        start: match.index!,
        end: match.index! + match[0].length
      });
      lastIndex = match.index! + match[0].length;
    });

    if (lastIndex < codeStr.length) {
      tokens.push({
        type: 'default',
        value: codeStr.slice(lastIndex),
        start: lastIndex,
        end: codeStr.length
      });
    }

    return tokens;
  };

  // Render syntax highlighted code
  const renderHighlightedCode = (codeStr: string) => {
    const tokens = tokenizeCode(codeStr);
    const colorMap = {
      keyword: 'text-purple-400',
      string: 'text-green-400',
      number: 'text-blue-400',
      comment: 'text-gray-500 italic',
      chord: 'text-yellow-400 font-semibold',
      note: 'text-cyan-400 font-semibold',
      default: 'text-gray-200'
    };

    return tokens.map((token, index) => (
      <span key={index} className={colorMap[token.type] || colorMap.default}>
        {token.value}
      </span>
    ));
  };

  // AI Functions
  const analyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalysisResults({
        harmony: "Sophisticated Am-F-C-G progression with jazz extensions",
        rhythm: "Laid-back 85 BPM with subtle swing feel",
        structure: "Classic verse-chorus form with extended intro/outro",
        complexity: 7.2,
        suggestions: [
          "Add a bridge section for more variety",
          "Consider modulating to C major in the chorus",
          "Experiment with polyrhythmic elements in drums"
        ]
      });
      toast.success("Code analysis complete!");
    } catch (error) {
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMusic = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      const musicData = {
        title: "Generated Track",
        duration: 120,
        tracks: 4,
        complexity: 8.5
      };
      
      onMusicGenerated?.(musicData);
      toast.success("Music generated successfully!");
    } catch (error) {
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const convertMusicToCode = async () => {
    if (!currentTrack) {
      toast.error("No track selected for conversion");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate music-to-code conversion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedCode = `// Generated from: "${currentTrack.title || 'Uploaded Track'}"
// Auto-detected: ${currentTrack.bpm || 120} BPM, ${currentTrack.key || 'C Major'}

const musicTrack = {
  metadata: {
    title: "${currentTrack.title || 'Converted Track'}",
    bpm: ${currentTrack.bpm || 120},
    key: "${currentTrack.key || 'C Major'}",
    detectedGenre: "${currentTrack.genre || 'Unknown'}"
  },
  
  // AI-analyzed chord progression
  chords: ${JSON.stringify(currentTrack.chords || [
    { chord: "C", time: 0, confidence: 0.95 },
    { chord: "Am", time: 2, confidence: 0.88 },
    { chord: "F", time: 4, confidence: 0.92 },
    { chord: "G", time: 6, confidence: 0.89 }
  ], null, 2)},
  
  // Extracted melody
  melody: ${JSON.stringify(currentTrack.melody || [], null, 2)},
  
  // Rhythm analysis
  drums: ${JSON.stringify(currentTrack.drums || {}, null, 2)}
};`;

      setEditableCode(generatedCode);
      setCode(generatedCode);
      setActiveTab("editor");
      toast.success("Track converted to code!");
    } catch (error) {
      toast.error("Conversion failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setEditableCode(newCode);
    onCodeChange?.(newCode);
    
    // Basic syntax validation
    try {
      // Simple validation - check for matching braces
      const openBraces = (newCode.match(/{/g) || []).length;
      const closeBraces = (newCode.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        setSyntaxErrors([{ line: 0, message: "Unmatched braces" }]);
      } else {
        setSyntaxErrors([]);
      }
    } catch (error) {
      setSyntaxErrors([{ line: 0, message: "Syntax error detected" }]);
    }
  };

  const playPreview = async () => {
    setIsPlaying(true);
    try {
      // Simulate audio playback
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success("Preview complete!");
    } catch (error) {
      toast.error("Playback failed");
    } finally {
      setIsPlaying(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(editableCode);
    toast.success("Code copied to clipboard!");
  };

  const saveCode = () => {
    setCode(editableCode);
    toast.success("Code saved!");
  };

  if (locked) {
    return (
      <Card className="h-full bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-purple-500/30 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center max-w-sm">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(255, 193, 7, 0.3)",
                  "0 0 40px rgba(255, 193, 7, 0.6)",
                  "0 0 20px rgba(255, 193, 7, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-3">PRO Feature</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Unlock the advanced code editor to transform music into editable code and generate new compositions with AI precision.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to PRO
            </Button>
          </div>
        </motion.div>
        
        {/* Blurred Preview */}
        <div className="blur-sm opacity-40 p-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Music Code Editor</h3>
                <Badge className="bg-purple-600/20 text-purple-300">AI-Powered</Badge>
              </div>
            </div>
          </CardHeader>
          <div className="px-6">
            <pre className="text-sm text-slate-300 font-mono bg-black/40 p-4 rounded-lg border border-purple-700/30 overflow-hidden">
              {code.substring(0, 300)}...
            </pre>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-purple-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isGenerating ? 360 : 0 }}
              transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
            >
              <FileCode className="w-5 h-5 text-purple-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white">Music Code Editor</h3>
            <Badge className="bg-purple-600/20 text-purple-300">AI-Powered</Badge>
            {syntaxErrors.length > 0 && (
              <Badge variant="destructive" className="bg-red-600/20 text-red-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                {syntaxErrors.length} Error{syntaxErrors.length > 1 ? 's' : ''}
              </Badge>
            )}
            {syntaxErrors.length === 0 && isEditing && (
              <Badge className="bg-green-600/20 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={copyCode}
              className="text-slate-400 hover:text-white hover:bg-purple-600/20"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={saveCode}
              className="text-slate-400 hover:text-white hover:bg-purple-600/20"
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={playPreview}
              disabled={isPlaying}
              className="text-green-400 hover:text-green-300 hover:bg-green-600/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Generation Progress */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm text-slate-300">Generating music...</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-5rem)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pb-2">
            <TabsList className="grid w-full grid-cols-3 bg-black/20">
              <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
              <TabsTrigger value="convert" className="text-xs">Convert</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 px-6 pb-6 mt-0">
            <div className="h-full flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isEditing ? "default" : "secondary"}
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs"
                >
                  {isEditing ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
                <Button
                  size="sm"
                  onClick={generateMusic}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-xs"
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Generate Music
                </Button>
              </div>

              <ScrollArea className="flex-1 rounded-lg border border-purple-700/30 bg-black/40">
                {isEditing ? (
                  <Textarea
                    ref={textareaRef}
                    value={editableCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="min-h-full resize-none font-mono text-sm bg-transparent border-none focus:ring-0 text-slate-200"
                    placeholder="Write your music code here..."
                  />
                ) : (
                  <div className="p-4">
                    <pre className="text-sm font-mono text-slate-200 whitespace-pre-wrap">
                      {renderHighlightedCode(editableCode)}
                    </pre>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 px-6 pb-6 mt-0">
            <div className="h-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Code Analysis</h4>
                <Button
                  size="sm"
                  onClick={analyzeCode}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Brain className="w-3 h-3 mr-1" />
                  )}
                  Analyze
                </Button>
              </div>

              <ScrollArea className="flex-1">
                {analysisResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-lg border border-cyan-700/30">
                      <h5 className="font-medium text-cyan-400 mb-2">Harmonic Analysis</h5>
                      <p className="text-sm text-slate-300">{analysisResults.harmony}</p>
                    </div>
                    
                    <div className="p-4 bg-black/40 rounded-lg border border-green-700/30">
                      <h5 className="font-medium text-green-400 mb-2">Rhythmic Analysis</h5>
                      <p className="text-sm text-slate-300">{analysisResults.rhythm}</p>
                    </div>
                    
                    <div className="p-4 bg-black/40 rounded-lg border border-yellow-700/30">
                      <h5 className="font-medium text-yellow-400 mb-2">Structure Analysis</h5>
                      <p className="text-sm text-slate-300">{analysisResults.structure}</p>
                    </div>

                    <div className="p-4 bg-black/40 rounded-lg border border-purple-700/30">
                      <h5 className="font-medium text-purple-400 mb-3">Complexity Score</h5>
                      <div className="flex items-center gap-3">
                        <Progress value={analysisResults.complexity * 10} className="flex-1 h-2" />
                        <Badge className="bg-purple-600/20 text-purple-300">
                          {analysisResults.complexity}/10
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 rounded-lg border border-orange-700/30">
                      <h5 className="font-medium text-orange-400 mb-3">AI Suggestions</h5>
                      <ul className="space-y-2">
                        {analysisResults.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Click "Analyze" to get AI insights about your code</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="convert" className="flex-1 px-6 pb-6 mt-0">
            <div className="h-full flex flex-col gap-4">
              <h4 className="font-medium text-white">Bidirectional Conversion</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-black/40 border-purple-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-white">Music → Code</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={convertMusicToCode}
                        disabled={isGenerating || !currentTrack}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-xs"
                      >
                        <Code2 className="w-3 h-3 mr-1" />
                        Convert
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Convert uploaded music tracks into editable code format
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-cyan-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-white">Code → Music</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={generateMusic}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs"
                      >
                        <Volume2 className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Generate playable music from your code
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator className="bg-slate-700/50" />

              <div className="space-y-3">
                <h5 className="font-medium text-slate-300">Export Options</h5>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    MIDI
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    WAV
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <FileCode className="w-3 h-3 mr-1" />
                    Ableton
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    <FileCode className="w-3 h-3 mr-1" />
                    Logic Pro
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}