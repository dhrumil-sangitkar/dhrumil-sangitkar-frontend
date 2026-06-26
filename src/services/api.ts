import axios from 'axios';
import { MediaItem, BookingFormData, ServiceItem } from '../types';

// Base URL - update this with your actual backend URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Media Gallery API ───────────────────────────────────────
export const mediaApi = {
  getAll: (): Promise<MediaItem[]> =>
    api.get('/media').then((r) => r.data),

  create: (item: Omit<MediaItem, 'id' | 'timestamp'>): Promise<MediaItem> =>
    api.post('/media', item).then((r) => r.data),

  update: (id: string, item: Partial<MediaItem>): Promise<MediaItem> =>
    api.put(`/media/${id}`, item).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/media/${id}`).then((r) => r.data),
};

// ─── Booking / Inquiry API ────────────────────────────────────
export const bookingApi = {
  submit: (data: BookingFormData): Promise<{ success: boolean; message: string }> =>
    api.post('/booking', data).then((r) => r.data),
};

// ─── Admin Auth API ────────────────────────────────────────────
export const authApi = {
  verifyPin: (pin: string): Promise<{ token: string; success: boolean }> =>
    api.post('/auth/verify-pin', { pin }).then((r) => r.data),
};

export default api;

// ─── Services API ─────────────────────────────────────────────
export const servicesApi = {
  getAll: (): Promise<ServiceItem[]> =>
    api.get('/services').then((r) => r.data),

  create: (item: Omit<ServiceItem, 'id' | 'timestamp'>): Promise<ServiceItem> =>
    api.post('/services', { icon: item.icon, name: item.name, gujarati: item.gujarati, desc: item.desc }).then((r) => r.data),

  update: (id: string, item: Partial<ServiceItem>): Promise<ServiceItem> =>
    api.put(`/services/${id}`, item).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/services/${id}`).then((r) => r.data),
};
