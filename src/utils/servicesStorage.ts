import { ServiceItem } from '../types';
import { DEFAULT_SERVICES } from '../data/defaultServices';

const STORAGE_KEY = 'dhrumil_services_v1';

/**
 * Reads the services list from localStorage.
 * On first-ever load (nothing saved yet), seeds it with DEFAULT_SERVICES
 * so the site isn't empty out of the box.
 */
export function loadServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First run on this browser — seed with defaults.
      saveServices(DEFAULT_SERVICES);
      return DEFAULT_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Corrupt services data');
    return parsed as ServiceItem[];
  } catch (err) {
    console.error('Failed to read services from localStorage, falling back to defaults.', err);
    return DEFAULT_SERVICES;
  }
}

export function saveServices(items: ServiceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save services to localStorage.', err);
    throw new Error(
      'Could not save — your browser storage is full. Try removing some services first.'
    );
  }
}

/** Generates a reasonably unique id without any backend/uuid package. */
export function generateServiceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}