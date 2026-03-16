import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('profile')); } catch { return null; }
  });
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token, user: u, profile: p } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('profile', JSON.stringify(p));
    setUser(u);
    setProfile(p);
    if (u.theme) { setThemeState(u.theme); }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setUser(null);
    setProfile(null);
  };

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    try { await API.patch('/auth/theme', { theme: next }); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
