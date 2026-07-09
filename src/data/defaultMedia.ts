import { MediaItem } from '../types';

// ─── Default Media (first-run seed) ────────────────────────────
// This replaces the old backend DB seed. It is only used the very first
// time the site loads on a given browser (i.e. when localStorage has no
// media saved yet). After that, whatever the admin has added/edited/
// deleted from the Admin Dashboard is what persists.
export const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'seed-1',
    title: 'Live Bhakti Sandhya Highlights',
    gujaratiTitle: 'લાઇવ ભક્તિ સંધ્યા',
    type: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/YpXqN_z1iQY',
    images: [],
    description: 'Experiencing serene divine vibrations with beautiful Jain stavans.',
    category: 'Video',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-2',
    title: 'Traditional Snatra Puja',
    gujaratiTitle: 'સ્નાત્ર મહોત્સવ સંગીત',
    type: 'youtube',
    url: 'https://www.youtube-nocookie.com/embed/YpXqN_z1iQY',
    images: [],
    description: 'Live devotional orchestration during sacred bathing ceremony.',
    category: 'Video',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-3',
    title: 'Golden Harmonium & Vocals',
    gujaratiTitle: 'મધુર હાર્મોનિયમ સૂર',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop',
    images: [],
    description: 'Spiritual practice session getting ready for the next Diksha Mahotsav.',
    category: 'Image',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];