import React, { useState } from 'react';
import { useAuth } from './Auth';
import { LandingPage } from './LandingPage';
import { Login } from './Login';
import { ModernStudioSimplified } from './features/studio/ModernStudioSimplified';
import ErrorBoundary from './components/ErrorBoundary';

export function App() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (user) {
        return (
          <ErrorBoundary>
            <ModernStudioSimplified />
          </ErrorBoundary>
        );
  }

  if (showLogin) {
    return (
      <ErrorBoundary>
        <Login onBack={() => setShowLogin(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <LandingPage onGetStarted={() => setShowLogin(true)} />
    </ErrorBoundary>
  );
}