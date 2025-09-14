import { useState } from 'react';
import { useAuth } from './Auth';
import { Login } from './Login';
import { Studio } from './Studio';
import { LandingPage } from './LandingPage';
import './design-system.css';

function App() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Flow: LandingPage -> Login -> Studio
  if (user) return <Studio />;
  if (showLogin) return <Login onBack={() => setShowLogin(false)} />;
  return <LandingPage onGetStarted={() => setShowLogin(true)} />;
}

export default App;