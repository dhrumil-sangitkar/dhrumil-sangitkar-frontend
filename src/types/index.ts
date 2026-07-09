export interface MediaItem {
  id: string;
  title: string;
  gujaratiTitle?: string;
  type: 'youtube' | 'image' | 'file_image' | 'file_video' | 'instagram';
  url: string;
  images?: string[];
  thumbnail?: string;
  description?: string;
  category: 'Image' | 'Video';
  timestamp: number;
}

export interface ServiceItem {
  id: string;
  icon: string;
  name: string;
  gujarati: string;
  desc: string;
  timestamp: number;
}

export interface BookingFormData {
  name: string;
  phone: string;
  service: string;
  eventDate: string;
  message: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type FilterType = 'all' | 'Image' | 'Video' | 'youtube';

export interface AdminMediaFormData {
  id?: string;
  title: string;
  gujaratiTitle: string;
  type: MediaItem['type'];
  url: string;
  images?: string[];
  description: string;
  category: MediaItem['category'];
}

export interface AdminServiceFormData {
  id?: string;
  icon: string;
  name: string;
  gujarati: string;
  desc: string;
}
