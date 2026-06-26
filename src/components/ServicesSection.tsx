import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { ServiceItem, AdminServiceFormData } from '../types';
import AdminPinModal from './AdminPinModal';

const iconOptions = [
  'fa-hands-praying', 'fa-dharmachakra', 'fa-heart', 'fa-sun', 'fa-water',
  'fa-dove', 'fa-leaf', 'fa-users', 'fa-crown', 'fa-star', 'fa-mountain',
  'fa-om', 'fa-music', 'fa-drum', 'fa-guitar', 'fa-microphone',
];

const emptyForm: AdminServiceFormData = {
  icon: 'fa-hands-praying',
  name: '',
  gujarati: '',
  desc: '',
};

// ─── Service Admin Modal ──────────────────────────────────────
interface ServiceAdminModalProps {
  onClose: () => void;
}

const ServiceAdminModal: React.FC<ServiceAdminModalProps> = ({ onClose }) => {
  const { serviceItems, addServiceItem, updateServiceItem, deleteServiceItem, showToast } = useMedia();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdminServiceFormData>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const openAdd = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (item: ServiceItem) => {
    setForm({ id: item.id, icon: item.icon, name: item.name, gujarati: item.gujarati, desc: item.desc });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.desc.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (isEditing && form.id) {
      await updateServiceItem(form.id, { icon: form.icon, name: form.name, gujarati: form.gujarati, desc: form.desc });
    } else {
      await addServiceItem({ icon: form.icon, name: form.name, gujarati: form.gujarati, desc: form.desc });
    }
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string) => {
    await deleteServiceItem(id);
    setConfirmDelete(null);
  };

  const autoFill = async () => {
    if (!form.name.trim()) {
      showToast('Enter a service name first!', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: 'You are a content assistant for Dhrumil Shah Jain Sangitkar. Given a service name, return ONLY a JSON object with "gujarati" (Gujarati translation of the name) and "desc" (2-sentence English spiritual description of the service). No markdown, no extra text.',
          messages: [{ role: 'user', content: `Generate content for Jain music service: "${form.name}"` }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (parsed.gujarati) setForm((f) => ({ ...f, gujarati: parsed.gujarati }));
      if (parsed.desc) setForm((f) => ({ ...f, desc: parsed.desc }));
      showToast('AI Auto-Fill successful!', 'success');
    } catch {
      showToast('AI Auto-Fill failed. Fill manually.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-royal-900 border-2 border-gold-500 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition z-20 w-8 h-8 flex items-center justify-center bg-royal-950/50 hover:bg-royal-950 rounded-full border border-gold-500/10"
        >
          <i className="fas fa-times text-sm" />
        </button>

        <div className="border-b border-gold-500/20 pb-4 mb-6 shrink-0 pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-xl md:text-2xl font-bold text-gold-500">Services Management</h2>
              <p className="text-xs text-slate-400">Add, update, or remove religious musical services.</p>
            </div>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 self-start transition-all hover:scale-105 shadow-md"
            >
              <i className="fas fa-plus" /> Add New Service
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-modal-scrollbar">
          {showForm && (
            <div className="bg-royal-950 border border-gold-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-gold-500/10 pb-3 mb-4">
                <h3 className="font-cinzel text-sm text-gold-400 font-semibold uppercase tracking-wider">
                  {isEditing ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button
                  type="button"
                  onClick={autoFill}
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-royal-950 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow transition-all hover:scale-105 disabled:opacity-60"
                >
                  {aiLoading ? <i className="fas fa-circle-notch animate-spin" /> : <i className="fas fa-wand-magic-sparkles" />}
                  AI Auto-Fill
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Service Name (English) *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                      placeholder="e.g. Shetrunjay Bhav Yatra"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Gujarati Name</label>
                    <input
                      value={form.gujarati}
                      onChange={(e) => setForm((f) => ({ ...f, gujarati: e.target.value }))}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                      placeholder="શેત્રુંજય ભાવ યાત્રા"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Icon Class (FontAwesome)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {iconOptions.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition ${form.icon === ic ? 'bg-gold-500 text-royal-950' : 'bg-royal-900 text-gold-400 border border-gold-500/20 hover:border-gold-500/60'}`}
                        title={ic}
                      >
                        <i className={`fas ${ic}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                    className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm resize-none transition"
                    placeholder="Describe this spiritual musical service..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-royal-800 hover:bg-royal-700 text-slate-300 rounded-lg text-xs font-semibold transition">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 rounded-lg text-xs font-bold transition shadow-md">Save Service</button>
                </div>
              </form>
            </div>
          )}

          <div>
            <h3 className="font-cinzel text-sm text-gold-400 font-semibold uppercase tracking-wider mb-4 border-b border-gold-500/10 pb-2">
              Current Services ({serviceItems.length})
            </h3>
            <div className="space-y-3">
              {serviceItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-royal-950 border border-gold-500/10 rounded-xl p-3 hover:border-gold-500/30 transition">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                    {item.gujarati && <p className="text-[10px] text-slate-500 truncate">{item.gujarati}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 bg-royal-800 hover:bg-royal-700 text-gold-400 rounded-lg flex items-center justify-center text-xs transition" title="Edit">
                      <i className="fas fa-pen" />
                    </button>
                    {confirmDelete === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(item.id)} className="px-2 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition">Confirm</button>
                        <button onClick={() => setConfirmDelete(null)} className="w-8 h-8 bg-royal-800 text-slate-400 rounded-lg flex items-center justify-center text-xs transition"><i className="fas fa-times" /></button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(item.id)} className="w-8 h-8 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg flex items-center justify-center text-xs transition" title="Delete">
                        <i className="fas fa-trash" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Services Section ─────────────────────────────────────────
const ServicesSection: React.FC = () => {
  const { serviceItems, isAdmin } = useMedia();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { setIsAdmin } = useMedia();

  const handleAdminClick = () => {
    if (isAdmin) {
      setShowAdminModal(true);
    } else {
      setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setShowAdminModal(true);
  };

  return (
    <section id="services" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-xs text-gold-500 font-bold uppercase tracking-widest bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
              Spiritual Offerings • અમારી સેવાઓ
            </span>
            <button
              onClick={handleAdminClick}
              className="w-8 h-8 rounded-full bg-royal-900 border border-gold-500/30 text-gold-500 flex items-center justify-center hover:bg-gold-500 hover:text-royal-950 hover:border-gold-500 transition-all duration-300 shadow-md"
              title="Manage Services"
            >
              <i className="fas fa-cog text-sm" />
            </button>
          </div>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold tracking-wider mt-3 mb-4">
            Religious Musical Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto" />
          <p className="text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base">
            We curate spiritually elevating, beautiful, and authentic musical orchestrations for all sacred celebrations.
          </p>
        </div>

        {/* Grid - centered */}
        <div className="flex flex-wrap justify-center gap-8">
          {serviceItems.map((service) => (
            <div
              key={service.id}
              className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] bg-royal-900 border border-gold-500/10 p-8 rounded-2xl hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/5 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold-500/5 rounded-full group-hover:bg-gold-500/10 transition-colors" />
              <div className="w-14 h-14 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-500 text-2xl mb-6 border border-gold-500/20">
                <i className={`fas ${service.icon}`} />
              </div>
              <h3 className="font-cinzel text-xl font-bold text-gold-400 mb-1">{service.name}</h3>
              <h4 className="text-xs font-semibold text-slate-300 mb-3 tracking-widest uppercase">{service.gujarati}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showPinModal && (
        <AdminPinModal
          onClose={() => setShowPinModal(false)}
          onSuccess={handlePinSuccess}
        />
      )}
      {showAdminModal && (
        <ServiceAdminModal onClose={() => setShowAdminModal(false)} />
      )}
    </section>
  );
};

export default ServicesSection;
