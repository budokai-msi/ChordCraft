import React, { useState, useEffect, useRef } from 'react';
import './design-system.css';

export function LandingPage({ onGetStarted }) {
  const [activeDemo, setActiveDemo] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

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

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"
          style={{
            left: `${mousePosition.x * 0.5}%`,
            top: `${mousePosition.y * 0.3}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-500/20 to-yellow-500/20 rounded-full blur-2xl animate-float"
          style={{
            left: `${100 - mousePosition.x * 0.3}%`,
            top: `${100 - mousePosition.y * 0.4}%`,
            transform: 'translate(-50%, -50%)',
            animationDelay: '1s'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section ref={heroRef} className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="text-center max-w-6xl">
            {/* Main Headline */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-display-2xl font-bold text-white mb-6">
                <span className="text-gradient">ChordCraft</span>
              </h1>
              <p className="text-display-sm text-slate-300 mb-4">
                Where Music Meets Code
              </p>
              <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transform your musical ideas into beautiful, playable code. 
                Upload audio, get instant ChordCraft code, and create music 
                with the power of Microsoft Muzic AI.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button
                onClick={onGetStarted}
                className="btn btn-primary btn-lg group"
              >
                <span>Start Creating</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button className="btn btn-ghost btn-lg text-white border-white/20 hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Live Demo Preview */}
            <div className={`glass-strong rounded-3xl p-8 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {demoExamples[activeDemo].title}
                </h3>
                <div className="flex gap-2">
                  {demoExamples.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDemo(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === activeDemo ? 'bg-blue-500 scale-125' : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-slate-300 mb-6 text-center">
                {demoExamples[activeDemo].description}
              </p>
              
              <div className="bg-slate-900/50 rounded-2xl p-6 font-mono text-sm text-green-400 overflow-x-auto border border-slate-700/50">
                <pre className="whitespace-pre-wrap">{demoExamples[activeDemo].code}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-display-lg font-bold text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Everything you need to create, analyze, and share your musical code
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: "🧠", 
                  title: "Microsoft Muzic AI", 
                  desc: "Advanced AI analysis powered by Microsoft's music research",
                  color: "from-blue-500 to-cyan-500"
                },
                { 
                  icon: "⚡", 
                  title: "Real-time Generation", 
                  desc: "Instant ChordCraft code from your audio files",
                  color: "from-yellow-500 to-orange-500"
                },
                { 
                  icon: "🎹", 
                  title: "Live Playback", 
                  desc: "Hear your code as beautiful, playable music",
                  color: "from-green-500 to-emerald-500"
                },
                { 
                  icon: "📱", 
                  title: "Dual Interface", 
                  desc: "Timeline and Classic views for every workflow",
                  color: "from-purple-500 to-pink-500"
                },
                { 
                  icon: "☁️", 
                  title: "Cloud Sync", 
                  desc: "Save and access your projects from anywhere",
                  color: "from-indigo-500 to-purple-500"
                },
                { 
                  icon: "🔧", 
                  title: "Advanced Editing", 
                  desc: "Fine-tune every note, rhythm, and harmony",
                  color: "from-red-500 to-pink-500"
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="card-glass p-6 group hover:scale-105 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-black/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-display-lg font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-400">
                Three simple steps to transform your music
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  step: "01", 
                  title: "Upload Audio", 
                  desc: "Drop your audio file or record live with our built-in recorder",
                  icon: "🎤",
                  color: "from-blue-500 to-cyan-500"
                },
                { 
                  step: "02", 
                  title: "AI Analysis", 
                  desc: "Microsoft Muzic AI analyzes tempo, key, harmony, and rhythm",
                  icon: "🧠",
                  color: "from-purple-500 to-pink-500"
                },
                { 
                  step: "03", 
                  title: "Get Code", 
                  desc: "Receive clean, editable ChordCraft code ready to play",
                  icon: "💻",
                  color: "from-green-500 to-emerald-500"
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-3xl mx-auto group-hover:scale-110 transition-transform`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-display-lg font-bold text-white mb-6">
              Ready to Create?
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join thousands of musicians, producers, and developers 
              creating the future of music with code
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="btn btn-primary btn-lg group"
              >
                <span>Start Creating Free</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <div className="text-sm text-slate-500">
                No credit card required • Free forever
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-slate-500 text-sm">
              © 2025 ChordCraft. Powered by Microsoft Muzic AI. 
              Built with ❤️ for musicians everywhere.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}