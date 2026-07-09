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
  url: '/media/kshetrunjay/Kshetrunjay1.jpeg',
  images: ['/media/kshetrunjay/Kshetrunjay1.jpeg', '/media/kshetrunjay/Kshetrunjay2.jpeg', '/media/kshetrunjay/Kshetrunjay3.jpeg', '/media/kshetrunjay/Kshetrunjay4.jpeg', '/media/kshetrunjay/Kshetrunjay5.jpeg', '/media/kshetrunjay/Kshetrunjay6.jpeg', '/media/kshetrunjay/Kshetrunjay7.jpeg'],
  description: 'ક્ષેત્રુંજય ભાવ યાત્રા – શ્રદ્ધા, ભક્તિ અને આત્મિક આનંદથી પરિપૂર્ણ એક દિવ્ય યાત્રાની અમૂલ્ય સ્મૃતિઓ.',
  category: 'Image',
  timestamp: Date.now(),
},
  {
    id: 'media-2',
    title: 'Devotional Jain Stavan',
    gujaratiTitle: 'જેની કીકી કાળી છે...',
    type: 'file_video',
    url: '/media/stavan/Jeni_kiki_kali_chhe.mp4',
    thumbnail: '/media/kshetrunjay/Kshetrunjay3.jpeg',
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
  url: '/media/sakrastav/Sakrastav1.jpeg',
  images: ['/media/sakrastav/Sakrastav1.jpeg', '/media/sakrastav/Sakrastav2.jpeg', '/media/sakrastav/Sakrastav3.jpeg', '/media/sakrastav/Sakrastav4.jpeg', '/media/sakrastav/Sakrastav5.jpeg'],
  description: 'સક્રસ્તવ મહા અભિષેકના આ પાવન પ્રસંગની દિવ્ય ક્ષણો, જે ભક્તિ, શ્રદ્ધા અને જૈન પરંપરાની આધ્યાત્મિક ભવ્યતાનું સુંદર પ્રતિબિંબ છે.',
  category: 'Image',
  timestamp: Date.now(),
},
{
    id: 'media-4',
    title: 'Shri Simandhar Swami through sacred music',
    gujaratiTitle: 'શ્રી સીમંદર નિજ મુખે પરમાત્મા ભક્તિ...',
    type: 'file_video',
    url: '/media/simandhar/Shri_Simandhar_Swami_through_sacred_music.mp4',
    thumbnail: '/media/simandhar/Simandhar1.png',
    images: [],
    description: 'પવિત્ર સંગીત દ્વારા શ્રી સીમંધર સ્વામીની દિવ્ય મહિમા અને ભક્તિભાવને અર્પિત આ ભાવસભર સંગીતમય રજૂઆત.',
    category: 'Video',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'media-5',
    title: 'Parmatma Bhakti | Divine Devotional Reel',
    gujaratiTitle: 'પરમાત્મા ભક્તિ | દિવ્ય ભક્તિમય રીલ',
    type: 'file_video',
    url: '/media/parmatma/parmatma_bhakti.mp4',
    thumbnail: '/media/parmatma/Parmatma1.png',
    images: [],
    description: 'આ દિવ્ય પરમાત્મા ભક્તિ રીલ દ્વારા ભક્તિ અને આધ્યાત્મિકતાનો અનુભવ કરો. પરમાત્મા પ્રત્યેની શ્રદ્ધા, શાંતિ અને સકારાત્મક ભાવનાઓથી ભરપૂર આ રજૂઆત દરેકના હૃદયમાં ભક્તિનો પ્રકાશ પ્રગટાવે તેવી શુભકામના.',
    category: 'Video',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'media-6',
    title: 'Shree Siddhachakra Poojan',
    gujaratiTitle: 'શ્રી સિદ્ધચક્ર પૂજન',
    type: 'file_video',
    url: '/media/siddhachakra/sidhh_chakra.mp4',
    thumbnail: '/media/siddhachakra/Siddhachakra1.png',
    images: [],
    description: 'શ્રી સિદ્ધચક્ર પૂજન જૈન ધર્મનો એક પવિત્ર ધાર્મિક અનુષ્ઠાન છે, જેમાં શ્રી સિદ્ધચક્ર મહાયંત્ર અને નવપદની ભક્તિપૂર્વક આરાધના કરવામાં આવે છે. આ પૂજન શ્રદ્ધા, સાધના અને આધ્યાત્મિક ઉન્નતિનું પ્રતિક છે. આ શુભ પ્રસંગની યાદગાર ક્ષણોને અમારી વિડિયો દ્વારા નિહાળો.',
    category: 'Video',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },

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