import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './vibrant-design-system.css';
import { AuthProvider } from './Auth';
import { App } from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);