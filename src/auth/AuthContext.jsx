import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { http } from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken && !token) setToken(savedToken);
  }, [token]);

  const login = async ({ email, password }) => {
    const res = await http.post('/auth/login', { email, password });
    const { access_token, user } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(access_token);
    setUser(user);
  };

  const register = async ({ email, password, role, adminKey }) => {
    const res = await http.post('/auth/register', { email, password, role, adminKey });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      role: user?.role ?? null,
      login,
      register,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

