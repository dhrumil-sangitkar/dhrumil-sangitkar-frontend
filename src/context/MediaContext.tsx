import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MediaItem, ServiceItem, ToastMessage } from '../types';
import { loadMedia, saveMedia, generateId } from '../utils/mediaStorage';
import { loadServices, saveServices, generateServiceId } from '../utils/servicesStorage';

const MAX_MEDIA_ITEMS = 50;

interface MediaContextType {
  mediaItems: MediaItem[];
  serviceItems: ServiceItem[];
  isAdmin: boolean;
  isLoading: boolean;         // media loading
  isServicesLoading: boolean; // services loading (separate flag)
  backendOnline: boolean;
  toasts: ToastMessage[];
  maxMediaItems: number;
  setIsAdmin: (val: boolean) => void;
  addMediaItem: (item: Omit<MediaItem, 'id' | 'timestamp'>) => Promise<void>;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  addServiceItem: (item: Omit<ServiceItem, 'id' | 'timestamp'>) => Promise<void>;
  updateServiceItem: (id: string, item: Partial<ServiceItem>) => Promise<void>;
  deleteServiceItem: (id: string) => Promise<void>;
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Load media (from this browser's localStorage — no backend) ──
  useEffect(() => {
    try {
      const data = loadMedia();
      setMediaItems([...data].sort((a, b) => b.timestamp - a.timestamp));
      setBackendOnline(true); // kept for compatibility; media no longer depends on a backend
    } catch (err) {
      console.error('Failed to load media from localStorage.', err);
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Load services (from this browser's localStorage — no backend) ──
  useEffect(() => {
    try {
      const data = loadServices();
      setServiceItems(data);
    } catch (err) {
      console.error('Failed to load services from localStorage.', err);
    } finally {
      setIsServicesLoading(false);
    }
  }, []);

  // ─── Media CRUD (all local — persisted to this browser's localStorage) ──
  const addMediaItem = async (item: Omit<MediaItem, 'id' | 'timestamp'>) => {
    if (mediaItems.length >= MAX_MEDIA_ITEMS) {
      showToast(`Maximum ${MAX_MEDIA_ITEMS} media items allowed.`, 'error');
      return;
    }
    try {
      const created: MediaItem = { ...item, id: generateId(), timestamp: Date.now() };
      const next = [created, ...mediaItems];
      saveMedia(next);
      setMediaItems(next);
      showToast('Media added successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add media. Please try again.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateMediaItem = async (id: string, item: Partial<MediaItem>) => {
    try {
      let updated: MediaItem | undefined;
      const next = mediaItems.map((m) => {
        if (m.id !== id) return m;
        updated = { ...m, ...item };
        return updated;
      });
      if (!updated) throw new Error('Media item not found.');
      saveMedia(next);
      setMediaItems(next);
      showToast('Media updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update media. Please try again.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const deleteMediaItem = async (id: string) => {
    try {
      const next = mediaItems.filter((m) => m.id !== id);
      saveMedia(next);
      setMediaItems(next);
      showToast('Media deleted successfully!', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete media. Please try again.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // ─── Service CRUD (all local — persisted to this browser's localStorage) ──
  const addServiceItem = async (item: Omit<ServiceItem, 'id' | 'timestamp'>) => {
    try {
      const created: ServiceItem = { ...item, id: generateServiceId(), timestamp: Date.now() };
      const next = [...serviceItems, created];
      saveServices(next);
      setServiceItems(next);
      showToast('Service added successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add service. Please try again.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateServiceItem = async (id: string, item: Partial<ServiceItem>) => {
    try {
      let updated: ServiceItem | undefined;
      const next = serviceItems.map((s) => {
        if (s.id !== id) return s;
        updated = { ...s, ...item };
        return updated;
      });
      if (!updated) throw new Error('Service not found.');
      saveServices(next);
      setServiceItems(next);
      showToast('Service updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update service. Please try again.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const deleteServiceItem = async (id: string) => {
    try {
      const next = serviceItems.filter((s) => s.id !== id);
      saveServices(next);
      setServiceItems(next);
      showToast('Service deleted successfully!', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete service. Please try again.';
      showToast(msg, 'error');
      throw err;
    }
  };

  return (
    <MediaContext.Provider value={{
      mediaItems, serviceItems, isAdmin, isLoading, isServicesLoading, backendOnline, toasts,
      maxMediaItems: MAX_MEDIA_ITEMS,
      setIsAdmin,
      addMediaItem, updateMediaItem, deleteMediaItem,
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