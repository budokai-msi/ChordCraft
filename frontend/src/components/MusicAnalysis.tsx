import { BarChart3, TrendingUp, Music, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface MusicAnalysisProps {
  locked?: boolean;
}

export function MusicAnalysis({ locked = false }: MusicAnalysisProps) {
  const analysisData = {
    key: "C Major",
    tempo: 120,
    timeSignature: "4/4",
    harmonicComplexity: 75,
    rhythmicVariety: 60,
    melodicMovement: 85,
    chordProgression: ["C", "Am", "F", "G"],
    scales: ["C Major", "A Natural Minor"],
    mood: "Uplifting",
    genre: "Pop/Rock"
  };

  if (locked) {
    return (
      <Card className="h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-600/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-400 mb-2">PRO Feature</h3>
            <p className="text-sm text-yellow-200 mb-4 max-w-48">
              Get detailed harmonic analysis, chord progressions, and musical insights
            </p>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Upgrade to PRO
            </Button>
          </div>
        </div>
        
        {/* Blurred Preview */}
        <div className="blur-sm opacity-50 p-4 space-y-4">
          <Card className="bg-black/30 border-purple-700/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-200">Key Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">C Major</div>
                <div className="text-xs text-purple-300">Primary Key</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-purple-700/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-200">Complexity Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-300">Harmonic</span>
                  <span className="text-purple-400">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-600/30">
      <CardHeader className="pb-3 border-b border-purple-800/30">
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <BarChart3 className="w-5 h-5" />
          Music Analysis
        </CardTitle>
        <p className="text-xs text-purple-300">
          AI-powered harmonic and structural analysis
        </p>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4 h-[calc(100%-5rem)] overflow-y-auto">
        {/* Key and Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-black/30 border-purple-700/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">Key Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{analysisData.key}</div>
                <div className="text-xs text-purple-300">Primary Key</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-purple-700/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-200">Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{analysisData.tempo}</div>
                <div className="text-xs text-green-300">BPM</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complexity Metrics */}
        <Card className="bg-black/30 border-purple-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Complexity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-300">Harmonic Complexity</span>
                <span className="text-purple-400">{analysisData.harmonicComplexity}%</span>
              </div>
              <Progress value={analysisData.harmonicComplexity} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-300">Rhythmic Variety</span>
                <span className="text-purple-400">{analysisData.rhythmicVariety}%</span>
              </div>
              <Progress value={analysisData.rhythmicVariety} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-300">Melodic Movement</span>
                <span className="text-purple-400">{analysisData.melodicMovement}%</span>
              </div>
              <Progress value={analysisData.melodicMovement} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Chord Progression */}
        <Card className="bg-black/30 border-purple-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Chord Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {analysisData.chordProgression.map((chord, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="bg-purple-600/20 text-purple-300 border-purple-500/30"
                >
                  {chord}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-purple-300 mt-2">
              I-vi-IV-V progression in {analysisData.key}
            </p>
          </CardContent>
        </Card>

        {/* Musical Characteristics */}
        <Card className="bg-black/30 border-purple-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200">Musical Characteristics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-purple-300">Mood:</span>
              <Badge variant="outline" className="bg-pink-600/20 text-pink-300 border-pink-500/30">
                {analysisData.mood}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-purple-300">Genre:</span>
              <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                {analysisData.genre}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-purple-300">Time Signature:</span>
              <span className="text-xs text-purple-400">{analysisData.timeSignature}</span>
            </div>
          </CardContent>
        </Card>

        {/* Scales */}
        <Card className="bg-black/30 border-purple-700/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-200">Detected Scales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisData.scales.map((scale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs text-purple-300">{scale}</span>
                  <Badge 
                    variant="outline" 
                    className="bg-green-600/20 text-green-300 border-green-500/30"
                  >
                    {index === 0 ? 'Primary' : 'Secondary'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}