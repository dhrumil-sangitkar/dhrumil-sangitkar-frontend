import { MediaItem } from '../types';

// ─── Media Gallery — single source of truth ─────────────────────────────
// There is no admin panel or backend for media anymore: this array IS the
// gallery. To add, edit, reorder, or remove media, edit this file directly
// and redeploy (e.g. `git push` if Vercel is connected to your repo, or
// `vercel --prod` from this folder).
//
// ── For an image or a group of images (swipeable slider) ──
//   1. Put the file(s) in public/media/  (see public/media/README.md)
//   2. type: 'file_image', url: the first/cover image path,
//      images: [all image paths in order] (or omit `images` for a single image)
//
// ── For a local video file ──
//   1. Put the .mp4 in public/media/
//   2. type: 'file_video', url: '/media/your-file.mp4'
//
// ── For a YouTube video ──
//   type: 'youtube', url: the full YouTube URL (watch or share link — it
//   gets normalized automatically when played)
//
// `id` just needs to be unique — any short string works.
// `timestamp` controls sort order (newest first) — use Date.now() minus a
// few days for older items, or a fixed number, whatever is easiest to read.

export const MEDIA_ITEMS: MediaItem[] = [
  {
  id: 'media-local-1',
  title: 'Kshetrunjay Bhav Yatra',
  gujaratiTitle: 'ક્ષેત્રુંજય ભાવ યાત્રા', 
  type: 'file_image',
  url: '/media/1.jpeg',
  images: ['/media/1.jpeg', '/media/2.jpeg', '/media/3.jpeg', '/media/4.jpeg', '/media/5.jpeg', '/media/6.jpeg', '/media/7.jpeg'],
  description: 'ક્ષેત્રુંજય ભાવ યાત્રા – શ્રદ્ધા, ભક્તિ અને આત્મિક આનંદથી પરિપૂર્ણ એક દિવ્ય યાત્રાની અમૂલ્ય સ્મૃતિઓ.',
  category: 'Image',
  timestamp: Date.now(),
},
  {
    id: 'media-2',
    title: 'Devotional Jain bhajan',
    gujaratiTitle: 'જેની કીકી કાળી છે...',
    type: 'file_video',
    url: '/media/Jeni_kiki_kali_chhe.mp4',
    thumbnail: '/media/3.jpeg',
    images: [],
    description: 'A soulful rendition of the cherished Jain devotional song `જેની કીકી કાળી છે`, expressing devotion through the timeless tradition of Jain bhakti sangeet.',
    category: 'Video',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
  id: 'media-local-3',
  title: 'Sakrastav Maha Abhishek',
  gujaratiTitle: 'સક્રાસ્તવ મહા અભિષેક', 
  type: 'file_image',
  url: '/media/8.jpeg',
  images: ['/media/8.jpeg', '/media/9.jpeg', '/media/10.jpeg', '/media/11.jpeg'],
  description: 'સક્રસ્તવ મહા અભિષેકના આ પાવન પ્રસંગની દિવ્ય ક્ષણો, જે ભક્તિ, શ્રદ્ધા અને જૈન પરંપરાની આધ્યાત્મિક ભવ્યતાનું સુંદર પ્રતિબિંબ છે.',
  category: 'Image',
  timestamp: Date.now(),
},
{
    id: 'media-4',
    title: 'Shri Simandhar Swami through sacred music',
    gujaratiTitle: 'શ્રી સીમંદર નિજ મુખે પરમાત્મા ભક્તિ...',
    type: 'file_video',
    url: '/media/Shri_Simandhar_Swami_through_sacred_music.mp4',
    thumbnail: '/media/Screenshot_1.png',
    images: [],
    description: 'પવિત્ર સંગીત દ્વારા શ્રી સીમંધર સ્વામીની દિવ્ય મહિમા અને ભક્તિભાવને અર્પિત આ ભાવસભર સંગીતમય રજૂઆત.',
    category: 'Video',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  }

  // ── Example of a local image you've added to public/media/ ──
  // {
  //   id: 'kshetrunjay-yatra',
  //   title: 'Kshetrunjay Bhav Yatra',
  //   gujaratiTitle: 'ક્ષેત્રુંજય ભાવ યાત્રા',
  //   type: 'file_image',
  //   url: '/media/kshetrunjay-yatra-1.jpg',
  //   images: [
  //     '/media/kshetrunjay-yatra-1.jpg',
  //     '/media/kshetrunjay-yatra-2.jpg',
  //     '/media/kshetrunjay-yatra-3.jpg',
  //   ],
  //   description: 'ક્ષેત્રુંજય ભાવ યાત્રા – શ્રદ્ધા, ભક્તિ અને આત્મિક આનંદથી પરિપૂર્ણ એક દિવ્ય યાત્રાની અમૂલ્ય સ્મૃતિઓ.',
  //   category: 'Image',
  //   timestamp: Date.now(),
  // },
];