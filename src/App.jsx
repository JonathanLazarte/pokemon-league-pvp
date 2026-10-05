import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Login from './pages/Login/index.jsx';
import Register from './pages/Register/index.jsx';
import Index from './pages/Index/index.jsx';
import { getAuthToken } from './services/api.js';

function App() {
  const [token, setToken] = useState(getAuthToken());
  const [, navigate] = useLocation();

  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const RequireAuth = ({ children }) => {
    if (!token) {
      navigate('/login', { replace: true });
      return null;
    }
    return children;
  };

  return (
    <Switch>
      <Route path="/login">
        <Login setToken={setToken} />
      </Route>
      <Route path="/register">
        <Register setToken={setToken} />
      </Route>
      <Route path="/">
        <RequireAuth>
          <Index setToken={setToken} />
        </RequireAuth>
      </Route>
    </Switch>
  );
}

export default App;
