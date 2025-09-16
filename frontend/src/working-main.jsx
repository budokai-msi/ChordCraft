import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './vibrant-design-system.css';
import { AuthProvider, useAuth } from './Auth';
import { LandingPage } from './LandingPage';
import { Login } from './Login';
import { EnterpriseStudio } from './features/studio/EnterpriseStudio';
import ErrorBoundary from './components/ErrorBoundary';

function WorkingApp() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

      if (user) {
        return (
          <ErrorBoundary>
            <EnterpriseStudio />
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <WorkingApp />
    </AuthProvider>
  </StrictMode>,
);
