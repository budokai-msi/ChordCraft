import React, { useState, useRef, useEffect } from 'react';
import { useTimeline } from './TimelineContext';
import { Timeline } from './Timeline';
import { LyricsStyleEditor } from './LyricsStyleEditor';
import { ArrangementPanel } from './ArrangementPanel';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism-okaidia.css';
import { chordCraftGrammar } from './chordcraft.grammar.js';

if (languages.chordcraft === undefined) { 
    languages.chordcraft = chordCraftGrammar; 
}

export function TimelineStudio() {
  const { state, actions } = useTimeline();
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Handle sidebar resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 250 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Get the currently selected block's code
  const selectedBlock = state.blocks.find(block => block.id === state.selectedBlockId);
  const currentCode = selectedBlock ? selectedBlock.code : '// Select a block to edit its code...';

  // Handle code changes
  const handleCodeChange = (code) => {
    if (selectedBlock) {
      actions.updateBlock(selectedBlock.id, { code });
    }
  };

  // Three.js Background Effect
  useEffect(() => {
    let scene, camera, renderer, prism, clock, mouse;

    const initThree = () => {
      const container = document.getElementById('web3-canvas');
      if (!container || !window.THREE) return;

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

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (renderer && renderer.domElement) {
        renderer.domElement.remove();
      }
    };
  }, []);

  // Hue animation
  useEffect(() => {
    let hue = 0;
    const hueInterval = setInterval(() => {
      hue = (hue + 1) % 360;
      document.body.style.setProperty('--hue', hue);
    }, 50);

    return () => clearInterval(hueInterval);
  }, []);

  // Handle play code
  const handlePlayCode = () => {
    if (selectedBlock) {
      // This would integrate with the audio playback system
      console.log('Playing code for block:', selectedBlock.id);
    }
  };

  // Handle analyze code
  const handleAnalyzeCode = () => {
    if (selectedBlock) {
      // This would analyze the musical features of the code
      console.log('Analyzing code for block:', selectedBlock.id);
    }
  };

  return (
    <>
      {/* AuraOS Styles */}
      <style jsx>{`
        @keyframes hue-rotate { 
          0% { filter: hue-rotate(0deg); } 
          100% { filter: hue-rotate(360deg); } 
        }
        @keyframes spring-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          80% { opacity: 1; transform: translateY(-5px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
          text-shadow: 0 0 16px hsla(var(--hue, 260), 100%, 70%, 0.9), 0 0 4px hsla(var(--hue, 260), 100%, 70%, 0.7);
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
        .float { animation: float 6s ease-in-out infinite; }
        #web3-canvas { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; 
        }
        body { 
          font-family: 'Sora', sans-serif !important; 
          background-color: #000000; 
          color: #f1f5f9; 
          overflow-x: hidden; 
        }
        
        .code-textarea {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          resize: none !important;
          color: #d4d4d4 !important;
        }
        
        .code-pre {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .resize-handle:hover {
          background-color: #64748b !important;
        }
      `}</style>

      {/* Three.js Canvas */}
      <canvas id="web3-canvas" />
      
      {/* Hue Border */}
      <div className="hue-border" />

      <div className="timeline-studio min-h-screen w-full flex flex-col items-center relative z-10" style={{fontFamily: 'Sora, sans-serif', backgroundColor: '#000000', color: '#f1f5f9'}}>
        
        {/* Header */}
        <header className="w-full max-w-7xl px-6 py-8">
          <div className="glass-pane p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h1 className="text-4xl font-bold text-white">
                  <span className="text-glow">ChordCraft</span> Timeline Studio
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{state.blocks.length} sections</span>
                  </div>
                  <span>•</span>
                  <span>{state.timeline.totalDuration.toFixed(1)}s</span>
                  <span>•</span>
                  <span>{state.timeline.bpm} BPM</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-sm font-medium transition-all transform hover:scale-105">
                  💾 Save Project
                </button>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white rounded-xl text-sm font-medium transition-all">
                  📁 Load Project
                </button>
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white rounded-xl text-sm font-medium transition-all">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full max-w-7xl px-6 flex-1 flex gap-6">
          {/* Left Sidebar - Lyrics & Style Editor */}
          <div
            ref={sidebarRef}
            className="glass-pane flex-shrink-0 rounded-3xl"
            style={{ width: sidebarWidth }}
          >
            <LyricsStyleEditor />
          </div>

          {/* Resize Handle */}
          <div
            className="resize-handle w-1 bg-slate-600/50 hover:bg-slate-500 cursor-ew-resize flex-shrink-0 rounded-full"
            onMouseDown={handleMouseDown}
          />

          {/* Center Area - Timeline and Code Editor */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Arrangement Panel */}
            <div className="glass-pane rounded-3xl">
              <ArrangementPanel />
            </div>

            {/* Timeline */}
            <div className="glass-pane flex-1 rounded-3xl overflow-hidden">
              <Timeline />
            </div>

            {/* Code Editor */}
            <div className="glass-pane rounded-3xl overflow-hidden">
              <div className="bg-slate-800/30 px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-white">Code Editor</h3>
                  {selectedBlock && (
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedBlock.color }}
                      ></div>
                      <span className="font-medium">{selectedBlock.title}</span>
                      <span>•</span>
                      <span>{selectedBlock.duration.toFixed(1)}s</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayCode}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-medium transition-all transform hover:scale-105"
                  >
                    ▶️ Play Code
                  </button>
                  <button
                    onClick={handleAnalyzeCode}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-sm font-medium transition-all transform hover:scale-105"
                  >
                    🎼 Analyze Code
                  </button>
                  <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-white rounded-xl text-sm font-medium transition-all">
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div className="h-80">
                <Editor
                  value={currentCode}
                  onValueChange={handleCodeChange}
                  highlight={code => highlight(code, languages.chordcraft)}
                  padding={24}
                  style={{
                    fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                    fontSize: 14,
                    backgroundColor: 'transparent',
                    color: '#d4d4d4',
                    height: '100%',
                    overflow: 'auto'
                  }}
                  textareaClassName="code-textarea"
                  preClassName="code-pre"
                />
              </div>
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="w-full max-w-7xl px-6 py-4">
          <div className="glass-pane px-6 py-3">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ready</span>
                </div>
                <span>•</span>
                <span>Zoom: {state.timeline.zoom.toFixed(1)}x</span>
                <span>•</span>
                <span>Selected: {selectedBlock ? selectedBlock.title : 'None'}</span>
              </div>
              
              <div className="flex items-center gap-6">
                <span>Cursor: 0:00</span>
                <span>•</span>
                <span>Selection: 0:00 - 0:00</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
