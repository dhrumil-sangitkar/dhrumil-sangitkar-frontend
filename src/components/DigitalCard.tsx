import React from 'react';
import { useMedia } from '../context/MediaContext';

const DigitalCard: React.FC = () => {
  const { serviceItems, isServicesLoading } = useMedia();

  // Use the Gujarati name from each Religious Musical Service (fallback to English name if missing)
  const services = serviceItems.map((s) => s.gujarati?.trim() || s.name);
  const isOdd = services.length % 2 !== 0;

  const downloadCard = () => {
    // Download the actual visiting card image
    const link = document.createElement('a');
    link.href = '/media-card.jpeg';
    link.download = 'Dhrumil-Shah-Visiting-Card.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="card" className="py-16 bg-royal-900 border-y border-gold-500/10 relative">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="font-cinzel text-3xl font-bold tracking-wider text-gold-500 mb-2">Digital Visiting Card</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <p className="text-sm text-slate-400">Authentic replica of Dhrumil Shah's traditional business card</p>
          <button
            onClick={downloadCard}
            className="inline-flex items-center gap-2 text-gold-500 hover:text-royal-950 hover:bg-gold-500 font-bold transition-all bg-royal-950 px-4 py-2 rounded-full border border-gold-500/30 text-xs shadow-lg"
          >
            <i className="fas fa-download" /> Download Card
          </button>
        </div>

        {/* Cards - centered with equal height */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          {/* Front Card */}
          <div className="bg-[#0B0D2C] border-2 border-gold-500 rounded-xl p-6 shadow-2xl relative overflow-hidden text-left flex flex-col justify-between hover:shadow-gold-500/20 transition-all duration-500 min-h-[280px]">
            <div className="absolute top-0 right-0 w-24 h-24 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor" className="text-gold-500">
                <path d="M100,0 C80,0 50,20 50,50 C50,80 80,100 100,100 Z" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20 pointer-events-none rotate-180">
              <svg viewBox="0 0 100 100" fill="currentColor" className="text-gold-500">
                <path d="M100,0 C80,0 50,20 50,50 C50,80 80,100 100,100 Z" />
              </svg>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-[8px] text-gold-500 tracking-widest uppercase">Traditional Music</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold-500 opacity-60" />
                ))}
              </div>
            </div>

            <div className="text-center my-4">
              <div className="w-20 h-20 mx-auto rounded-full border border-gold-500 flex items-center justify-center mb-2">
                <span className="font-cinzel text-2xl text-gold-500 font-bold">ds</span>
              </div>
              <h3 className="font-cinzel text-2xl text-gold-400 tracking-wider font-bold">DHRUMIL SHAH</h3>
              <p className="text-xs text-slate-300 font-cinzel tracking-widest uppercase">Jain Sangitkar</p>
            </div>

            <div className="flex justify-between items-end border-t border-gold-500/10 pt-2 text-[10px] text-slate-400">
              <span>Ahmedabad, India</span>
              <span>Official Artist</span>
            </div>
          </div>

          {/* Back Card */}
          <div className="bg-[#0B0D2C] border-2 border-gold-500 rounded-xl p-6 shadow-2xl relative overflow-hidden text-left flex flex-col justify-between hover:shadow-gold-500/20 transition-all duration-500 min-h-[280px]">
            <div className="text-center text-xs text-gold-400 font-cinzel border-b border-gold-500/10 pb-2">
              || શ્રી વાસુપૂજ્યસ્વામીને નમઃ ||
            </div>

            <div className="my-4 space-y-2 flex-1">
              <h4 className="font-cinzel text-xl text-gold-500 font-semibold border-b border-gold-500/20 pb-1">Dhrumil Shah</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-300">
                {isServicesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-1.5 animate-pulse">
                      <span className="text-gold-500/30 shrink-0">•</span>
                      <div className="h-3 bg-slate-700/40 rounded w-full mt-0.5" />
                    </div>
                  ))
                ) : (
                  services.map((s, idx) => {
                    const isLast = idx === services.length - 1;
                    const centerLast = isOdd && isLast;
                    return (
                      <div
                        key={s + idx}
                        className={`flex items-start gap-1.5 ${centerLast ? 'col-span-2 justify-center' : ''}`}
                      >
                        <span className="text-gold-500 shrink-0">•</span>
                        <span className="leading-snug">{s}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-gold-500/10 pt-2 text-xs space-y-1">
              <div className="flex items-center gap-2 text-gold-400">
                <i className="fas fa-phone text-[10px]" />
                <span className="font-semibold text-slate-200">7383950244</span>
                <span className="text-slate-500">/</span>
                <span className="font-semibold text-slate-200">8320412371</span>
              </div>
              <div className="flex items-center gap-2 text-gold-400">
                <i className="fas fa-map-marker-alt text-[10px]" />
                <span className="text-slate-300 text-[10px] leading-tight">4/12, Priyanka Flat, Vasna, Ahmedabad.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalCard;
