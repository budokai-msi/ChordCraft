import React, { useState, useRef, useEffect } from 'react';

const MusicStudio = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Initialize audio visualization
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const drawWaveform = () => {
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;
          
          for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            
            const hue = (i / bufferLength) * 360;
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
          }
        }
        requestAnimationFrame(drawWaveform);
      };
      
      drawWaveform();
    }
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setupAudioVisualization(file);
    }
  };

  const setupAudioVisualization = (file) => {
    const audio = new Audio(URL.createObjectURL(file));
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaElementSource(audio);
    analyserRef.current = audioContextRef.current.createAnalyser();
    
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    
    analyserRef.current.fftSize = 256;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(blob));
        setupAudioVisualization(file);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async () => {
    if (!audioFile) return;
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        setGeneratedCode(result.chordCraftCode);
        setAnalysisType(result.analysisType);
      } else {
        console.error('Analysis failed:', result.error);
      }
    } catch (error) {
      console.error('Error analyzing audio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveProject = () => {
    if (generatedCode && audioFile) {
      const project = {
        id: Date.now(),
        name: `Project ${new Date().toLocaleString()}`,
        code: generatedCode,
        analysisType,
        audioName: audioFile.name,
        timestamp: new Date().toISOString()
      };
      
      const updated = [...savedProjects, project];
      setSavedProjects(updated);
      localStorage.setItem('chordcraft_projects', JSON.stringify(updated));
      setCurrentProject(project);
    }
  };

  const loadProject = (project) => {
    setCurrentProject(project);
    setGeneratedCode(project.code);
    setAnalysisType(project.analysisType);
  };

  // Load saved projects on mount
  useEffect(() => {
    const saved = localStorage.getItem('chordcraft_projects');
    if (saved) {
      setSavedProjects(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-30"
        />
      </div>
      
      {/* Glowing Border */}
      <div className="fixed top-0 left-0 w-full h-full z-10 pointer-events-none border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-border animate-pulse opacity-50"></div>
      
      <div className="relative z-20 p-6">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-tighter">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              ChordCraft
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Music to Code • Live Studio • AI Enhanced</p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Audio Input */}
          <div className="space-y-6">
            {/* Audio Upload Section */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">Audio Input</h2>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2">🎵</div>
                  <p className="text-slate-400">Click to upload audio file</p>
                  <p className="text-xs text-slate-500 mt-1">WAV, MP3, M4A supported</p>
                </div>

                {/* Recording Controls */}
                <div className="flex gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-500 animate-pulse' 
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                  </button>
                </div>

                {/* Audio Preview */}
                {audioUrl && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <audio controls className="w-full" src={audioUrl} />
                    <p className="text-xs text-slate-400 mt-2">
                      {audioFile?.name || 'Recorded Audio'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Controls */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">Analysis</h2>
              
              <div className="space-y-4">
                <button
                  onClick={analyzeAudio}
                  disabled={!audioFile || isAnalyzing}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing with AI...
                    </div>
                  ) : (
                    '✨ Generate ChordCraft Code'
                  )}
                </button>

                {analysisType && (
                  <div className="text-center">
                    <span className="inline-block bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      {analysisType === 'muzic_enhanced' ? '🧠 AI Enhanced' : '🎵 Basic Analysis'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Projects */}
            {savedProjects.length > 0 && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-200">Saved Projects</h2>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => loadProject(project)}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-slate-400">{project.audioName}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(project.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Generated Code */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-200">Generated ChordCraft Code</h2>
                {generatedCode && (
                  <button
                    onClick={saveProject}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-sm font-semibold transition-colors"
                  >
                    💾 Save Project
                  </button>
                )}
              </div>
              
              <div className="bg-slate-950/80 rounded-2xl p-4 h-96 overflow-auto font-mono text-sm">
                {generatedCode ? (
                  <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">
                    {generatedCode}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎼</div>
                      <p>Upload audio and click "Generate ChordCraft Code"</p>
                      <p className="text-sm mt-2">Your musical masterpiece will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              {generatedCode && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm transition-colors"
                  >
                    📋 Copy Code
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedCode], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `chordcraft_${Date.now()}.txt`;
                      a.click();
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm transition-colors"
                  >
                    💾 Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <footer className="text-center mt-12 text-slate-600">
          <p className="text-sm">
            🎵 Powered by Muzic AI • Enhanced Music Understanding • ChordCraft Studio
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MusicStudio;
