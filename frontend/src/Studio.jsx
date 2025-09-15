import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from './chordcraft.grammar.js';
import { useAuth } from './Auth';
import { supabase } from './supabaseClient';
import { TimelineProvider } from './TimelineContext';
import { TimelineStudio } from './TimelineStudio';
import './design-system.css';

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
    const audioContextRef = useRef(null);
    const [projectId, setProjectId] = useState(null);
    const [projectTitle, setProjectTitle] = useState('Untitled Project');
    const [saveStatus, setSaveStatus] = useState('');
    const [projects, setProjects] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [musicAnalysis, setMusicAnalysis] = useState(null);
    const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('chordcraft_projects')
                        .select('id, title, description, created_at, updated_at')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false });
                    if (error) {
                        console.error('Error fetching projects:', error);
                    } else {
                        setProjects(data || []);
                    }
                } catch (err) {
                    console.error('Error connecting to Supabase:', err);
                }
            }
        };
        fetchProjects();
    }, [user]);

    // Test connection to new violet book database
    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('🔍 Testing Supabase violet book connection...');
                const { data, error } = await supabase
                    .from('chordcraft_projects')
                    .select('count', { count: 'exact' });
                
                if (error) {
                    console.error('❌ Supabase connection error:', error);
                } else {
                    console.log('✅ Connected to violet book project! Total projects:', data);
                }
            } catch (err) {
                console.error('❌ Connection test failed:', err);
            }
        };
        testConnection();
    }, []);

    // Animation trigger
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
            setSuccess('');
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
                setSelectedFile(file);
                setSuccess('Recording completed!');
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            setError('Microphone access denied or not available');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setMediaRecorder(null);
            setIsRecording(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError('Please select an audio file first');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('audio', selectedFile);

        try {
            const apiUrl = import.meta.env.PROD 
                ? 'https://chord-craft-l32h.vercel.app/api/analyze'
                : 'http://localhost:5000/api/analyze';

            console.log('Sending request to:', apiUrl);

            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000
            });
            
            console.log('Response:', response.data);
            
            if (response.data.success) {
                setChordCraftCode(response.data.chordCraftCode);
                setSuccess(`Audio analysis completed successfully! (${response.data.analysis_type || 'Muzic AI'})`);
                console.log('Muzic Analysis:', response.data.analysis);
            } else {
                setError(response.data.error || 'Analysis failed');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError('Could not connect to the backend server. Make sure it\'s running on port 5000.');
            } else if (err.response) {
                setError(`Server error: ${err.response.data.error || err.response.statusText}`);
            } else {
                setError(`Upload failed: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlay = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;
        const lines = chordCraftCode.split('\n');
        
        lines.forEach((line, index) => {
            if (line.trim().startsWith('PLAY')) {
                const parts = line.split(' ');
                if (parts.length >= 6) {
                    const note = parts[1];
                    const duration = parseFloat(parts[3].replace('s', ''));
                    const startTime = parseFloat(parts[5].replace('s', ''));
                    
                    const frequency = noteToFreq(note);
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
                    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
                    
                    oscillator.start(audioContext.currentTime + startTime);
                    oscillator.stop(audioContext.currentTime + startTime + duration);
                }
            }
        });
    };

    const handleCodeToMusic = async () => {
        if (!chordCraftCode || chordCraftCode.includes('Upload an audio file')) {
            setError('Please generate or enter some ChordCraft code first');
            return;
        }

        setIsGeneratingMusic(true);
        setError('');

        try {
            const apiUrl = import.meta.env.PROD 
                ? 'https://chord-craft-l32h.vercel.app/api/generate-music'
                : 'http://localhost:5000/api/generate-music';

            const response = await axios.post(apiUrl, {
                code: chordCraftCode
            });

            if (response.data.success) {
                setMusicAnalysis(response.data);
                setSuccess('Code analysis completed! Check the musical features below.');
            } else {
                setError(response.data.error || 'Analysis failed');
            }
        } catch (err) {
            console.error('Error analyzing code:', err);
            setError(`Analysis failed: ${err.message}`);
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
                description: `Project created on ${new Date().toLocaleDateString()}`
            };

            if (projectId) {
                projectData.id = projectId;
            }

            const { error } = await supabase
                .from('chordcraft_projects')
                .upsert(projectData);

            if (error) {
                console.error('Error saving project:', error);
                setSaveStatus('Failed to save project');
            } else {
                setSaveStatus('Project saved successfully!');
                setProjectId(projectData.id);
                
                // Refresh projects list
                const { data } = await supabase
                    .from('chordcraft_projects')
                    .select('id, title, description, created_at, updated_at')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });
                setProjects(data || []);
            }
        } catch (err) {
            console.error('Error saving project:', err);
            setSaveStatus('Failed to save project');
        }
    };

    const handleLoadProject = async (projectId) => {
        if (!projectId) {
            setProjectId(null);
            setProjectTitle('Untitled Project');
            setChordCraftCode('// Upload an audio file to generate ChordCraft code...\n// Or start coding your own musical creation!');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('chordcraft_projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error) {
                console.error('Error loading project:', error);
            } else {
                setProjectId(data.id);
                setProjectTitle(data.title);
                setChordCraftCode(data.code_content);
                setSuccess('Project loaded successfully!');
            }
        } catch (err) {
            console.error('Error loading project:', err);
        }
    };

    // FORCE TIMELINE STUDIO - DEBUG
    console.log('🔍 Studio render - viewMode:', viewMode);
    
    if (viewMode === 'timeline') {
        console.log('✅ Rendering TimelineStudio');
        return (
            <TimelineProvider>
                <TimelineStudio />
            </TimelineProvider>
        );
    }
    
    console.log('❌ Rendering Classic Studio instead of Timeline');

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-500/10 to-yellow-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="glass-strong border-b border-white/10 p-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <div>
                                <h1 className="text-display-sm font-bold text-white">ChordCraft</h1>
                                <p className="text-sm text-slate-400">Welcome, {user?.email}</p>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 glass rounded-2xl p-1">
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    viewMode === 'timeline'
                                        ? 'bg-white text-slate-900 shadow-lg'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                🎼 Timeline
                            </button>
                            <button
                                onClick={() => setViewMode('classic')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    viewMode === 'classic'
                                        ? 'bg-white text-slate-900 shadow-lg'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                            >
                                🎵 Classic
                            </button>
                        </div>

                        <button
                            onClick={signOut}
                            className="btn btn-ghost text-white border-white/20 hover:bg-white/10"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Main Studio */}
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Project Management */}
                        <section className="mb-8">
                            <div className="card-glass p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Project Management
                                </h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Load Project
                                        </label>
                                        <select
                                            onChange={(e) => handleLoadProject(e.target.value)}
                                            value={projectId || ""}
                                            className="input input-glass w-full"
                                        >
                                            <option value="">-- Create New Project --</option>
                                            {projects.map((project) => (
                                                <option key={project.id} value={project.id}>
                                                    {project.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Project Title
                                        </label>
                                        <input
                                            type="text"
                                            value={projectTitle}
                                            onChange={(e) => setProjectTitle(e.target.value)}
                                            placeholder="Enter project title..."
                                            className="input input-glass w-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={handleSaveProject}
                                        className="btn btn-primary"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Save Project
                                    </button>
                                    
                                    {saveStatus && (
                                        <div className={`px-4 py-2 rounded-lg text-sm ${
                                            saveStatus.includes('success') 
                                                ? 'bg-green-900/20 text-green-400' 
                                                : 'bg-red-900/20 text-red-400'
                                        }`}>
                                            {saveStatus}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Audio Input */}
                        <section className="mb-8">
                            <div className="card-glass p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Audio Input
                                </h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Upload Audio File
                                        </label>
                                        <div className="border-2 border-dashed border-slate-600/50 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors group">
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎵</div>
                                            <p className="text-slate-400 mb-3">Drop your audio here or click to browse</p>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="audio-upload"
                                            />
                                            <label
                                                htmlFor="audio-upload"
                                                className="btn btn-secondary btn-sm cursor-pointer"
                                            >
                                                Choose File
                                            </label>
                                        </div>
                                        {selectedFile && (
                                            <div className="mt-3 p-3 bg-slate-800/30 rounded-lg text-sm text-slate-300">
                                                📁 {selectedFile.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Live Recording */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Live Recording
                                        </label>
                                        <div className="text-center">
                                            <button
                                                onClick={isRecording ? stopRecording : startRecording}
                                                className={`btn btn-lg w-full ${
                                                    isRecording
                                                        ? 'btn-secondary animate-pulse'
                                                        : 'btn-primary'
                                                }`}
                                            >
                                                {isRecording ? (
                                                    <>
                                                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                                                        Stop Recording
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                        </svg>
                                                        Record Live Audio
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading || !selectedFile}
                                        className="btn btn-primary btn-lg group"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Analyzing with Muzic AI...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Generate ChordCraft Code
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Status Messages */}
                                {error && (
                                    <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-400 text-center">
                                        {success}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Code Studio */}
                        <section className="mb-8">
                            <div className="card-glass p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    Live Code Studio
                                </h2>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(chordCraftCode)}
                                        className="btn btn-ghost text-white border-white/20 hover:bg-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy Code
                                    </button>
                                    
                                    <button
                                        onClick={handlePlay}
                                        className="btn btn-primary"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Play Code
                                    </button>
                                    
                                    <button
                                        onClick={handleCodeToMusic}
                                        disabled={isGeneratingMusic || !chordCraftCode || chordCraftCode.includes('Upload an audio file')}
                                        className="btn btn-secondary"
                                    >
                                        {isGeneratingMusic ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Analyze Code
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Code Editor */}
                                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                    <Editor
                                        value={chordCraftCode}
                                        onValueChange={code => setChordCraftCode(code)}
                                        highlight={code => highlight(code, languages.chordcraft, 'chordcraft')}
                                        padding={20}
                                        className="w-full h-96 font-mono text-sm"
                                        style={{
                                            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            backgroundColor: 'transparent',
                                            color: '#f1f5f9'
                                        }}
                                    />
                                </div>

                                {/* Help Text */}
                                <div className="mt-4 p-4 bg-slate-800/30 rounded-xl text-sm text-slate-400">
                                    <p className="flex items-center gap-2">
                                        💡 Edit the generated code above and click "Play Code" to hear your changes!
                                    </p>
                                    <p className="flex items-center gap-2 mt-2">
                                        🎼 Click "Analyze Code" to see musical features and visualization!
                                    </p>
                                </div>

                                {/* Music Analysis Results */}
                                {musicAnalysis && (
                                    <div className="mt-6 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                        <h3 className="text-lg font-semibold text-white mb-4">Musical Analysis</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-sm text-slate-400">Tempo</div>
                                                <div className="text-lg font-semibold text-white">{musicAnalysis.tempo_estimate || 120} BPM</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-400">Key</div>
                                                <div className="text-lg font-semibold text-white">{musicAnalysis.key_signature || 'C major'}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-400">Time Signature</div>
                                                <div className="text-lg font-semibold text-white">{musicAnalysis.time_signature || '4/4'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}