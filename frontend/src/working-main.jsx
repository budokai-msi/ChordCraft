import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './vibrant-design-system.css';
import { LandingPage } from './LandingPage';
import ErrorBoundary from './components/ErrorBoundary';

function WorkingApp() {
  return (
    <ErrorBoundary>
      <LandingPage onGetStarted={() => console.log('Get Started clicked')} />
    </ErrorBoundary>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkingApp />
  </StrictMode>,
);
