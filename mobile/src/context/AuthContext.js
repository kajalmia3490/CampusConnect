import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { role: 'STUDENT', label: 'Student (Kajal Mia)', id: '20244203028', password: 'Password123!' },
  { role: 'TEACHER', label: 'Teacher (Dr. Shamsul)', id: 'T-1001', password: 'Password123!' },
  { role: 'STAFF', label: 'Staff (Hasan Ali)', id: 'S-2001', password: 'Password123!' },
  { role: 'ADMIN', label: 'Administrator', id: 'ADMIN-001', password: 'Password123!' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initialize with student login by default for seamless demonstration
  useEffect(() => {
    quickLogin('20244203028', 'Password123!');
  }, []);

  const refreshUnread = async () => {
    try {
      if (token) {
        const notifRes = await api.getNotifications();
        if (notifRes.success) {
          setUnreadNotifications(notifRes.unread_count || 0);
        }
      }
    } catch (e) {
      // Ignore background error
    }
  };

  const login = async (identifier, password) => {
    try {
      setLoading(true);
      const res = await api.login({ identifier, password });
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        setAuthToken(res.token);
        // Refresh unread
        const notifRes = await api.getNotifications();
        if (notifRes.success) {
          setUnreadNotifications(notifRes.unread_count || 0);
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Connection error' };
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (identifier, password) => {
    return login(identifier, password);
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.register(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        setAuthToken(res.token);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setUnreadNotifications(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadNotifications,
        refreshUnread,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
