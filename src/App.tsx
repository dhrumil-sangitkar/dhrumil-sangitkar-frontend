import React from 'react';
import { MediaProvider } from './context/MediaContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DigitalCard from './components/DigitalCard';
import ServicesSection from './components/ServicesSection';
import GallerySection from './components/GallerySection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import SangitkarChatbot from './components/SangitkarChatbot';

function App() {
  return (
    <MediaProvider>
      <div className="bg-royal-950 text-slate-100 font-sans min-h-screen overflow-x-hidden">
        <Navbar />

        {/* Devotional verse bar — below the header menu, centered */}
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
        <SangitkarChatbot />
      </div>
    </MediaProvider>
  );
}

export default App;
