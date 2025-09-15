import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

// Create a context for authentication
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session on initial load
    const getSession = async () => {
        console.log('AuthProvider: Getting session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthProvider: Session result:', session);
        setUser(session?.user ?? null);
        setLoading(false);
    };
    
    getSession();

    // Listen for changes in auth state (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Value provided to child components
  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
  };

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