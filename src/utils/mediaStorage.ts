import { MediaItem } from '../types';
import { DEFAULT_MEDIA } from '../data/defaultMedia';

const STORAGE_KEY = 'dhrumil_media_gallery_v1';

/**
 * Reads the media gallery from localStorage.
 * On first-ever load (nothing saved yet), seeds it with DEFAULT_MEDIA
 * so the gallery isn't empty out of the box.
 */
export function loadMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First run on this browser — seed with defaults.
      saveMedia(DEFAULT_MEDIA);
      return DEFAULT_MEDIA;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Corrupt media data');
    return parsed as MediaItem[];
  } catch (err) {
    console.error('Failed to read media from localStorage, falling back to defaults.', err);
    return DEFAULT_MEDIA;
  }
}

export function saveMedia(items: MediaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    // Most likely QuotaExceededError (localStorage is full, ~5-10MB).
    console.error('Failed to save media to localStorage.', err);
    throw new Error(
      'Could not save — your browser storage is full. Try removing some media first.'
    );
  }
}

/** Generates a reasonably unique id without any backend/uuid package. */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}