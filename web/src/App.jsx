import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import useAuthStore from './store/authStore';
import api from './api/axios';
import './App.css';

function App() {
  const { token, setUser, logout, setLoadingUser } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    api.get('/user')
      .then((res) => setUser(res.data))
      .catch(() => logout());
  }, []);

  return <AppRouter />;
}

export default App;