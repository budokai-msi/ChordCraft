import { useState, useEffect } from 'react';
import { useAuth } from './Auth';
import { supabase } from './supabaseClient';

export function Login({ onBack }) {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isSigningUp) {
        response = await signUp({ email, password });
      } else {
        response = await signIn({ email, password });
      }
      if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // GitHub OAuth Sign In
  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('GitHub sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
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
        @keyframes haptic-shake {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(0.95); }
          75% { transform: scale(1.05); }
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

      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10" style={{fontFamily: 'Sora, sans-serif', backgroundColor: '#000000', color: '#f1f5f9'}}>
        
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span className="font-semibold">Back</span>
          </button>
        )}

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold tracking-tighter text-white mb-4">
            <span className="text-glow">ChordCraft</span>
          </h1>
          <p className="text-slate-400 text-lg">Welcome to the future of music creation</p>
        </header>

        {/* Auth Form */}
        <div className="w-full max-w-md">
          <div className="glass-pane p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {isSigningUp ? 'Create Account' : 'Sign In'}
            </h2>

            {/* Social Sign In Buttons */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleGitHubSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gray-800 text-white font-semibold rounded-2xl hover:bg-gray-700 transition-all transform hover:scale-105 disabled:opacity-50 border border-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-slate-400">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-900/50 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-400"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  isSigningUp ? '✨ Create Account' : '🚀 Sign In'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-2xl">
                <p className="text-red-400 text-center text-sm">{error}</p>
              </div>
            )}

            {/* Toggle Sign In/Up */}
            <div className="text-center mt-8 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button 
                onClick={() => setIsSigningUp(!isSigningUp)} 
                className="text-purple-400 hover:text-purple-300 font-semibold mt-2 transition-colors"
              >
                {isSigningUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
