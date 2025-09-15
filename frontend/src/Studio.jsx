import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from './chordcraft.grammar.js';
import { useAuth } from './Auth';
import { supabase } from './supabaseClient';
import { TimelineProvider } from './TimelineContextProvider';
import { TimelineStudio } from './TimelineStudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, Upload, Copy, Download, Music, Code, BarChart3 } from 'lucide-react';

if (languages.chordcraft === undefined) { 
    languages.chordcraft = chordCraftGrammar; 
}

const noteToFreq = (note) => {
    const notes = { 
        'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47, 
        'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94, 
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77, 
        'C6': 1046.50 
    };
    return notes[note] || notes['C4'];
};

export function Studio() {
    const { user, signOut } = useAuth();
    const [viewMode, setViewMode] = useState('timeline');
    const [selectedFile, setSelectedFile] = useState(null);
    const [chordCraftCode, setChordCraftCode] = useState('// Upload an audio file to generate ChordCraft code...\n// Or start coding your own musical creation!');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [projectId, setProjectId] = useState(null);
    const [projectTitle, setProjectTitle] = useState('Untitled Project');
    const [saveStatus, setSaveStatus] = useState('');
    const [projects, setProjects] = useState([]);
    const [musicAnalysis, setMusicAnalysis] = useState(null);
    const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio context and playback
    const audioContext = useRef(null);
    const sourceNode = useRef(null);
    const gainNode = useRef(null);

    useEffect(() => {
        const fetchProjects = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('chordcraft_projects')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    setProjects(data || []);
                } catch (err) {
                    console.error('Error fetching projects:', err);
                }
            }
        };
        fetchProjects();
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleGenerateCode = async () => {
        if (!selectedFile) {
            setError('Please select an audio file first');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('audio', selectedFile);

            const response = await axios.post(
                import.meta.env.PROD 
                    ? 'https://chord-craft-l32h.vercel.app/api/analyze'
                    : 'http://localhost:5000/api/analyze',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.success) {
                setChordCraftCode(response.data.chordCraftCode);
                setMusicAnalysis(response.data.analysis);
                setSuccess(`Audio analysis completed successfully! (${response.data.analysis_type || 'Muzic AI'})`);
            } else {
                setError(response.data.error || 'Analysis failed');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayCode = async () => {
        if (!chordCraftCode) return;

        try {
            if (isPlaying) {
                // Stop playback
                if (sourceNode.current) {
                    sourceNode.current.stop();
                    sourceNode.current = null;
                }
                setIsPlaying(false);
                return;
            }

            // Initialize audio context
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
                gainNode.current = audioContext.current.createGain();
                gainNode.current.connect(audioContext.current.destination);
            }

            // Parse and play ChordCraft code
            const lines = chordCraftCode.split('\n');
            const playCommands = lines.filter(line => line.trim().startsWith('PLAY'));
            
            const notes = [];

            playCommands.forEach(cmd => {
                const parts = cmd.split(' ');
                if (parts.length >= 6) {
                    const note = parts[1];
                    const duration = parseFloat(parts[3].replace('s', ''));
                    const startTime = parseFloat(parts[5].replace('s', ''));
                    
                    notes.push({ note, duration, startTime });
                }
            });

            // Sort notes by start time
            notes.sort((a, b) => a.startTime - b.startTime);

            // Play notes
            notes.forEach(({ note, duration, startTime }) => {
                setTimeout(() => {
                    if (audioContext.current && audioContext.current.state === 'running') {
                        const oscillator = audioContext.current.createOscillator();
                        const gain = audioContext.current.createGain();
                        
                        oscillator.frequency.setValueAtTime(noteToFreq(note), audioContext.current.currentTime);
                        oscillator.type = 'sine';
                        
                        gain.gain.setValueAtTime(0, audioContext.current.currentTime);
                        gain.gain.linearRampToValueAtTime(0.1, audioContext.current.currentTime + 0.01);
                        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + duration);
                        
                        oscillator.connect(gain);
                        gain.connect(gainNode.current);
                        
                        oscillator.start(audioContext.current.currentTime);
                        oscillator.stop(audioContext.current.currentTime + duration);
                    }
                }, startTime * 1000);
            });

            setIsPlaying(true);

        } catch (err) {
            setError(`Playback error: ${err.message}`);
        }
    };

    const handleAnalyzeCode = async () => {
        if (!chordCraftCode) return;

        setIsGeneratingMusic(true);
        setError('');

        try {
            const response = await axios.post(
                import.meta.env.PROD 
                    ? 'https://chord-craft-l32h.vercel.app/api/generate-music'
                    : 'http://localhost:5000/api/generate-music',
                { code: chordCraftCode }
            );

            if (response.data.success) {
                setMusicAnalysis(response.data);
                setSuccess('Code analysis completed successfully!');
            } else {
                setError(response.data.error || 'Analysis failed');
            }
        } catch (err) {
            setError(`Analysis error: ${err.message}`);
        } finally {
            setIsGeneratingMusic(false);
        }
    };

    const handleSaveProject = async () => {
        if (!user) return;

        try {
            const projectData = {
                user_id: user.id,
                title: projectTitle,
                code_content: chordCraftCode,
                music_analysis: musicAnalysis
            };

            if (projectId) {
                const { error } = await supabase
                    .from('chordcraft_projects')
                    .update(projectData)
                    .eq('id', projectId);
                
                if (error) throw error;
                setSaveStatus('Project updated successfully!');
            } else {
                const { data, error } = await supabase
                    .from('chordcraft_projects')
                    .insert(projectData)
                    .select()
                    .single();
                
                if (error) throw error;
                setProjectId(data.id);
                setSaveStatus('Project saved successfully!');
            }

            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            setError(`Save error: ${err.message}`);
        }
    };

    const handleLoadProject = async (projectId) => {
        if (!projectId) return;

        try {
            const { data, error } = await supabase
                .from('chordcraft_projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error) throw error;

            setProjectId(data.id);
            setProjectTitle(data.title);
            setChordCraftCode(data.code_content);
            setMusicAnalysis(data.music_analysis);
            setSuccess('Project loaded successfully!');
        } catch (err) {
            setError(`Load error: ${err.message}`);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(chordCraftCode);
        setSuccess('Code copied to clipboard!');
        setTimeout(() => setSuccess(''), 2000);
    };

    if (viewMode === 'timeline') {
        return (
            <TimelineProvider>
                <TimelineStudio />
            </TimelineProvider>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">ChordCraft Studio</h1>
                            <p className="text-slate-400">Welcome, {user?.email}</p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
                        <Button
                            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('timeline')}
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Timeline
                        </Button>
                        <Button
                            variant={viewMode === 'classic' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('classic')}
                        >
                            <Code className="w-4 h-4 mr-2" />
                            Classic
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="studio" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="studio">Music Studio</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="studio" className="space-y-6">
                        {/* Project Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Management</CardTitle>
                                <CardDescription>Create and manage your musical projects</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Project name"
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSaveProject}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                                {saveStatus && (
                                    <Badge variant="secondary" className="text-green-600">
                                        {saveStatus}
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>

                        {/* Audio to Code */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Audio to Code</CardTitle>
                                <CardDescription>Convert your audio files to ChordCraft code</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                    <Button onClick={handleGenerateCode} disabled={isLoading || !selectedFile}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {isLoading ? 'Analyzing...' : 'Generate Code'}
                                    </Button>
                                </div>
                                
                                {isLoading && (
                                    <div className="space-y-2">
                                        <Progress value={66} className="w-full" />
                                        <p className="text-sm text-slate-400">Processing audio with Muzic AI...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Live Code Studio */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Live Code Studio</CardTitle>
                                <CardDescription>Edit and play your ChordCraft code</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex space-x-2">
                                    <Button variant="outline" onClick={handleCopyCode}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                    <Button onClick={handlePlayCode} disabled={!chordCraftCode}>
                                        {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                        {isPlaying ? 'Stop' : 'Play Code'}
                                    </Button>
                                    <Button variant="outline" onClick={handleAnalyzeCode} disabled={isGeneratingMusic || !chordCraftCode}>
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        {isGeneratingMusic ? 'Analyzing...' : 'Analyze Code'}
                                    </Button>
                                </div>

                                <div className="border rounded-lg">
                                    <Editor
                                        value={chordCraftCode}
                                        onValueChange={setChordCraftCode}
                                        highlight={code => highlight(code, languages.chordcraft, 'chordcraft')}
                                        padding={15}
                                        style={{
                                            fontFamily: '"JetBrains Mono", monospace',
                                            fontSize: 14,
                                            backgroundColor: 'hsl(var(--muted))',
                                            color: 'hsl(var(--foreground))',
                                            minHeight: '200px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                        }}
                                    />
                                </div>

                                <div className="text-sm text-slate-400 space-y-1">
                                    <p>💡 Edit the generated code above and click "Play Code" to hear your changes!</p>
                                    <p>🎵 Click "Analyze Code" to see musical features and visualization!</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Music Analysis */}
                        {musicAnalysis && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Music Analysis</CardTitle>
                                    <CardDescription>AI-powered musical insights</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-400">
                                                {musicAnalysis.tempo_estimate || 120}
                                            </div>
                                            <div className="text-sm text-slate-400">BPM</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-400">
                                                {musicAnalysis.key_signature || 'C major'}
                                            </div>
                                            <div className="text-sm text-slate-400">Key</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-400">
                                                {musicAnalysis.time_signature || '4/4'}
                                            </div>
                                            <div className="text-sm text-slate-400">Time Signature</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-400">
                                                {musicAnalysis.musical_features?.total_notes || 0}
                                            </div>
                                            <div className="text-sm text-slate-400">Notes</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Status Messages */}
                        {error && (
                            <Card className="border-red-500">
                                <CardContent className="pt-6">
                                    <div className="text-red-400">Error: {error}</div>
                                </CardContent>
                            </Card>
                        )}
                        {success && (
                            <Card className="border-green-500">
                                <CardContent className="pt-6">
                                    <div className="text-green-400">Success: {success}</div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="projects">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Projects</CardTitle>
                                <CardDescription>Manage your saved musical projects</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-800 cursor-pointer"
                                            onClick={() => handleLoadProject(project.id)}
                                        >
                                            <div>
                                                <div className="font-medium">{project.title}</div>
                                                <div className="text-sm text-slate-400">
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge variant="outline">
                                                {project.code_content?.split('\n').length || 0} lines
                                            </Badge>
                                        </div>
                                    ))}
                                    {projects.length === 0 && (
                                        <div className="text-center py-8 text-slate-400">
                                            No projects yet. Create your first musical project!
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>Configure your ChordCraft experience</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Dark Mode</div>
                                        <div className="text-sm text-slate-400">Use dark theme</div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Auto-save</div>
                                        <div className="text-sm text-slate-400">Automatically save changes</div>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="pt-4">
                                    <Button variant="outline" onClick={signOut} className="w-full">
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}