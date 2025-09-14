import React, { useState, useEffect } from 'react';

export function LandingPage({ onGetStarted }) {
  const [activeDemo, setActiveDemo] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Demo code examples
  const demoExamples = [
    {
      title: "Piano Melody",
      description: "Transform your piano recordings into clean, readable code",
      code: `// Generated from piano recording
// Key: C major | Tempo: 120 BPM
PLAY C4 FOR 0.5s AT 0.0s
PLAY D4 FOR 0.5s AT 0.5s  
PLAY E4 FOR 0.5s AT 1.0s
PLAY F4 FOR 0.5s AT 1.5s
PLAY G4 FOR 1.0s AT 2.0s`,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Guitar Chord Progression", 
      description: "Analyze complex guitar recordings with AI precision",
      code: `// Generated from guitar recording
// Key: G major | Tempo: 140 BPM
PLAY G4 FOR 1.0s AT 0.0s  // G major
PLAY D4 FOR 1.0s AT 1.0s  // D major  
PLAY Em FOR 1.0s AT 2.0s  // E minor
PLAY C4 FOR 1.0s AT 3.0s  // C major`,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Electronic Beat",
      description: "Capture electronic music patterns and synthesizer sounds", 
      code: `// Generated from electronic music
// Key: A minor | Tempo: 128 BPM
PLAY A3 FOR 0.25s AT 0.0s
PLAY C4 FOR 0.25s AT 0.25s
PLAY E4 FOR 0.25s AT 0.5s
PLAY A4 FOR 0.5s AT 0.75s`,
      color: "from-purple-500 to-pink-500"
    }
  ];

  // Auto-cycle through demos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % demoExamples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Three.js Background Effect (same as AuraOS)
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
        thickness: 0.8,
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
      `}</style>

      {/* Three.js Canvas */}
      <canvas id="web3-canvas" />
      
      {/* Hue Border */}
      <div className="hue-border" />

      <div className="min-h-screen w-full flex flex-col items-center relative z-10" style={{fontFamily: 'Sora, sans-serif', backgroundColor: '#000000', color: '#f1f5f9'}}>
        
        {/* Hero Section */}
        <header className="text-center my-20 px-4 max-w-5xl">
          <div className="float">
            <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-white mb-6">
              <span className="text-glow">ChordCraft</span>
            </h1>
          </div>
          <p className="text-3xl md:text-4xl text-slate-300 mb-8 font-semibold">
            The future of music creation is <span className="text-purple-400">code</span>
          </p>
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform any audio into executable musical code. Edit with precision, collaborate in real-time, 
            and push the boundaries of what's possible in music production.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 text-lg shadow-lg"
              style={{boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)'}}
            >
              ✨ Start Creating Music
            </button>
            <button 
              onClick={() => setActiveDemo(0)}
              className="bg-slate-800/50 border border-slate-600 hover:border-purple-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all hover:bg-slate-700/50 text-lg"
            >
              🎵 Watch Demo
            </button>
          </div>
        </header>

        {/* Features Section */}
        <section className="w-full max-w-6xl px-4 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powered by <span className="text-purple-400">Muzic AI</span></h2>
            <p className="text-xl text-slate-400">Microsoft's advanced music understanding technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-pane p-8 text-center hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="font-bold text-xl text-white mb-4">Audio → Code</h3>
              <p className="text-slate-400">Upload any audio file and get clean, editable ChordCraft code with AI-powered analysis</p>
            </div>
            
            <div className="glass-pane p-8 text-center hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🎼</div>
              <h3 className="font-bold text-xl text-white mb-4">Code → Music</h3>
              <p className="text-slate-400">Write or edit musical code and hear it played back instantly with our live studio</p>
            </div>
            
            <div className="glass-pane p-8 text-center hover:scale-105 transition-transform">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="font-bold text-xl text-white mb-4">AI Enhanced</h3>
              <p className="text-slate-400">Advanced harmonic analysis, key detection, and tempo recognition powered by Muzic</p>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="w-full max-w-6xl px-4 mb-20">
          <div className="glass-pane p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Live Code Demo</h2>
              <p className="text-slate-400">See ChordCraft in action - click the examples below</p>
            </div>

            {/* Demo Selector */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {demoExamples.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDemo(index)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    activeDemo === index 
                      ? `bg-gradient-to-r ${demo.color} text-white shadow-lg` 
                      : 'bg-slate-800/50 border border-slate-600 text-slate-300 hover:border-purple-500'
                  }`}
                >
                  {demo.title}
                </button>
              ))}
            </div>

            {/* Demo Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Code Display */}
              <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">{demoExamples[activeDemo].title}</h3>
                  <button 
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      audioPlaying 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {audioPlaying ? '⏸️ Stop' : '▶️ Play'}
                  </button>
                </div>
                <pre className="text-green-400 font-mono text-sm leading-relaxed bg-black/50 p-4 rounded-xl overflow-auto">
                  {demoExamples[activeDemo].code}
                </pre>
              </div>

              {/* Visualization */}
              <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-white mb-4">Real-time Visualization</h3>
                <div className="h-48 bg-black/50 rounded-xl border border-slate-800 flex items-center justify-center">
                  <div className="flex items-end space-x-1 h-32">
                    {Array.from({ length: 40 }, (_, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-t ${demoExamples[activeDemo].color} rounded-sm opacity-80`}
                        style={{
                          width: '4px',
                          height: `${Math.random() * 80 + 20}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-400 mt-4 text-sm text-center">
                  {demoExamples[activeDemo].description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full max-w-6xl px-4 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Three simple steps to musical mastery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="glass-pane w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">📤</span>
              </div>
              <h3 className="font-bold text-xl text-white mb-4">1. Upload Audio</h3>
              <p className="text-slate-400">Drop in any audio file - piano, guitar, vocals, electronic music, or full songs</p>
            </div>

            <div className="text-center">
              <div className="glass-pane w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="font-bold text-xl text-white mb-4">2. AI Analysis</h3>
              <p className="text-slate-400">Our Muzic AI extracts tempo, key, harmony, and converts it to clean ChordCraft code</p>
            </div>

            <div className="text-center">
              <div className="glass-pane w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-bold text-xl text-white mb-4">3. Create & Edit</h3>
              <p className="text-slate-400">Edit your musical code, collaborate in real-time, and export to any format</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl px-4 mb-20">
          <div className="glass-pane p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to revolutionize your music?</h2>
            <p className="text-xl text-slate-400 mb-8">Join thousands of musicians, producers, and creators using ChordCraft</p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-12 rounded-2xl transition-all transform hover:scale-105 text-xl shadow-2xl"
                style={{boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)'}}
              >
                🚀 Get Started Free
              </button>
              <div className="text-slate-500 text-sm">
                <p>✅ No credit card required</p>
                <p>✅ Full access to AI features</p>
                <p>✅ Save unlimited projects</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-8 border-t border-slate-800">
          <p className="text-slate-600">&copy; 2025 ChordCraft. Powered by Microsoft Muzic AI.</p>
        </footer>
      </div>
    </>
  );
}
