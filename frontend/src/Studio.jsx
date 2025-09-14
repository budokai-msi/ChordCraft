import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from './chordcraft.grammar.js';
import { useAuth } from './Auth';
import { supabase } from './supabaseClient';

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
                    console.error('❌ Supabase connection failed:', error);
                } else {
                    console.log('✅ Connected to violet book project! Total projects:', data);
                }
            } catch (err) {
                console.error('❌ Connection error:', err);
            }
        };
        
        testConnection();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
            setSuccess('');
            setProjectId(null);
            setProjectTitle(`Project from ${file.name}`);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const file = new File([blob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
                setSelectedFile(file);
                setProjectTitle(`Recording ${new Date().toLocaleTimeString()}`);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            setError('Could not access microphone. Please check permissions.');
            console.error('Recording error:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setMediaRecorder(null);
            setIsRecording(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) { 
            setError('Please select an audio file or record audio first.'); 
            return; 
        }
        
        setIsLoading(true);
        setError('');
        setSuccess('');
        
        const formData = new FormData();
        formData.append('audio', selectedFile);
        
        try {
            // Use your deployed Vercel backend API
            const apiUrl = 'https://chord-craft-git-main-budokai-msis-projects.vercel.app/api/analyze';

            console.log('Sending request to:', apiUrl);

            const response = await axios.post(apiUrl, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000 // 30 second timeout
            });
            
            console.log('Response:', response.data);
            
            if (response.data.success) {
                setChordCraftCode(response.data.chordCraftCode);
                setSuccess('Audio analysis completed successfully!');
            } else {
                setError(response.data.error || 'Analysis failed');
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError('Could not connect to the backend server. Make sure it\'s running on port 5000.');
            } else if (err.response) {
                setError(`Server error: ${err.response.data?.error || err.response.statusText}`);
            } else {
                setError('Failed to analyze audio. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlay = () => {
        if (!chordCraftCode || chordCraftCode.includes('Upload an audio file')) return;
        
        // Close existing audio context
        if (audioContextRef.current) { 
            audioContextRef.current.close(); 
        }
        
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const audioContext = audioContextRef.current;
        const startTime = audioContext.currentTime;
        const lines = chordCraftCode.split('\n');
        
        lines.forEach(line => {
            if (line.startsWith('PLAY')) {
                const parts = line.split(' ');
                if (parts.length < 6) return;
                
                const noteName = parts[1];
                const durationStr = parts[3];
                const playAtStr = parts[5];
                
                const duration = parseFloat(durationStr.replace('s', ''));
                const playAt = parseFloat(playAtStr.replace('s', ''));
                
                if (isNaN(duration) || isNaN(playAt)) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.type = 'sine';
                oscillator.frequency.value = noteToFreq(noteName);
                
                const noteStartTime = startTime + playAt;
                const noteStopTime = noteStartTime + duration;
                gainNode.gain.setValueAtTime(0.3, noteStartTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, noteStopTime);
                
                oscillator.start(noteStartTime);
                oscillator.stop(noteStopTime);
            }
        });
    };

    const handleSaveProject = async () => {
        if (!projectTitle.trim()) { 
            setSaveStatus('Please enter a project title.'); 
            setTimeout(() => setSaveStatus(''), 3000); 
            return; 
        }
        
        setSaveStatus('Saving...');
        const projectData = { 
            id: projectId, 
            user_id: user.id, 
            title: projectTitle.trim(), 
            code_content: chordCraftCode,
            created_at: projectId ? undefined : new Date().toISOString()
        };
        
        try {
            const { data, error } = await supabase.from('chordcraft_projects').upsert(projectData).select();
            if (error) {
                setSaveStatus('Error saving project.');
                console.error('Error saving to Supabase:', error);
            } else {
                setSaveStatus(`Project "${projectTitle}" saved successfully!`);
                if (data && data.length > 0) {
                    setProjectId(data[0].id);
                    // Refresh project list
                    const { data: updatedProjects } = await supabase
                        .from('chordcraft_projects')
                        .select('id, title, description, created_at, updated_at')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false });
                    setProjects(updatedProjects || []);
                }
            }
        } catch (err) {
            setSaveStatus('Error connecting to database.');
            console.error('Supabase error:', err);
        }
        
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleLoadProject = async (selectedProjectId) => {
        if (!selectedProjectId) {
            setProjectId(null);
            setProjectTitle('Untitled Project');
            setChordCraftCode('// New blank project. Start coding!');
            setMusicAnalysis(null);
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('chordcraft_projects')
                .select('*')
                .eq('id', selectedProjectId)
                .eq('user_id', user.id)
                .single();
                
            if (error) {
                console.error('Error loading project:', error);
                setError('Could not load the selected project.');
            } else {
                setProjectId(data.id);
                setProjectTitle(data.title);
                setChordCraftCode(data.code_content);
                setError('');
                setSuccess(`Loaded project: ${data.title}`);
                setTimeout(() => setSuccess(''), 3000);
                
                // Auto-analyze the loaded code
                if (data.code_content && !data.code_content.includes('Upload an audio file')) {
                    handleCodeToMusic(data.code_content);
                }
            }
        } catch (err) {
            console.error('Error loading project:', err);
            setError('Failed to load project.');
        }
    };

    const handleCodeToMusic = async (codeToAnalyze = null) => {
        const code = codeToAnalyze || chordCraftCode;
        
        if (!code || code.includes('Upload an audio file')) {
            setError('Please generate or write some ChordCraft code first.');
            return;
        }
        
        setIsGeneratingMusic(true);
        setError('');
        
        try {
            const apiUrl = 'https://chord-craft-git-main-budokai-msis-projects.vercel.app/api/generate-music';
            
            const response = await axios.post(apiUrl, { code }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
            
            if (response.data.success) {
                setMusicAnalysis(response.data);
                setSuccess('Code analyzed successfully! Musical features extracted.');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.data.error || 'Code analysis failed');
            }
        } catch (err) {
            console.error('Error analyzing code:', err);
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError('Could not connect to the backend server.');
            } else if (err.response) {
                setError(`Server error: ${err.response.data?.error || err.response.statusText}`);
            } else {
                setError('Failed to analyze code. Please try again.');
            }
        } finally {
            setIsGeneratingMusic(false);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-8 font-mono">
            <header className="w-full max-w-6xl flex justify-between items-center mb-10">
                <div className="text-left">
                    <h1 className="text-5xl font-bold text-cyan-400">ChordCraft Studio</h1>
                    <p className="text-gray-400 text-sm mt-2">Welcome, {user?.email}</p>
                </div>
                <button 
                    onClick={signOut} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Sign Out
                </button>
            </header>

            <main className="w-full max-w-6xl">
                {/* Project Management */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Project Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select 
                            onChange={(e) => handleLoadProject(e.target.value)} 
                            value={projectId || ""} 
                            className="p-3 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            <option value="">-- Create New Project --</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="text" 
                            value={projectTitle} 
                            onChange={(e) => setProjectTitle(e.target.value)} 
                            placeholder="Project Title" 
                            className="p-3 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-cyan-400" 
                        />
                        <button 
                            onClick={handleSaveProject} 
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded transition-colors"
                        >
                            💾 Save Project
                        </button>
                    </div>
                    {saveStatus && <p className="text-sm text-center text-green-400 mt-2">{saveStatus}</p>}
                </div>

                {/* Audio Input */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-300">Audio to Code</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="audio-upload" className="block text-gray-300 text-sm font-bold mb-2">
                                    Upload Audio File
                                </label>
                                <input 
                                    id="audio-upload" 
                                    type="file" 
                                    accept="audio/*" 
                                    onChange={handleFileChange} 
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600" 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">
                                    Record Live Audio
                                </label>
                                <button 
                                    type="button"
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
                                        isRecording 
                                            ? 'bg-red-600 hover:bg-red-500 animate-pulse' 
                                            : 'bg-green-600 hover:bg-green-500'
                                    }`}
                                >
                                    {isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
                                </button>
                            </div>
                        </div>
                        
                        {selectedFile && (
                            <div className="bg-gray-700 rounded p-3">
                                <p className="text-sm text-gray-300">
                                    Selected: <span className="text-cyan-400">{selectedFile.name}</span>
                                </p>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={isLoading || !selectedFile} 
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Analyzing Audio...
                                </span>
                            ) : (
                                '✨ Generate ChordCraft Code'
                            )}
                        </button>
                    </form>

                    {error && <p className="text-red-400 mt-4 text-center bg-red-900/20 p-3 rounded">{error}</p>}
                    {success && <p className="text-green-400 mt-4 text-center bg-green-900/20 p-3 rounded">{success}</p>}
                </div>
                
                {/* Code Studio */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-300">Live Code Studio</h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigator.clipboard.writeText(chordCraftCode)}
                                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm transition-colors"
                            >
                                📋 Copy
                            </button>
                            <button 
                                onClick={handlePlay} 
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded transition-colors"
                            >
                                ▶️ Play Code
                            </button>
                            <button 
                                onClick={() => handleCodeToMusic()}
                                disabled={isGeneratingMusic || !chordCraftCode || chordCraftCode.includes('Upload an audio file')}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGeneratingMusic ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Analyzing...
                                    </span>
                                ) : (
                                    '🎼 Analyze Code'
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
                        <Editor 
                            value={chordCraftCode} 
                            onValueChange={code => setChordCraftCode(code)} 
                            highlight={code => highlight(code, languages.chordcraft, 'chordcraft')} 
                            padding={16} 
                            className="w-full h-80 font-mono text-sm" 
                            style={{ 
                                fontFamily: '"Fira Code", "Fira Mono", monospace', 
                                fontSize: 14,
                                lineHeight: 1.5
                            }} 
                        />
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                        <p>💡 Tip: Edit the generated code above and click "Play Code" to hear your changes!</p>
                        <p>🎼 Click "Analyze Code" to see musical features and visualization!</p>
                    </div>
                </div>

                {/* Musical Analysis Section */}
                {musicAnalysis && (
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
                        <h2 className="text-xl font-semibold text-gray-300 mb-4">🎼 Musical Analysis (Code-to-Music)</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Musical Features */}
                            <div className="bg-gray-900 rounded-lg p-4">
                                <h3 className="font-semibold text-cyan-400 mb-3">Musical Features</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Notes:</span>
                                        <span className="text-white">{musicAnalysis.musical_features?.total_notes || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-white">{musicAnalysis.musical_features?.duration?.toFixed(2) || 0}s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Estimated Tempo:</span>
                                        <span className="text-white">{musicAnalysis.musical_features?.tempo_estimate || 120} BPM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Key:</span>
                                        <span className="text-white">{musicAnalysis.analysis?.estimated_key || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Frequency Range:</span>
                                        <span className="text-white">
                                            {musicAnalysis.musical_features?.frequency_range?.min?.toFixed(0) || 0}Hz - 
                                            {musicAnalysis.musical_features?.frequency_range?.max?.toFixed(0) || 0}Hz
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Note Timeline */}
                            <div className="bg-gray-900 rounded-lg p-4">
                                <h3 className="font-semibold text-cyan-400 mb-3">Note Timeline</h3>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {musicAnalysis.notes && musicAnalysis.notes.map((note, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs bg-gray-800 p-2 rounded">
                                            <span className="font-mono text-green-400">{note.note}</span>
                                            <span className="text-gray-400">{note.start_time.toFixed(2)}s</span>
                                            <span className="text-gray-400">{note.duration.toFixed(2)}s</span>
                                            <span className="text-blue-400">{note.frequency.toFixed(0)}Hz</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Audio Visualization */}
                        {musicAnalysis.audio_data && musicAnalysis.audio_data.length > 0 && (
                            <div className="mt-6 bg-gray-900 rounded-lg p-4">
                                <h3 className="font-semibold text-cyan-400 mb-3">Audio Waveform Visualization</h3>
                                <div className="flex items-center justify-center h-32 bg-black rounded">
                                    <svg width="100%" height="100%" viewBox="0 0 400 100" className="w-full h-full">
                                        {musicAnalysis.audio_data.map((point, index) => (
                                            <rect
                                                key={index}
                                                x={index * (400 / musicAnalysis.audio_data.length)}
                                                y={50 - (point.amplitude * 40)}
                                                width={400 / musicAnalysis.audio_data.length - 1}
                                                height={Math.abs(point.amplitude * 80)}
                                                fill={`hsl(${(index / musicAnalysis.audio_data.length) * 360}, 70%, 60%)`}
                                                opacity="0.8"
                                            />
                                        ))}
                                    </svg>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>0s</span>
                                    <span>Time</span>
                                    <span>{musicAnalysis.musical_features?.duration?.toFixed(1) || 0}s</span>
                                </div>
                            </div>
                        )}

                        {/* Harmony Analysis */}
                        {musicAnalysis.analysis?.harmony && (
                            <div className="mt-6 bg-gray-900 rounded-lg p-4">
                                <h3 className="font-semibold text-cyan-400 mb-3">Harmony Analysis</h3>
                                <div className="text-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Primary Chord:</span>
                                        <span className="text-white">{musicAnalysis.analysis.harmony.primary_chord}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-white capitalize">{musicAnalysis.analysis.harmony.type}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}