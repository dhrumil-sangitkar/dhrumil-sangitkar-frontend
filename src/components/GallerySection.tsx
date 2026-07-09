import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaItem, FilterType } from '../types';
import MediaViewerModal from './MediaViewerModal';

const filterButtons: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Images', value: 'Image' },
  { label: 'Videos', value: 'Video' },
  { label: 'YouTube Links', value: 'youtube' },
];

// ─── Helpers ──────────────────────────────────────────────────
export function sanitizeYouTubeUrl(url: string): string {
  if (url.includes('<iframe')) {
    const match = url.match(/src=["']([^"']+)["']/);
    if (match) url = match[1];
  }
  const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(ytRegex);
  if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  return url;
}

function getYouTubeThumbnail(url: string): string | null {
  const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(ytRegex);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}

function getInstagramThumbnail(_url: string): string | null {
  // Instagram doesn't expose public thumbnails without auth; show a placeholder icon
  return null;
}

// ─── Media Card ───────────────────────────────────────────────
interface MediaCardProps {
  item: MediaItem;
  onOpen: (item: MediaItem) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onOpen }) => {
  const isYoutube = item.type === 'youtube';
  const isInstagram = item.type === 'instagram';
  const isImage = item.type === 'image' || item.type === 'file_image';
  const customThumbnail = item.thumbnail ?? item.images?.[0] ?? null;

  const youtubeThumbnail = isYoutube ? getYouTubeThumbnail(item.url) : null;
  const instagramThumbnail = isInstagram ? getInstagramThumbnail(item.url) : null;
  const showThumbnail = isImage || youtubeThumbnail || instagramThumbnail || !!customThumbnail;

  return (
    <div
      className="group bg-royal-900 border border-gold-500/10 rounded-2xl overflow-hidden hover:border-gold-500/40 hover:shadow-xl hover:shadow-gold-500/5 transition-all duration-300 cursor-pointer"
      onClick={() => onOpen(item)}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-[5/4] sm:aspect-[4/3] bg-royal-950 overflow-hidden">
        {isImage || customThumbnail ? (
          <img
            src={isImage ? item.url : customThumbnail!}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : youtubeThumbnail ? (
          <div className="relative w-full h-full">
            <img
              src={youtubeThumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                <i className="fab fa-youtube text-white text-2xl" />
              </div>
            </div>
          </div>
        ) : isInstagram ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
              <i className="fab fa-instagram text-3xl text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-royal-800 to-royal-950">
            <i className="fas fa-film text-4xl text-gold-500/50" />
          </div>
        )}

        {/* Play overlay (only for non-youtube-with-thumbnail) */}
        {!youtubeThumbnail && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg">
              <i className={`fas ${isImage ? 'fa-expand' : 'fa-play'} text-royal-950 text-sm ml-0.5`} />
            </div>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="text-[9px] bg-royal-950/80 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
            {item.type === 'youtube' ? 'YouTube' : item.type === 'instagram' ? 'Instagram' : item.category}
          </span>
          {item.images && item.images.length > 1 && (
            <span className="text-[9px] bg-royal-950/80 text-white border border-gold-500/20 px-2 py-0.5 rounded-full font-bold backdrop-blur-sm flex items-center gap-1">
              <i className="fas fa-images" /> {item.images.length}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-cinzel text-sm font-bold text-gold-400 mb-1 line-clamp-1">{item.title}</h3>
        {item.gujaratiTitle && (
          <p className="text-xs text-slate-400 mb-2 line-clamp-1">{item.gujaratiTitle}</p>
        )}
        {item.description && (
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
};

// ─── Gallery Section ──────────────────────────────────────────

const GallerySection: React.FC = () => {
  const { mediaItems } = useMedia();
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewerItem, setViewerItem] = useState<MediaItem | null>(null);

  const filtered = mediaItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'youtube') return item.type === 'youtube';
    return item.category === filter;
  });

  return (
    <section id="gallery" className="py-24 bg-royal-900/40 border-t border-gold-500/10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-xs text-gold-500 font-bold uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
              Video & Image Archive • ગેલેરી
            </span>
          </div>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wider mt-3 mb-4">Official Media Gallery</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Experience live devotional works directly below. Click any card to play immediately.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {mediaItems.length} item{mediaItems.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-300 ${
                filter === btn.value
                  ? 'bg-gold-500 text-royal-950 shadow-md'
                  : 'bg-royal-800 text-slate-300 hover:bg-royal-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Grid - centered */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <i className="fas fa-photo-film text-5xl mb-4 opacity-30" />
            <p className="text-sm">No media found for this filter.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {filtered.map((item) => (
              <div key={item.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
                <MediaCard item={item} onOpen={setViewerItem} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viewer modal */}
      {viewerItem && (
        <MediaViewerModal
          item={viewerItem}
          onClose={() => setViewerItem(null)}
          sanitizeYouTubeUrl={sanitizeYouTubeUrl}
        />
      )}
    </section>
  );
};

export default GallerySection;