import axios from 'axios';
import { MediaItem, BookingFormData, ServiceItem } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Free-tier hosts (e.g. Render) spin the server down after inactivity.
// The FIRST request after a spin-down has to wait for a cold start, which
// can take 30-50s — far longer than a normal request should ever take.
const DEFAULT_TIMEOUT = 20000; // generous for a normal, already-warm request
const RETRY_TIMEOUT = 60000;   // generous enough to cover a cold start

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
});

/** True for errors that look like "server didn't respond in time / at all",
 * as opposed to errors where the server responded (4xx/5xx) — those are
 * real failures and retrying won't help. */
function isRetryableError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return err.code === 'ECONNABORTED' || !err.response;
  }
  return false;
}

/**
 * Runs a request once with the normal timeout. If it fails in a way that
 * suggests the server was asleep/unreachable rather than genuinely erroring,
 * it lets the person know and retries once with a much longer timeout to
 * give a cold start time to finish.
 */
async function withColdStartRetry<T>(fn: (timeoutMs: number) => Promise<T>): Promise<T> {
  try {
    return await fn(DEFAULT_TIMEOUT);
  } catch (err) {
    if (!isRetryableError(err)) throw err;
    window.dispatchEvent(
      new CustomEvent('api:retrying', {
        detail: 'Server is waking up — retrying, this can take up to a minute…',
      })
    );
    return await fn(RETRY_TIMEOUT);
  }
}

// ─── Request interceptor: attach JWT token ────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 (expired/missing token) ─
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token so next admin action prompts re-login
      localStorage.removeItem('admin_token');
      // Dispatch a custom event so the app can react (show PIN modal)
      window.dispatchEvent(new CustomEvent('admin:session-expired'));
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Media Gallery API ───────────────────────────────────────
export const mediaApi = {
  getAll: (): Promise<MediaItem[]> =>
    withColdStartRetry((timeout) => api.get('/media', { timeout }).then((r) => r.data)),

  create: (item: Omit<MediaItem, 'id' | 'timestamp'>): Promise<MediaItem> =>
    withColdStartRetry((timeout) => api.post('/media', item, { timeout }).then((r) => r.data)),

  update: (id: string, item: Partial<MediaItem>): Promise<MediaItem> =>
    withColdStartRetry((timeout) => api.put(`/media/${id}`, item, { timeout }).then((r) => r.data)),

  delete: (id: string): Promise<void> =>
    withColdStartRetry((timeout) => api.delete(`/media/${id}`, { timeout }).then((r) => r.data)),
};

// ─── Booking / Inquiry API ────────────────────────────────────
export const bookingApi = {
  submit: (data: BookingFormData): Promise<{ success: boolean; message: string }> =>
    withColdStartRetry((timeout) => api.post('/booking', data, { timeout }).then((r) => r.data)),
};

// ─── Admin Auth API ────────────────────────────────────────────
export const authApi = {
  verifyPin: (pin: string): Promise<{ token: string; success: boolean }> =>
    withColdStartRetry((timeout) => api.post('/auth/verify-pin', { pin }, { timeout }).then((r) => r.data)),
};

export default api;

// ─── Services API ─────────────────────────────────────────────
export const servicesApi = {
  getAll: (): Promise<ServiceItem[]> =>
    withColdStartRetry((timeout) => api.get('/services', { timeout }).then((r) => r.data)),

  create: (item: Omit<ServiceItem, 'id' | 'timestamp'>): Promise<ServiceItem> =>
    withColdStartRetry((timeout) =>
      api
        .post('/services', { icon: item.icon, name: item.name, gujarati: item.gujarati, desc: item.desc }, { timeout })
        .then((r) => r.data)
    ),

  update: (id: string, item: Partial<ServiceItem>): Promise<ServiceItem> =>
    withColdStartRetry((timeout) => api.put(`/services/${id}`, item, { timeout }).then((r) => r.data)),

  delete: (id: string): Promise<void> =>
    withColdStartRetry((timeout) => api.delete(`/services/${id}`, { timeout }).then((r) => r.data)),
};
