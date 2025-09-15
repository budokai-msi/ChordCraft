import React, { useState } from 'react';
import axios from 'axios';
import { useProjectStore } from '../../../stores/useProjectStore';
import { usePlaybackStore } from '../../../stores/usePlaybackStore';
import { useUIStore } from '../../../stores/useUIStore';
import { audioEngine } from '../../../services/AudioEngine';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from '../../../chordcraft.grammar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, BarChart3, Copy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

if (languages.chordcraft === undefined) {
    languages.chordcraft = chordCraftGrammar;
}

export function BottomPanel() {
    const { chordCraftCode, updateCode, musicAnalysis, setMusicAnalysis, notes } = useProjectStore();
    const { isPlaying, play, pause, stop, tempo } = usePlaybackStore();
    const { isAnalyzing, setAnalyzing, showSuccess, showError } = useUIStore();

    const handlePlayCode = () => {
        if (notes.length > 0) {
            if (isPlaying) {
                audioEngine.stop();
                pause();
            } else {
                audioEngine.setTempo(tempo);
                audioEngine.play(notes);
                play();
            }
        } else {
            showError('No notes to play. Add some notes or generate code first.');
        }
    };

    const handleAnalyzeCode = async () => {
        if (!chordCraftCode.trim()) {
            showError('No code to analyze');
            return;
        }

        setAnalyzing(true);
        try {
            // Define the API endpoint based on the environment
            const apiUrl = import.meta.env.PROD 
                ? 'https://chord-craft-l32h.vercel.app/api/generate-music' 
                : 'http://localhost:5000/api/generate-music';

            // Make the actual API call to the backend for code analysis
            const response = await axios.post(apiUrl, { code: chordCraftCode });

            // Check for a successful response from the API
            if (response.data && response.data.success) {
                // The API response for code analysis contains tempo, key, and other features
                const analysisResult = {
                    tempo: response.data.tempo_estimate,
                    key: response.data.key_signature,
                    time_signature: response.data.time_signature,
                    duration: response.data.musical_features?.duration,
                    notes: response.data.musical_features?.total_notes,
                    confidence: response.data.confidence, // Assuming API provides this
                    analysis_type: response.data.analysis_type,
                    generated_code: chordCraftCode
                };
                
                setMusicAnalysis(analysisResult);
                showSuccess('Code analysis completed successfully!');
            } else {
                // Handle cases where the API returns a non-success status
                showError(response.data.error || 'Analysis failed');
            }
        } catch (error) {
            // Handle network or server errors
            showError(error.response?.data?.error || error.message || 'An unknown error occurred during analysis.');
        } finally {
            // Ensure the loading state is always turned off
            setAnalyzing(false);
        }
    };

    const formatAnalysisData = (data) => {
        if (!data) return null;
        
        return {
            "Tempo (BPM)": data.tempo,
            "Key Signature": data.key,
            "Time Signature": data.time_signature,
            "Duration (s)": data.duration?.toFixed(2),
            "Total Notes": data.notes,
            "Confidence Score": data.confidence?.toFixed(2),
            "Analysis Type": data.analysis_type,
            "Generated Code Snippet": data.generated_code ? data.generated_code.substring(0, 100) + '...' : 'N/A',
            // Add more fields as needed from your backend analysis
        };
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(chordCraftCode);
        showSuccess('Code copied to clipboard!');
    };

    return (
        <footer className="h-64 bg-slate-800/50 border-t border-slate-700 shrink-0">
            <Tabs defaultValue="code" className="h-full flex flex-col">
                <TabsList className="shrink-0 rounded-none bg-slate-800 justify-start">
                    <TabsTrigger value="code">Code Editor</TabsTrigger>
                    <TabsTrigger value="analysis">Music Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="code" className="flex-1 overflow-auto p-0">
                    <div className="flex items-center gap-2 p-2 border-b border-slate-700">
                        <Button onClick={handlePlayCode} disabled={notes.length === 0}>
                            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            {isPlaying ? 'Stop' : 'Play Code'}
                        </Button>
                        <Button variant="outline" onClick={handleAnalyzeCode} disabled={isAnalyzing || !chordCraftCode.trim()}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                        </Button>
                        <Button variant="outline" onClick={handleCopyCode}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                    </div>
                    <Editor
                        value={chordCraftCode}
                        onValueChange={updateCode} // This triggers UI update and note parsing
                        highlight={code => highlight(code, languages.chordcraft, 'chordcraft')}
                        padding={15}
                        style={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: 14,
                            backgroundColor: 'transparent',
                            color: 'hsl(var(--foreground))',
                            minHeight: 'calc(100% - 48px)', // Adjust for toolbar height
                        }}
                    />
                </TabsContent>
                <TabsContent value="analysis" className="p-4 overflow-auto">
                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Progress value={66} className="w-2/3 mb-4" />
                            <p className="text-slate-400">Analyzing code with Muzic AI...</p>
                        </div>
                    )}
                    {!isAnalyzing && musicAnalysis ? (
                        <Card className="bg-slate-700 border-slate-600">
                            <CardHeader>
                                <CardTitle className="text-blue-400">Music Analysis Results</CardTitle>
                                <CardDescription className="text-slate-300">
                                    Insights powered by Muzic AI
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {Object.entries(formatAnalysisData(musicAnalysis)).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-slate-400">{key}:</span>
                                        <span className="font-medium text-white">{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        !isAnalyzing && <p className="text-slate-400">Analyze code to see musical insights here.</p>
                    )}
                </TabsContent>
            </Tabs>
        </footer>
    );
}
