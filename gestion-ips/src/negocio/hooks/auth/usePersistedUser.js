import { useState, useEffect } from 'react';

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  activo: boolean;
}

export function usePersistedUser() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const saveUser = (user: User, token: string) => {
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
