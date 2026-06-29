import React, { useEffect, useState, useRef } from 'react';
import { MediaItem } from '../types';

interface Props {
  item: MediaItem;
  onClose: () => void;
  sanitizeYouTubeUrl: (url: string) => string;
}

function getInstagramEmbedUrl(url: string): string {
  // Convert instagram.com/reel/XYZ or instagram.com/p/XYZ to embed URL
  const match = url.match(/instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/);
  if (match) {
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;
  }
  // If already an embed URL, return as-is
  if (url.includes('/embed')) return url;
  return url;
}

const SWIPE_THRESHOLD = 50;

const MediaViewerModal: React.FC<Props> = ({ item, onClose, sanitizeYouTubeUrl }) => {
  const photos = item.images && item.images.length > 1 ? item.images : [item.url];
  const hasMultiple = photos.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goNext = () => setActiveIndex((i) => (i + 1) % photos.length);
  const goPrev = () => setActiveIndex((i) => (i - 1 + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (hasMultiple && e.key === 'ArrowRight') goNext();
      if (hasMultiple && e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, hasMultiple, photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
    else if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const isImage = item.type === 'image' || item.type === 'file_image';
  const isInstagram = item.type === 'instagram';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`relative ${isInstagram ? 'max-w-sm' : 'max-w-4xl'} w-full my-auto`}>

        {/* ── Close Button — always visible, top-right inside the modal ── */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold-500 hover:bg-gold-400 text-royal-950 flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110"
          title="Close"
        >
          <i className="fas fa-times text-base font-bold" />
        </button>

        {/* ── Media Content ── */}
        {isInstagram ? (
          /* Instagram: portrait embed */
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gold-500/20 bg-royal-950" style={{ height: 'min(75vh, 600px)', minHeight: 320 }}>
            <iframe
              src={getInstagramEmbedUrl(item.url)}
              className="w-full h-full"
              style={{ border: 'none' }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              scrolling="no"
              title={item.title}
            />
          </div>
        ) : isImage && hasMultiple ? (
          /* Swipeable multi-photo carousel — height adapts to the photo, capped to viewport */
          <div
            className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-gold-500/20 bg-royal-950 select-none"
            style={{ height: 'min(65vh, 600px)' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {photos.map((src, idx) => (
                <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center">
                  <img src={src} alt={`${item.title} ${idx + 1}`} className="max-w-full max-h-full w-auto h-auto object-contain" draggable={false} />
                </div>
              ))}
            </div>

            {/* Prev/Next arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
              title="Previous photo"
            >
              <i className="fas fa-chevron-left text-sm" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
              title="Next photo"
            >
              <i className="fas fa-chevron-right text-sm" />
            </button>

            {/* Counter */}
            <div className="absolute top-3 right-3 text-[10px] bg-black/60 text-white px-2 py-1 rounded-full font-bold">
              {activeIndex + 1} / {photos.length}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80%] overflow-x-auto px-1">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={`shrink-0 w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-gold-500 w-4' : 'bg-white/40 hover:bg-white/70'}`}
                  title={`Go to photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`w-full rounded-xl overflow-hidden shadow-2xl border border-gold-500/20 bg-royal-950 ${isImage ? '' : 'aspect-video'}`}
            style={isImage ? { height: 'min(65vh, 600px)' } : undefined}
          >
            {isImage && (
              <img src={item.url} alt={item.title} className="w-full h-full object-contain" />
            )}
            {item.type === 'youtube' && (
              <iframe
                src={sanitizeYouTubeUrl(item.url) + '?autoplay=1'}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={item.title}
              />
            )}
            {item.type === 'file_video' && (
              <video src={item.url} controls autoPlay className="w-full h-full" />
            )}
          </div>
        )}

        {/* ── Title / Meta ── */}
        <div className="mt-4 text-center px-4">
          <h3 className="font-cinzel text-xl font-bold text-gold-400">{item.title}</h3>
          {item.gujaratiTitle && (
            <p className="text-sm text-slate-400 mt-0.5">{item.gujaratiTitle}</p>
          )}
          {item.description && (
            <p className="text-sm text-slate-300 mt-2">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaViewerModal;