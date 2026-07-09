import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { MediaItem, ServiceItem, ToastMessage } from '../types';
import { servicesApi } from '../services/api';
import { MEDIA_ITEMS } from '../data/media';

interface MediaContextType {
  mediaItems: MediaItem[];
  serviceItems: ServiceItem[];
  isAdmin: boolean;
  isServicesLoading: boolean; // services loading (separate flag)
  toasts: ToastMessage[];
  setIsAdmin: (val: boolean) => void;
  addServiceItem: (item: Omit<ServiceItem, 'id' | 'timestamp'>) => Promise<void>;
  updateServiceItem: (id: string, item: Partial<ServiceItem>) => Promise<void>;
  deleteServiceItem: (id: string) => Promise<void>;
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  // ─── Media (code-managed — see src/data/media.ts, no backend/admin) ────
  const mediaItems = useMemo(
    () => [...MEDIA_ITEMS].sort((a, b) => b.timestamp - a.timestamp),
    []
  );

  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Let the person know when a request is being retried because the
  // backend looked asleep/unreachable (e.g. Render free-tier cold start) ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      showToast(detail || 'Server is waking up — retrying…', 'info');
    };
    window.addEventListener('api:retrying', handler);
    return () => window.removeEventListener('api:retrying', handler);
  }, [showToast]);

  // ─── Load services (still backend-managed) ─────────────────
  useEffect(() => {
    const load = async () => {
      setIsServicesLoading(true);
      try {
        const data = await servicesApi.getAll();
        setServiceItems(data);
      } catch (err) {
        console.warn('Could not load services from backend.', err);
      } finally {
        setIsServicesLoading(false);
      }
    };
    load();
  }, []);

  // ─── Service CRUD ─────────────────────────────────────────
  const addServiceItem = async (item: Omit<ServiceItem, 'id' | 'timestamp'>) => {
    try {
      const created = await servicesApi.create(item);
      setServiceItems((prev) => [...prev, created]);
      showToast('Service added successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Failed to add service. Please try again.', 'error');
      throw err;
    }
  };

  const updateServiceItem = async (id: string, item: Partial<ServiceItem>) => {
    try {
      const updated = await servicesApi.update(id, item);
      setServiceItems((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showToast('Service updated successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Failed to update service. Please try again.', 'error');
      throw err;
    }
  };

  const deleteServiceItem = async (id: string) => {
    try {
      await servicesApi.delete(id);
      setServiceItems((prev) => prev.filter((s) => s.id !== id));
      showToast('Service deleted successfully!', 'info');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Failed to delete service. Please try again.', 'error');
      throw err;
    }
  };

  return (
    <MediaContext.Provider value={{
      mediaItems, serviceItems, isAdmin, isServicesLoading, toasts,
      setIsAdmin,
      addServiceItem, updateServiceItem, deleteServiceItem,
      showToast, removeToast,
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = (): MediaContextType => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be used inside MediaProvider');
  return ctx;
};