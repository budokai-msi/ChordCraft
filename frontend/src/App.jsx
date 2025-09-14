import { useAuth } from './Auth';
import { Login } from './Login';
import { Studio } from './Studio';

function App() {
  const { user } = useAuth();

  // If a user is logged in, show the Studio. Otherwise, show the Login page.
  return user ? <Studio /> : <Login />;
}

export default App;