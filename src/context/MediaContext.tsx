import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MediaItem, ServiceItem, ToastMessage } from '../types';
import { mediaApi, servicesApi } from '../services/api';

const MAX_MEDIA_ITEMS = 50;

// ─── Context Types ────────────────────────────────────────────
interface MediaContextType {
  mediaItems: MediaItem[];
  serviceItems: ServiceItem[];
  isAdmin: boolean;
  isLoading: boolean;
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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Load media from backend ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await mediaApi.getAll();
        setMediaItems(data.sort((a, b) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error('Failed to load media from backend:', err);
        showToast('Could not reach backend — check if server is running.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Load services from backend ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await servicesApi.getAll();
        setServiceItems(data);
      } catch (err) {
        console.error('Failed to load services from backend:', err);
      }
    };
    load();
  }, []);

  // ─── Media CRUD ───────────────────────────────────────────
  const addMediaItem = async (item: Omit<MediaItem, 'id' | 'timestamp'>) => {
    if (mediaItems.length >= MAX_MEDIA_ITEMS) {
      showToast(`Maximum ${MAX_MEDIA_ITEMS} media items allowed. Please delete one first.`, 'error');
      return;
    }
    const created = await mediaApi.create(item);
    setMediaItems((prev) => [created, ...prev]);
    showToast('Media added successfully!');
  };

  const updateMediaItem = async (id: string, item: Partial<MediaItem>) => {
    const updated = await mediaApi.update(id, item);
    setMediaItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast('Media updated successfully!');
  };

  const deleteMediaItem = async (id: string) => {
    await mediaApi.delete(id);
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    showToast('Media deleted successfully!', 'info');
  };

  // ─── Service CRUD ─────────────────────────────────────────
  const addServiceItem = async (item: Omit<ServiceItem, 'id' | 'timestamp'>) => {
    const created = await servicesApi.create(item);
    setServiceItems((prev) => [...prev, created]);
    showToast('Service added successfully!');
  };

  const updateServiceItem = async (id: string, item: Partial<ServiceItem>) => {
    const updated = await servicesApi.update(id, item);
    setServiceItems((prev) => prev.map((s) => (s.id === id ? updated : s)));
    showToast('Service updated successfully!');
  };

  const deleteServiceItem = async (id: string) => {
    await servicesApi.delete(id);
    setServiceItems((prev) => prev.filter((s) => s.id !== id));
    showToast('Service deleted successfully!', 'info');
  };

  return (
    <MediaContext.Provider value={{
      mediaItems, serviceItems, isAdmin, isLoading, toasts,
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
