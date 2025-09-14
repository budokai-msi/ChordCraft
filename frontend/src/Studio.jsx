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
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'classic'
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

    // AuraOS Three.js Background Effect
    useEffect(() => {
        let scene, camera, renderer, prism, clock, mouse;

        const initThree = () => {
            const container = document.getElementById('web3-canvas');
            if (!container) return;

            scene = new window.THREE.Scene();
            camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            const geometry = new window.THREE.IcosahedronGeometry(2.5, 1);
            const material = new window.THREE.MeshPhysicalMaterial({
                roughness: 0.1,
                transmission: 1.0,
                ior: 1.5,
            });
            prism = new window.THREE.Mesh(geometry, material);
            scene.add(prism);

            const light1 = new window.THREE.DirectionalLight(0xffffff, 1.5);
            light1.position.set(10, 10, 10);
            scene.add(light1);
            const light2 = new window.THREE.DirectionalLight(0xff00ff, 1);
            light2.position.set(-10, -5, -5);
            scene.add(light2);
            scene.add(new window.THREE.AmbientLight(0x404040, 2));

            camera.position.z = 7;
            clock = new window.THREE.Clock();
            mouse = new window.THREE.Vector2();
        };

        const animateThree = () => {
            requestAnimationFrame(animateThree);
            if (!clock || !prism || !renderer || !scene || !camera || !mouse) return;
            
            const positionAttribute = prism.geometry.attributes.position;
            const time = Date.now() * 0.0005;
            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = new window.THREE.Vector3().fromBufferAttribute(positionAttribute, i);
                const offset = 2.5 + 0.3 * Math.sin(vertex.y * 3 + time * 1.5);
                vertex.normalize().multiplyScalar(offset);
                positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }
            positionAttribute.needsUpdate = true;
            prism.geometry.computeVertexNormals();

            prism.rotation.y += (mouse.x * Math.PI * 0.05 - prism.rotation.y) * 0.05;
            prism.rotation.x += (-mouse.y * Math.PI * 0.05 - prism.rotation.x) * 0.05;
            
            renderer.render(scene, camera);
        };

        const onMouseMove = (event) => {
            if (mouse) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }
        };

        const onWindowResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        // Initialize Three.js
        if (window.THREE) {
            initThree();
            animateThree();
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('mousemove', onMouseMove);
        }

        // Cleanup
        return () => {
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('mousemove', onMouseMove);
            if (renderer && renderer.domElement) {
                renderer.domElement.remove();
            }
        };
    }, []);

    // AuraOS Hue Animation
    useEffect(() => {
        let hue = 0;
        const hueInterval = setInterval(() => {
            hue = (hue + 1) % 360;
            document.body.style.setProperty('--hue', hue);
        }, 50);

        return () => clearInterval(hueInterval);
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
            const apiUrl = import.meta.env.PROD 
                ? 'https://chord-craft-l32h.vercel.app/api/analyze'
                : 'http://localhost:5000/analyze';

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
            code_content: chordCraftCode
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
            const apiUrl = import.meta.env.PROD 
                ? 'https://chord-craft-l32h.vercel.app/api/generate-music'
                : 'http://localhost:5000/generate-music';
            
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

    // If timeline view is selected, render the Timeline Studio
    if (viewMode === 'timeline') {
        return (
            <TimelineProvider>
                <div className="h-screen w-full relative">
                    {/* View Toggle */}
                    <div className="absolute top-4 right-4 z-50">
                        <div className="glass-pane p-2 rounded-lg">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('timeline')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        viewMode === 'timeline'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                    }`}
                                >
                                    🎼 Timeline
                                </button>
                                <button
                                    onClick={() => setViewMode('classic')}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        viewMode === 'classic'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                    }`}
                                >
                                    🎵 Classic
                                </button>
                            </div>
                        </div>
                    </div>
                    <TimelineStudio />
                </div>
            </TimelineProvider>
        );
    }

    return (
        <>
            {/* AuraOS Styles */}
            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
                
                @keyframes hue-rotate { 
                    0% { filter: hue-rotate(0deg); } 
                    100% { filter: hue-rotate(360deg); } 
                }
                @keyframes spring-in {
                    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                    80% { opacity: 1; transform: translateY(-5px) scale(1.05); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes haptic-shake {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(0.95); }
                    75% { transform: scale(1.05); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
                    50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4); }
                }

                .hue-border { 
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; 
                    pointer-events: none; border: 2px solid transparent; 
                    background-image: linear-gradient(to right, #7e22ce, #be185d, #d97706, #7e22ce); 
                    background-size: 200%; 
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
                    -webkit-mask-composite: xor; mask-composite: exclude;
                    animation: hue-rotate 10s linear infinite;
                }
                .text-glow { 
                    text-shadow: 0 0 16px hsla(260, 100%, 70%, 0.9), 0 0 4px hsla(260, 100%, 70%, 0.7);
                    animation: hue-rotate 10s linear infinite;
                }
                .glass-pane { 
                    background: rgba(10, 10, 12, 0.8); 
                    backdrop-filter: blur(40px); 
                    -webkit-backdrop-filter: blur(40px); 
                    border: 1px solid rgba(255, 255, 255, 0.1); 
                    border-radius: 32px; 
                }
                .section { 
                    animation: spring-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
                }
                .haptic { animation: haptic-shake 0.3s ease; }
                #web3-canvas { 
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; 
                }
                body { 
                    font-family: 'Sora', sans-serif !important; 
                    background-color: #000000; 
                    color: #f1f5f9; 
                    overflow-x: hidden; 
                }
            `}</style>

            {/* Three.js Canvas */}
            <canvas id="web3-canvas" />
            
            {/* Hue Border */}
            <div className="hue-border" />

            <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10" style={{fontFamily: 'Sora, sans-serif', backgroundColor: '#000000', color: '#f1f5f9'}}>
                
                {/* View Toggle */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="glass-pane p-1 rounded-xl">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                    viewMode === 'timeline'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                }`}
                            >
                                🎼
                            </button>
                            <button
                                onClick={() => setViewMode('classic')}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                    viewMode === 'classic'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                }`}
                            >
                                🎵
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="w-full max-w-2xl mx-auto mt-16">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-1">
                            <span className="text-glow">ChordCraft</span>
                        </h1>
                        <p className="text-slate-400 text-xs">AI-Powered Music Studio</p>
                        <p className="text-slate-500 text-xs mt-1">Welcome, {user?.email}</p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        
                        {/* Project Management Bubble */}
                        <div className="glass-pane p-3 rounded-xl hover:scale-105 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                <h3 className="text-xs font-semibold text-white">Project</h3>
                            </div>
                            <div className="space-y-2">
                                <select 
                                    onChange={(e) => handleLoadProject(e.target.value)} 
                                    value={projectId || ""} 
                                    className="w-full px-2 py-1.5 bg-slate-800/30 border border-slate-600/50 text-white text-xs rounded-lg outline-none focus:border-purple-500"
                                >
                                    <option value="">-- New Project --</option>
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
                                    placeholder="Project name..." 
                                    className="w-full px-2 py-1.5 bg-slate-800/30 border border-slate-600/50 text-white text-xs rounded-lg outline-none focus:border-purple-500 placeholder-slate-400" 
                                />
                                <button 
                                    onClick={handleSaveProject} 
                                    className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-medium rounded-lg transition-all"
                                >
                                    💾 Save
                                </button>
                                {saveStatus && <p className="text-xs text-green-400 text-center bg-green-900/20 p-1.5 rounded">{saveStatus}</p>}
                            </div>
                        </div>

                        {/* Audio Upload Bubble */}
                        <div className="glass-pane p-3 rounded-xl hover:scale-105 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <h3 className="text-xs font-semibold text-white">Audio Input</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-3 text-center hover:border-purple-500/50 transition-colors">
                                    <div className="text-xl mb-1">🎵</div>
                                    <p className="text-xs text-slate-400 mb-1">Drop audio here</p>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="audio-upload"
                                    />
                                    <label
                                        htmlFor="audio-upload"
                                        className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-white text-xs rounded cursor-pointer transition-colors"
                                    >
                                        Choose File
                                    </label>
                                </div>
                                {selectedFile && (
                                    <div className="text-xs text-slate-300 bg-slate-800/30 rounded p-1.5">
                                        📁 {selectedFile.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recording & Generate Bubble */}
                    <div className="glass-pane p-3 rounded-xl hover:scale-105 transition-all duration-200 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <h3 className="text-xs font-semibold text-white">Generate Code</h3>
                        </div>
                        <div className="space-y-2">
                            <button 
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                                    isRecording 
                                        ? 'bg-red-600 hover:bg-red-500 animate-pulse' 
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                                }`}
                            >
                                {isRecording ? '🔴 Stop' : '🎤 Record'}
                            </button>
                            
                            <button 
                                type="submit" 
                                onClick={handleSubmit}
                                disabled={isLoading || !selectedFile} 
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-medium py-1.5 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-1">
                                        <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                                        Analyzing...
                                    </span>
                                ) : (
                                    '✨ Generate'
                                )}
                            </button>
                            
                            {error && <p className="text-red-400 text-xs text-center bg-red-900/20 p-1.5 rounded">{error}</p>}
                            {success && <p className="text-green-400 text-xs text-center bg-green-900/20 p-1.5 rounded">{success}</p>}
                        </div>
                    </div>
                
                    {/* Code Studio Bubble */}
                    <div className="glass-pane p-3 rounded-xl hover:scale-105 transition-all duration-200 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                            <h3 className="text-xs font-semibold text-white">Code Studio</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => navigator.clipboard.writeText(chordCraftCode)}
                                    className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-white text-xs rounded transition-all"
                                >
                                    📋 Copy
                                </button>
                                <button 
                                    onClick={handlePlay} 
                                    className="px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-medium rounded transition-all"
                                >
                                    ▶️ Play
                                </button>
                                <button 
                                    onClick={() => handleCodeToMusic()}
                                    disabled={isGeneratingMusic || !chordCraftCode || chordCraftCode.includes('Upload an audio file')}
                                    className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingMusic ? '⏳' : '🎼 Analyze'}
                                </button>
                            </div>
                    
                            <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
                                <Editor 
                                    value={chordCraftCode} 
                                    onValueChange={code => setChordCraftCode(code)} 
                                    highlight={code => highlight(code, languages.chordcraft, 'chordcraft')} 
                                    padding={12} 
                                    className="w-full h-32 font-mono text-xs" 
                                    style={{ 
                                        fontFamily: '"Fira Code", "Fira Mono", monospace', 
                                        fontSize: 10,
                                        lineHeight: 1.4,
                                        backgroundColor: 'transparent'
                                    }} 
                                />
                            </div>
                            
                            <div className="text-xs text-slate-400 bg-slate-800/30 p-2 rounded">
                                <p className="flex items-center gap-1">💡 Edit code and click "Play" to hear changes</p>
                            </div>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={signOut}
                            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white text-xs rounded-lg transition-all"
                        >
                            🚪 Sign Out
                        </button>
                    </div>
                </div>

                {/* Musical Analysis Section */}
                {musicAnalysis && (
                    <section className="section w-full">
                        <label className="block text-sm font-semibold text-slate-300 mb-4 text-center">🎼 Musical Analysis (Code-to-Music)</label>
                        <div className="glass-pane p-8">
                        
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Musical Features */}
                                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                                    <h3 className="font-bold text-xl text-purple-400 mb-4">🎵 Musical Features</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Total Notes:</span>
                                            <span className="text-white font-semibold">{musicAnalysis.musical_features?.total_notes || 0}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Duration:</span>
                                            <span className="text-white font-semibold">{musicAnalysis.musical_features?.duration?.toFixed(2) || 0}s</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Estimated Tempo:</span>
                                            <span className="text-purple-400 font-semibold">{musicAnalysis.musical_features?.tempo_estimate || 120} BPM</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Key:</span>
                                            <span className="text-purple-400 font-semibold">{musicAnalysis.analysis?.estimated_key || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Frequency Range:</span>
                                            <span className="text-white font-semibold text-xs">
                                                {musicAnalysis.musical_features?.frequency_range?.min?.toFixed(0) || 0}Hz - 
                                                {musicAnalysis.musical_features?.frequency_range?.max?.toFixed(0) || 0}Hz
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Note Timeline */}
                                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                                    <h3 className="font-bold text-xl text-cyan-400 mb-4">🎹 Note Timeline</h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {musicAnalysis.notes && musicAnalysis.notes.map((note, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-600">
                                                <span className="font-mono text-green-400 font-bold">{note.note}</span>
                                                <span className="text-slate-400">{note.start_time.toFixed(2)}s</span>
                                                <span className="text-slate-400">{note.duration.toFixed(2)}s</span>
                                                <span className="text-cyan-400 font-semibold">{note.frequency.toFixed(0)}Hz</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Audio Visualization */}
                            {musicAnalysis.audio_data && musicAnalysis.audio_data.length > 0 && (
                                <div className="mt-8 bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                                    <h3 className="font-bold text-xl text-cyan-400 mb-4">🌊 Audio Waveform</h3>
                                    <div className="flex items-center justify-center h-40 bg-black/50 rounded-2xl border border-slate-800">
                                        <svg width="100%" height="100%" viewBox="0 0 400 100" className="w-full h-full">
                                            {musicAnalysis.audio_data.map((point, index) => (
                                                <rect
                                                    key={index}
                                                    x={index * (400 / musicAnalysis.audio_data.length)}
                                                    y={50 - (point.amplitude * 40)}
                                                    width={400 / musicAnalysis.audio_data.length - 1}
                                                    height={Math.abs(point.amplitude * 80)}
                                                    fill={`hsl(${(index / musicAnalysis.audio_data.length) * 360}, 70%, 60%)`}
                                                    opacity="0.9"
                                                />
                                            ))}
                                        </svg>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400 mt-3 px-2">
                                        <span className="font-semibold">0s</span>
                                        <span className="text-slate-500">Timeline</span>
                                        <span className="font-semibold">{musicAnalysis.musical_features?.duration?.toFixed(1) || 0}s</span>
                                    </div>
                                </div>
                            )}

                            {/* Harmony Analysis */}
                            {musicAnalysis.analysis?.harmony && (
                                <div className="mt-8 bg-slate-900/50 border border-slate-700 rounded-2xl p-6">
                                    <h3 className="font-bold text-xl text-pink-400 mb-4">🎭 Harmony Analysis</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Primary Chord:</span>
                                            <span className="text-white font-semibold">{musicAnalysis.analysis.harmony.primary_chord}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-slate-800/50 rounded-xl">
                                            <span className="text-slate-400">Type:</span>
                                            <span className="text-pink-400 font-semibold capitalize">{musicAnalysis.analysis.harmony.type}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
        </>
    );
}