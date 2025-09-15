import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LandingPage } from './LandingPage'

console.log('Loading no-auth app...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <LandingPage onGetStarted={() => console.log('Get started clicked')} />
    </StrictMode>
  );
  
  console.log('No-auth app rendered successfully');
} catch (error) {
  console.error('Failed to render no-auth app:', error);
  
  // Fallback: show error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        color: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Inter, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #94a3b8; margin-bottom: 1rem;">Failed to load the application</p>
          <pre style="
            background: #0f0f23;
            padding: 1rem;
            border-radius: 0.5rem;
            color: #f1f5f9;
            text-align: left;
            overflow: auto;
            max-width: 600px;
          ">${error.message}</pre>
        </div>
      </div>
    `;
  }
}
