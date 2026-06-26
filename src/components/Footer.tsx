import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-royal-950 border-t border-gold-500/20 py-12 px-4 text-center">
    <div className="max-w-6xl mx-auto space-y-6">
      <span className="font-cinzel text-xl tracking-widest text-gold-500 block">
        || શ્રી વાસુપૂજ્યસ્વામીને નમઃ ||
      </span>
      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
        Music has the potential to bond human consciousness with the supreme spirit. Under the guidance of divine
        masters, Dhrumil Shah seeks to inspire complete devotional absorption.
      </p>

      <div className="flex justify-center gap-6 text-sm text-slate-400 flex-wrap">
        {[
          { href: '#about', label: 'Home' },
          { href: '#services', label: 'Services' },
          { href: '#gallery', label: 'Gallery' },
          { href: '#contact', label: 'Contact' },
        ].map((link, i, arr) => (
          <React.Fragment key={link.href}>
            <a href={link.href} className="hover:text-gold-500 transition">
              {link.label}
            </a>
            {i < arr.length - 1 && <span className="text-slate-600">•</span>}
          </React.Fragment>
        ))}
      </div>

      <p className="text-[10px] text-slate-500 tracking-wider">
        &copy; 2026 Dhrumil Shah Portfolio. Crafted with devotion and elegance.
      </p>
    </div>
  </footer>
);

export default Footer;
