import { useState } from "react";
import { Brain, Code, BarChart3, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AICompanion } from "./AICompanion";
import { CodeEditor } from "./CodeEditor";
import { MusicAnalysis } from "./MusicAnalysis";

export function RightPanel() {
  const [activeTab, setActiveTab] = useState("ai-companion");

  return (
    <div className="w-80 border-l border-purple-800/30 bg-black/10 backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border-b border-purple-800/30 rounded-none">
          <TabsTrigger 
            value="ai-companion" 
            className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Companion
          </TabsTrigger>
          <TabsTrigger 
            value="code-editor"
            className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200"
          >
            <Code className="w-4 h-4 mr-2" />
            Code
            <Lock className="w-3 h-3 ml-1 text-yellow-400" />
          </TabsTrigger>
          <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analysis
            <Lock className="w-3 h-3 ml-1 text-yellow-400" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="ai-companion" className="h-full m-0">
            <AICompanion />
          </TabsContent>

          <TabsContent value="code-editor" className="h-full m-0">
            <div className="h-full flex flex-col">
              {/* PRO Feature Lock */}
              <Card className="m-4 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Lock className="w-5 h-5" />
                    PRO Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-200 mb-3">
                    Unlock the code editor to view and modify the AI-generated music code.
                  </p>
                  <Badge variant="outline" className="bg-yellow-400/10 text-yellow-400 border-yellow-500/30">
                    Upgrade to PRO
                  </Badge>
                </CardContent>
              </Card>
              
              <div className="flex-1 mx-4 mb-4">
                <CodeEditor locked={true} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="h-full m-0">
            <div className="h-full flex flex-col">
              {/* PRO Feature Lock */}
              <Card className="m-4 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Lock className="w-5 h-5" />
                    PRO Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-200 mb-3">
                    Get detailed music analysis including chord progressions, scales, and harmonic analysis.
                  </p>
                  <Badge variant="outline" className="bg-yellow-400/10 text-yellow-400 border-yellow-500/30">
                    Upgrade to PRO
                  </Badge>
                </CardContent>
              </Card>
              
              <div className="flex-1 mx-4 mb-4">
                <MusicAnalysis locked={true} />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}