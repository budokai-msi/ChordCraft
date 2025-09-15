import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './Auth';
import { Login } from './Login';
import { Studio } from './features/studio/Studio';
import { LandingPage } from './LandingPage';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';
import ErrorBoundary from './components/ErrorBoundary';
import './design-system.css';

function App() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="*" element={
            // Flow: LandingPage -> Login -> Studio
            user ? (
              <Studio />
            ) : showLogin ? (
              <Login onBack={() => setShowLogin(false)} />
            ) : (
              <LandingPage onGetStarted={() => setShowLogin(true)} />
            )
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
