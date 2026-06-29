import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaItem, AdminMediaFormData } from '../types';
import { compressImageFiles } from '../utils/compressImage';

interface Props {
  onClose: () => void;
  sanitizeYouTubeUrl: (url: string) => string;
}

const emptyForm: AdminMediaFormData = {
  title: '',
  gujaratiTitle: '',
  type: 'youtube',
  url: '',
  images: [],
  description: '',
  category: 'Video',
};

const AdminDashboardModal: React.FC<Props> = ({ onClose, sanitizeYouTubeUrl }) => {
  const { mediaItems, addMediaItem, updateMediaItem, deleteMediaItem, showToast, maxMediaItems } = useMedia();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdminMediaFormData>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [filePreview, setFilePreview] = useState('');
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setFilePreview('');
    setFilePreviews([]);
    setShowForm(true);
  };

  const openEdit = (item: MediaItem) => {
    setForm({
      id: item.id,
      title: item.title,
      gujaratiTitle: item.gujaratiTitle || '',
      type: item.type,
      url: item.url,
      images: item.images || [],
      description: item.description || '',
      category: item.category,
    });
    setIsEditing(true);
    setFilePreview('');
    setFilePreviews(item.images && item.images.length > 0 ? item.images : []);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (form.type === 'file_image') {
      const fileArray = Array.from(files);
      setIsCompressing(true);
      compressImageFiles(fileArray)
        .then((results) => {
          setForm((f) => ({ ...f, url: results[0], images: results }));
          setFilePreviews(results);
          setFilePreview(results[0]);
        })
        .catch(() => {
          showToast('One or more images could not be processed. Try a different photo.', 'error');
        })
        .finally(() => setIsCompressing(false));
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setForm((f) => ({ ...f, url: result, images: [] }));
        setFilePreview(result);
        setFilePreviews([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePreviewImage = (idx: number) => {
    setFilePreviews((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setForm((f) => ({ ...f, images: next, url: next[0] || '' }));
      setFilePreview(next[0] || '');
      return next;
    });
  };

  const handleTypeChange = (type: MediaItem['type']) => {
    const isVideo = type === 'file_video' || type === 'youtube' || type === 'instagram';
    setForm((f) => ({
      ...f,
      type,
      category: isVideo ? 'Video' : 'Image',
      url: '',
      images: [],
    }));
    setFilePreview('');
    setFilePreviews([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url && !filePreview && filePreviews.length === 0) {
      showToast('Please provide a media URL or upload a file.', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      gujaratiTitle: form.gujaratiTitle,
      type: form.type,
      url: form.url,
      images: form.images && form.images.length > 0 ? form.images : undefined,
      description: form.description,
      category: form.category,
    };

    try {
      if (isEditing && form.id) {
        await updateMediaItem(form.id, payload);
      } else {
        await addMediaItem(payload);
      }
      // Only close form on success
      setShowForm(false);
      setForm(emptyForm);
      setFilePreviews([]);
    } catch {
      // Error toast already shown by context — keep form open so user can fix
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteMediaItem(id);
      setConfirmDelete(null);
    } catch {
      // Error toast shown by context
    } finally {
      setDeleting(null);
    }
  };

  const autoFill = async () => {
    if (!form.title.trim()) {
      showToast('Enter a title first so AI can enrich it!', 'info');
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
          system: 'You are a metadata assistant for Dhrumil Shah\'s Jain Devotional Music archive. Given a title, return ONLY a JSON object with "gujarati" (Gujarati translation) and "description" (spiritual 1–2 sentence English description). No markdown, no extra text.',
          messages: [{ role: 'user', content: `Generate metadata for: "${form.title}"` }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (parsed.gujarati) setForm((f) => ({ ...f, gujaratiTitle: parsed.gujarati }));
      if (parsed.description) setForm((f) => ({ ...f, description: parsed.description }));
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
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition z-20 w-8 h-8 flex items-center justify-center bg-royal-950/50 hover:bg-royal-950 rounded-full border border-gold-500/10"
        >
          <i className="fas fa-times text-sm" />
        </button>

        {/* Header */}
        <div className="border-b border-gold-500/20 pb-4 mb-6 shrink-0 pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-xl md:text-2xl font-bold text-gold-500">Media Management Dashboard</h2>
              <p className="text-xs text-slate-400">Add, update, or remove gallery showcase assets in real time.</p>
            </div>
            <button
              onClick={openAdd}
              disabled={mediaItems.length >= maxMediaItems}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center gap-2 self-start transition-all hover:scale-105 shadow-md"
              title={mediaItems.length >= maxMediaItems ? `Maximum ${maxMediaItems} items reached` : 'Add new media'}
            >
              <i className="fas fa-plus" /> Add New Media
              {mediaItems.length >= maxMediaItems && <span className="ml-1 text-yellow-300">(Limit reached)</span>}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-modal-scrollbar">
          {/* Add / Edit Form */}
          {showForm && (
            <div className="bg-royal-950 border border-gold-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-gold-500/10 pb-3 mb-4">
                <h3 className="font-cinzel text-sm text-gold-400 font-semibold uppercase tracking-wider">
                  {isEditing ? 'Edit Gallery Item' : 'Add Gallery Item'}
                </h3>
                <button
                  type="button"
                  onClick={autoFill}
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-royal-950 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow transition-all hover:scale-105 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <i className="fas fa-circle-notch animate-spin" />
                  ) : (
                    <i className="fas fa-wand-magic-sparkles" />
                  )}
                  AI Auto-Fill
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Title Row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      Title (English) *
                    </label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                      placeholder="e.g. Shankheshwar Bhakti Sandhya"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      Gujarati Title
                    </label>
                    <input
                      value={form.gujaratiTitle}
                      onChange={(e) => setForm((f) => ({ ...f, gujaratiTitle: e.target.value }))}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                      placeholder="લાઇવ ભક્તિ સંધ્યા"
                    />
                  </div>
                </div>

                {/* Type + Category */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      Media Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => handleTypeChange(e.target.value as MediaItem['type'])}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                    >
                      <option value="image">Image URL</option>
                      <option value="file_image">Upload Local Image</option>
                      <option value="youtube">YouTube Embed URL</option>
                      <option value="file_video">Upload Local Video</option>
                      <option value="instagram">Instagram Reel Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      Category Filter Tag
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as 'Image' | 'Video' }))}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                    >
                      <option value="Image">Image</option>
                      <option value="Video">Video</option>
                    </select>
                  </div>
                </div>

                {/* URL / File Input */}
                {form.type === 'file_image' || form.type === 'file_video' ? (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      {form.type === 'file_image' ? 'Select Image File(s)' : 'Select Video File (Max 100MB)'}
                    </label>
                    <input
                      type="file"
                      accept={form.type === 'file_image' ? 'image/*' : 'video/*'}
                      multiple={form.type === 'file_image'}
                      onChange={handleFileChange}
                      disabled={isCompressing}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 text-sm disabled:opacity-60"
                    />
                    {form.type === 'file_image' && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Select multiple photos to create a swipeable slider. The first one becomes the cover image.
                      </p>
                    )}
                    {isCompressing && (
                      <p className="text-[10px] text-gold-400 mt-1 flex items-center gap-1.5">
                        <i className="fas fa-circle-notch animate-spin" /> Processing images...
                      </p>
                    )}
                    {form.type === 'file_image' && filePreviews.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {filePreviews.map((src, idx) => (
                          <div key={idx} className="relative w-16 h-16 shrink-0">
                            <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full rounded-lg object-cover border border-gold-500/20" />
                            <button
                              type="button"
                              onClick={() => removePreviewImage(idx)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] shadow"
                            >
                              <i className="fas fa-times" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-black/70 text-gold-400 font-bold uppercase tracking-wider rounded-b-lg">
                                Cover
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      filePreview && form.type === 'file_image' && (
                        <img src={filePreview} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-gold-500/20" />
                      )
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      Source Media URL
                    </label>
                    <input
                      value={form.url}
                      onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm transition"
                      placeholder={
                        form.type === 'youtube'
                          ? 'https://www.youtube.com/watch?v=... or <iframe> code'
                          : 'https://...'
                      }
                    />
                    {form.type === 'youtube' && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        You can paste a direct URL or copied &lt;iframe&gt; embed code.
                      </p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                    Brief Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 focus:border-gold-500 text-sm resize-none transition"
                    placeholder="Provide spiritually uplifting details..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-royal-800 hover:bg-royal-700 text-slate-300 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || isCompressing}
                    className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 rounded-lg text-xs font-bold transition shadow-md disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving && <i className="fas fa-circle-notch animate-spin" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Media List */}
          <div>
            <h3 className="font-cinzel text-sm text-gold-400 font-semibold uppercase tracking-wider mb-4 border-b border-gold-500/10 pb-2">
              Currently Configured Assets ({mediaItems.length}/{maxMediaItems})
            </h3>
            <div className="space-y-3">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-royal-950 border border-gold-500/10 rounded-xl p-3 hover:border-gold-500/30 transition"
                >
                  {/* Thumb */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-royal-800 shrink-0 border border-gold-500/10 flex items-center justify-center relative">
                    {(item.type === 'image' || item.type === 'file_image') ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fab fa-youtube text-gold-500 text-lg" />
                    )}
                    {item.images && item.images.length > 1 && (
                      <span className="absolute bottom-0 right-0 bg-gold-500 text-royal-950 text-[8px] font-bold px-1 rounded-tl leading-tight">
                        {item.images.length}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.title}</p>
                    {item.gujaratiTitle && (
                      <p className="text-[10px] text-slate-500 truncate">{item.gujaratiTitle}</p>
                    )}
                    <span className="text-[9px] bg-gold-500/10 text-gold-500 px-1.5 py-0.5 rounded border border-gold-500/20 font-semibold uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="w-8 h-8 bg-royal-800 hover:bg-royal-700 text-gold-400 rounded-lg flex items-center justify-center text-xs transition"
                      title="Edit"
                    >
                      <i className="fas fa-pen" />
                    </button>
                    {confirmDelete === item.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="px-2 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition disabled:opacity-60 flex items-center gap-1"
                        >
                          {deleting === item.id ? <i className="fas fa-circle-notch animate-spin" /> : null}
                          {deleting === item.id ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          disabled={deleting === item.id}
                          className="w-8 h-8 bg-royal-800 text-slate-400 rounded-lg flex items-center justify-center text-xs transition disabled:opacity-50"
                        >
                          <i className="fas fa-times" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(item.id)}
                        className="w-8 h-8 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg flex items-center justify-center text-xs transition"
                        title="Delete"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {mediaItems.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <i className="fas fa-photo-film text-2xl mb-2 block opacity-30" />
                  No media items yet. Click "Add New Media" to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardModal;