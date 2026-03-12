import { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Login from './pages/Login/index.jsx';
import Register from './pages/Register/index.jsx';
import Index from './pages/Index/index.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // Store token in state
  const [path, navigate] = useLocation();

  useEffect(() => {
    setToken(localStorage.getItem('token')); // Update token state on localStorage changes
  }, []); // Empty dependency array ensures this runs only once after the first render

  useEffect(() => {
    token && navigate('/');
  }, [token]);

  const RequireAuth = ({ children }) => {
    if (!token) {
      return navigate('/login', { replace: true }); // Use navigate for redirection, replace history entry
    }
    return children;
  };

  return (
    <Switch>
      <Route path="/login"><><Login setToken={setToken} /></></Route>
      <Route path="/register"><><Register setToken={setToken} /></></Route>
      <Route path="/" component={() => ( // Wrap Index in a function to pass props
        <RequireAuth>
          <Index setToken={setToken} />
        </RequireAuth>
      )} />
    </Switch>
  );
}

export default App;
