import React, { useState, useEffect } from 'react';

const navLinks = [
  { href: '#about', label: 'Home' },
  { href: '#card', label: 'Digital Card' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Media Gallery' },
  { href: '#contact', label: 'Contact & Booking' },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-300 border-b border-gold-500/20 ${
        scrolled ? 'bg-royal-950/95 backdrop-blur-md shadow-lg shadow-black/30' : 'bg-royal-950/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#about" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center bg-royal-900 font-cinzel text-gold-500 font-bold text-lg shadow-lg group-hover:shadow-gold-500/20 transition-all duration-300">
              ds
            </div>
            <div>
              <span className="block font-cinzel text-lg tracking-wider font-bold text-gold-500">DHRUMIL SHAH</span>
              <span className="block text-xs text-slate-300 uppercase tracking-widest">Jain Sangitkar</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-gold-500 transition duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="tel:7383950244"
              className="bg-gradient-to-r from-gold-600 to-gold-400 text-royal-950 px-4 py-2 text-xs font-bold rounded-full shadow-lg hover:shadow-gold-500/20 hover:scale-105 transition duration-300 flex items-center gap-2"
            >
              <i className="fas fa-phone" /> Contact
            </a>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 rounded-lg border border-gold-500/20 flex flex-col items-center justify-center gap-1.5 text-gold-500 hover:bg-royal-800 transition"
              aria-label="Toggle Menu"
            >
              <span className={`block w-5 h-0.5 bg-gold-500 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gold-500 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gold-500 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96 border-t border-gold-500/10' : 'max-h-0'
        }`}
      >
        <div className="bg-royal-950/98 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="block py-3 px-4 text-sm text-slate-300 hover:text-gold-500 hover:bg-royal-900 rounded-lg transition duration-200 font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
