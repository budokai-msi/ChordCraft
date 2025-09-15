import { useState } from 'react';
import { useAuth } from './Auth';
import { Login } from './Login';
import { Studio } from './features/studio/Studio';
import { LandingPage } from './LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import './vibrant-design-system.css';

function App() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Debug logging removed for production

  // Flow: LandingPage -> Login -> Studio
  if (user) return (
    <ErrorBoundary>
      <Studio />
    </ErrorBoundary>
  );
  if (showLogin) return (
    <ErrorBoundary>
      <Login onBack={() => setShowLogin(false)} />
    </ErrorBoundary>
  );
  return (
    <ErrorBoundary>
      <LandingPage onGetStarted={() => setShowLogin(true)} />
    </ErrorBoundary>
  );
}

export default App;
