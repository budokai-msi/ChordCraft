import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

// Create a context for authentication
const AuthContext = createContext();

// Create a provider component with error handling
export const SafeAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Check for an active session on initial load
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Error in getSession:', err);
        setError(err.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    getSession();

    // Listen for changes in auth state (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Value provided to child components
  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    error,
  };

  // Always render children, but show error if there's one
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Connection Error</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Unable to connect to the server</p>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  // Render children only once loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Export the context for testing purposes
export { AuthContext };
