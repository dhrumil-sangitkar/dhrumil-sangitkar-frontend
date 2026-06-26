import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <header
      id="about"
      className="relative overflow-hidden pt-12 pb-24 flex flex-col items-center justify-center text-center px-4"
      style={{
        background: 'radial-gradient(circle at center, #0B0D2C 0%, #07091B 70%)',
      }}
    >
      {/* Decorative floating emojis */}
      <div className="absolute left-10 top-20 opacity-10 text-gold-500 text-9xl pointer-events-none animate-float hidden lg:block select-none">
        🪕
      </div>
      <div
        className="absolute right-10 bottom-20 opacity-10 text-gold-500 text-9xl pointer-events-none animate-float hidden lg:block select-none"
        style={{ animationDelay: '2s' }}
      >
        🎙️
      </div>

      {/* Profile Avatar */}
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gold-500/80 p-1 mb-8 shadow-2xl relative flex items-center justify-center bg-gradient-to-b from-royal-900 to-royal-950 hover:scale-105 transition-all duration-500 group">
        <div className="absolute inset-0 rounded-full bg-gold-500/5 animate-pulse" />
        <div className="text-center relative">
          <span className="font-cinzel text-5xl md:text-6xl text-gold-500 font-extrabold tracking-tight relative">
            ds
            <i className="fas fa-microphone text-xs text-gold-300 absolute -top-1 -right-3 rotate-12" />
          </span>
        </div>
      </div>

      {/* Name */}
      <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider uppercase mb-3">
        <span className="gold-text-gradient">Dhrumil Shah</span>
      </h1>

      <p className="font-cinzel text-gold-500 text-lg md:text-2xl tracking-widest font-semibold uppercase mb-6">
        Jain Sangitkar <span className="text-slate-400">•</span> જૈન સંગીતકાર
      </p>

      {/* New Headline */}
      <div className="max-w-3xl mb-6 px-4">
        <h2 className="text-xl md:text-3xl font-bold leading-snug">
          <span className="text-slate-100">Where Devotion Meets </span>
          <span className="gold-text-gradient">Divine Melody</span>
        </h2>
        <p className="font-cinzel text-gold-400 text-sm md:text-lg tracking-wide mt-1 italic">
          જ્યાં અતુટ શ્રદ્ધા બને છે મધુર સૂરાવલી
        </p>
      </div>

      <p className="max-w-2xl text-slate-300 text-sm md:text-base leading-relaxed mb-8 px-4">
        Dedicated to uplifting souls through transcendent Jain devotional music. Elevating spiritual events,
        Diksha Mahotsavs, and sacred pujas across India with live synthesizer orchestrations and heart-stirring vocals.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto px-4">
        <a
          href="#services"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 text-royal-950 font-bold rounded-lg shadow-xl hover:shadow-gold-500/30 hover:-translate-y-1 transition duration-300 text-center text-sm"
        >
          Explore Services & Programs
        </a>
        <a
          href="#gallery"
          className="w-full sm:w-auto px-8 py-3.5 bg-royal-900 hover:bg-royal-800 border border-gold-500 text-gold-500 font-bold rounded-lg hover:-translate-y-1 transition duration-300 text-center text-sm"
        >
          View Gallery & Videos
        </a>
      </div>

      {/* Stats Bar */}
      <div className="w-full max-w-3xl mx-auto mt-12 pt-8 border-t border-gold-500/10 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-cinzel text-2xl md:text-3xl font-bold text-gold-500">15+</p>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1 tracking-wide">Years Experience</p>
          </div>
          <div>
            <p className="font-cinzel text-2xl md:text-3xl font-bold text-gold-500">500+</p>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1 tracking-wide">Bhakti Programs</p>
          </div>
          <div>
            <p className="font-cinzel text-2xl md:text-3xl font-bold text-gold-500">100%</p>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1 tracking-wide">Ritualistic Purity</p>
          </div>
          <div>
            <p className="font-cinzel text-2xl md:text-3xl font-bold text-gold-500">Divine</p>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1 tracking-wide">Soulful Renditions</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
