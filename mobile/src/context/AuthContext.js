import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { role: 'STUDENT', label: 'Student (Kajal Mia)', id: '20244203028', password: 'Password123!' },
  { role: 'TEACHER', label: 'Teacher (Dr. Shamsul)', id: 'T-1001', password: 'Password123!' },
  { role: 'STAFF', label: 'Staff (Hasan Ali)', id: 'S-2001', password: 'Password123!' },
  { role: 'ADMIN', label: 'Administrator', id: 'ADMIN-001', password: 'Password123!' },
];

export const MOCK_USERS = {
  '20244203028': {
    user_id: 4,
    university_id: '20244203028',
    full_name: 'Kajal Mia',
    email: '20244203028@bubt.edu.bd',
    role: 'STUDENT',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    semester: '7th Semester',
    section: 'Section 02',
    phone: '+8801700000004',
    is_active: true
  },
  'T-1001': {
    user_id: 2,
    university_id: 'T-1001',
    full_name: 'Dr. Md. Shamsul Haque',
    email: 'shamsul@bubt.edu.bd',
    role: 'TEACHER',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    phone: '+8801711000002',
    is_active: true
  },
  'ADMIN-001': {
    user_id: 1,
    university_id: 'ADMIN-001',
    full_name: 'Chief Administrator',
    email: 'admin@bubt.edu.bd',
    role: 'ADMIN',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    phone: '+8801711000001',
    is_active: true
  },
  'S-2001': {
    user_id: 3,
    university_id: 'S-2001',
    full_name: 'Md. Hasan Ali',
    email: 'hasan.staff@bubt.edu.bd',
    role: 'STAFF',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    phone: '+8801711000003',
    is_active: true
  }
};

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
      if (token && token !== 'demo_token') {
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
        try {
          const notifRes = await api.getNotifications();
          if (notifRes.success) {
            setUnreadNotifications(notifRes.unread_count || 0);
          }
        } catch {}
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      console.warn('Backend login unavailable, activating demo mode for:', identifier);
      const mockUser = MOCK_USERS[identifier] || MOCK_USERS['20244203028'];
      setUser(mockUser);
      setToken('demo_token');
      setAuthToken('demo_token');
      return { success: true, offline: true };
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
