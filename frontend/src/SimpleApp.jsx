import React from 'react';

function SimpleApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ChordCraft Studio
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#94a3b8',
          marginBottom: '2rem'
        }}>
          AI-Powered Music Production Platform
        </p>
        <div style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          color: 'white',
          borderRadius: '0.5rem',
          border: 'none',
          fontSize: '1.125rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          Start Creating Music
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          marginTop: '1rem'
        }}>
          Application is loading successfully! 🎵
        </p>
      </div>
    </div>
  );
}

export default SimpleApp;
