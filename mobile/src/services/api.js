import { Platform } from 'react-native';

// Dynamic base URL resolution for Cloud Hosting (Vercel/Render), Physical Smartphones, and Localhost
let customApiUrl = null;

export const setCustomApiUrl = (url) => {
  customApiUrl = url ? url.trim().replace(/\/+$/, '') : null;
  if (typeof window !== 'undefined' && window.localStorage) {
    if (customApiUrl) {
      window.localStorage.setItem('CAMPUS_CONNECT_API_URL', customApiUrl);
    } else {
      window.localStorage.removeItem('CAMPUS_CONNECT_API_URL');
    }
  }
};

export const getBaseUrl = () => {
  if (customApiUrl) return customApiUrl;
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('CAMPUS_CONNECT_API_URL');
    if (saved) return saved;
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    // If running on a public cloud domain (Vercel, Netlify, Render, etc.)
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.')) {
      return `https://${host}/api`;
    }
    return `http://${host}:5000/api`;
  }
  // Physical smartphone via Expo Go or native app on local Wi-Fi:
  return 'http://192.168.10.248:5000/api';
};

export const API_BASE_URL = getBaseUrl();

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (endpoint, options = {}) => {
  const currentBaseUrl = getBaseUrl();
  const url = `${currentBaseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    let data = {};
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        throw new Error(`API endpoint ${endpoint} returned non-JSON response (${res.status}). Ensure backend is running or set EXPO_PUBLIC_API_URL.`);
      }
    }

    if (!res.ok) {
      throw new Error(data.message || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Notices
  getNotices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notices${query ? `?${query}` : ''}`);
  },
  createNotice: (data) => request('/notices', { method: 'POST', body: JSON.stringify(data) }),
  deleteNotice: (id) => request(`/notices/${id}`, { method: 'DELETE' }),

  // Routine
  getRoutines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/routines${query ? `?${query}` : ''}`);
  },
  getTodayRoutines: () => request('/routines/today'),
  createRoutine: (data) => request('/routines', { method: 'POST', body: JSON.stringify(data) }),
  deleteRoutine: (id) => request(`/routines/${id}`, { method: 'DELETE' }),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/courses${query ? `?${query}` : ''}`);
  },
  getCourseById: (id) => request(`/courses/${id}`),
  createCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  enrollCourse: (id) => request(`/courses/${id}/enroll`, { method: 'POST' }),

  // Materials
  getMaterials: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/materials${query ? `?${query}` : ''}`);
  },
  uploadMaterial: (data) => request('/materials', { method: 'POST', body: JSON.stringify(data) }),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: 'DELETE' }),

  // Assignments
  getAssignments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assignments${query ? `?${query}` : ''}`);
  },
  getAssignmentById: (id) => request(`/assignments/${id}`),
  createAssignment: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  submitAssignment: (id, data) => request(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  gradeSubmission: (subId, data) => request(`/assignments/submissions/${subId}/grade`, { method: 'PUT', body: JSON.stringify(data) }),

  // Events
  getEvents: () => request('/events'),
  getEventById: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  registerEvent: (id) => request(`/events/${id}/register`, { method: 'POST' }),
  unregisterEvent: (id) => request(`/events/${id}/unregister`, { method: 'POST' }),

  // Complaints
  getComplaints: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/complaints${query ? `?${query}` : ''}`);
  },
  getComplaintById: (id) => request(`/complaints/${id}`),
  createComplaint: (data) => request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  updateComplaintStatus: (id, data) => request(`/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Lost & Found
  getLostFound: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lostfound${query ? `?${query}` : ''}`);
  },
  createLostFound: (data) => request('/lostfound', { method: 'POST', body: JSON.stringify(data) }),
  updateLostFoundStatus: (id, status) => request(`/lostfound/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // User
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/users/change-password', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  createAdminUser: (data) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle`, { method: 'PUT' }),
  getDepartments: () => request('/admin/departments'),
  createDepartment: (data) => request('/admin/departments', { method: 'POST', body: JSON.stringify(data) }),
};
