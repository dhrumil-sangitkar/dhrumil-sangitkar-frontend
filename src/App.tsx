import React, { useEffect, useState } from 'react';
import { MediaProvider } from './context/MediaContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DigitalCard from './components/DigitalCard';
import ServicesSection from './components/ServicesSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import AdminPinModal from './components/AdminPinModal';

function AppInner() {
  const [showSessionExpiredPin, setShowSessionExpiredPin] = useState(false);

  // Listen for 401 from API — token expired mid-session
  useEffect(() => {
    const handler = () => {
      setShowSessionExpiredPin(true);
    };
    window.addEventListener('admin:session-expired', handler);
    return () => window.removeEventListener('admin:session-expired', handler);
  }, []);

  return (
    <div className="bg-royal-950 text-slate-100 font-sans min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Devotional verse bar */}
      <div className="bg-gradient-to-r from-royal-900 via-royal-950 to-royal-900 py-3 text-center border-b border-gold-500/10">
        <span className="font-cinzel text-gold-400 text-sm md:text-base tracking-widest font-semibold px-4">
          ॥ શ્રી વાસુપૂજ્યસ્વામીને નમઃ ॥ <span className="text-slate-500">•</span> જય જિનેન્દ્ર
        </span>
      </div>

      <HeroSection />
      <DigitalCard />
      <ServicesSection />
      <GallerySection />
      <ContactSection />
      <Footer />

      {/* Global UI overlays */}
      <ToastContainer />

      {/* Session expired — re-prompt PIN */}
      {showSessionExpiredPin && (
        <AdminPinModal
          onClose={() => setShowSessionExpiredPin(false)}
          onSuccess={() => setShowSessionExpiredPin(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <MediaProvider>
      <AppInner />
    </MediaProvider>
  );
}

export default App;
