import { useState } from 'react';
import { useAuth } from './Auth';

export function Login() {
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center font-mono">
        <h1 className="text-5xl font-bold text-cyan-400 mb-2">ChordCraft</h1>
        <p className="text-gray-400 mb-8">The future of music creation is code.</p>
        <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl text-white text-center mb-6">
                {isSigningUp ? 'Create an Account' : 'Sign In'}
            </h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-500 text-white font-bold rounded hover:bg-green-600 disabled:bg-gray-600"
                >
                    {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
                </button>
                {error && <p className="mt-4 text-center text-red-400">{error}</p>}
            </form>
            <p className="text-center text-gray-400 mt-6 text-sm">
                {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
                <button onClick={() => setIsSigningUp(!isSigningUp)} className="text-cyan-400 hover:underline ml-2">
                    {isSigningUp ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
        </div>
    </div>
  );
}
