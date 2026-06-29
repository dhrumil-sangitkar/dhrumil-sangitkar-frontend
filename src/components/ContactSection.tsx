import React, { useState, useEffect } from 'react';
import { BookingFormData } from '../types';
import { bookingApi } from '../services/api';
import { useMedia } from '../context/MediaContext';

const emptyForm: BookingFormData = {
  name: '',
  phone: '',
  service: '',
  eventDate: '',
  message: '',
};

const ContactSection: React.FC = () => {
  const [form, setForm] = useState<BookingFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const { showToast, serviceItems, isServicesLoading } = useMedia();

  // Build dropdown options dynamically from the Religious Musical Services data
  const serviceOptions = serviceItems.map((s) => (s.gujarati ? `${s.name} (${s.gujarati})` : s.name));

  // Keep the selected service valid as serviceItems load/change
  useEffect(() => {
    if (serviceOptions.length === 0) return;
    if (!form.service || !serviceOptions.includes(form.service)) {
      setForm((f) => ({ ...f, service: serviceOptions[0] }));
    }
  }, [serviceOptions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showToast('Please fill in your name and phone number.', 'error');
      return;
    }
    setSubmitting(true);

    try {
      // Try submitting to backend
      await bookingApi.submit(form);
      showToast('Booking inquiry submitted successfully!', 'success');
    } catch {
      // Fallback: open WhatsApp directly
    }

    // Always open WhatsApp as the primary CTA
    const dateStr = form.eventDate ? ` on ${form.eventDate}` : '';
    const msg = encodeURIComponent(
      `🙏 Jai Jinendra!\n\n*Booking Inquiry*\n\nName: ${form.name}\nPhone: ${form.phone}\nService: ${form.service}${dateStr}\n\nDetails:\n${form.message || 'No additional details.'}\n\n_Sent via dhrumilsangitkar.com_`
    );
    window.open(`https://wa.me/917383950244?text=${msg}`, '_blank');
    setForm(emptyForm);
    setSubmitting(false);
  };

  return (
    <section id="contact" className="py-24 max-w-5xl mx-auto px-4">
      <div className="bg-royal-900 border-2 border-gold-500 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-gold-500">
            <path d="M0,100 C20,100 50,80 50,50 C50,20 80,0 100,0 Z" />
          </svg>
        </div>

        <div className="grid md:grid-cols-5">
          {/* Info Pane */}
          <div className="bg-gradient-to-b from-royal-800 to-royal-900 p-8 md:p-12 md:col-span-2 flex flex-col justify-between border-r border-gold-500/10">
            <div>
              <span className="text-xs text-gold-500 font-bold uppercase tracking-widest">
                Connect • સંપર્ક કરો
              </span>
              <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-slate-100 mt-2 mb-6">
                Let's Celebrate Together
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                Plan ahead for your family or sangh's events. Booking in advance ensures perfect customized planning.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center text-gold-500 shrink-0">
                  <i className="fas fa-phone-alt" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase tracking-widest">Call Directly</span>
                  <div className="text-sm font-bold text-slate-100">
                    <a href="tel:7383950244" className="hover:text-gold-500 transition">7383950244</a>
                    <span className="text-slate-500 mx-1">/</span>
                    <a href="tel:8320412371" className="hover:text-gold-500 transition">8320412371</a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center text-gold-500 shrink-0">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase tracking-widest">Address</span>
                  <span className="text-xs text-slate-200 block leading-snug">
                    4/12, Priyanka Flat, Vasna, Ahmedabad.
                  </span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-12 pt-8 border-t border-gold-500/10">
              <span className="block text-xs text-slate-400 uppercase tracking-widest mb-4">Follow & Share</span>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="https://wa.me/917383950244"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center text-lg shadow-md transition-all hover:scale-110"
                >
                  <i className="fab fa-whatsapp" />
                </a>
                <a
                  href="https://www.instagram.com/dhrumil_sangitkar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg shadow-md transition-all hover:scale-110"
                >
                  <i className="fab fa-instagram" />
                </a>
                <a
                  href="https://www.youtube.com/@dhrumilshah8386"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-lg shadow-md transition-all hover:scale-110"
                >
                  <i className="fab fa-youtube" />
                </a>
                <a
                  href="mailto:dhrumilsangitkar@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg shadow-md transition-all hover:scale-110"
                  title="dhrumilsangitkar@gmail.com"
                >
                  <i className="fas fa-envelope" />
                </a>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-12 md:col-span-3 space-y-6">
            <div>
              <h4 className="font-cinzel text-lg text-gold-500 font-semibold mb-1">Inquiry Form</h4>
              <p className="text-xs text-slate-400">
                Fill this to quickly send details via WhatsApp or consult directly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                  Your Name *
                </label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-royal-950 border border-gold-500/20 rounded-lg px-4 py-3 text-slate-200 focus:border-gold-500 text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                  Mobile Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-royal-950 border border-gold-500/20 rounded-lg px-4 py-3 text-slate-200 focus:border-gold-500 text-sm transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                  Program / Service
                </label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full bg-royal-950 border border-gold-500/20 rounded-lg px-4 py-3 text-slate-300 focus:border-gold-500 text-sm transition"
                >
                  {serviceOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                  Event Date
                </label>
                <input
                  name="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={handleChange}
                  className="w-full bg-royal-950 border border-gold-500/20 rounded-lg px-4 py-3 text-slate-200 focus:border-gold-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                Inquiry Details
              </label>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Any specific requirements, sangh location details..."
                className="w-full bg-royal-950 border border-gold-500/20 rounded-lg px-4 py-3 text-slate-200 focus:border-gold-500 text-sm resize-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-royal-950 font-bold uppercase tracking-wider rounded-lg shadow-xl hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <i className="fas fa-circle-notch animate-spin" />
              ) : (
                <>
                  <i className="fab fa-whatsapp text-lg" /> Send Booking Details via WhatsApp
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
