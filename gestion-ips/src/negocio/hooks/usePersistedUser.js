import { useState, useEffect } from 'react';

export function usePersistedUser() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn('Failed to parse stored user from localStorage', e);
        setUser(null);
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const saveUser = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const clearUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return { user, token, saveUser, clearUser };
}
