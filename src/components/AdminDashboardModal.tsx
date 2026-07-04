import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaItem, AdminMediaFormData } from '../types';
import { uploadFilesToCloudinary } from '../utils/cloudinaryUpload';

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

// ─── Upload progress state ────────────────────────────────────
interface UploadState {
  active: boolean;
  currentFile: string;
  currentIndex: number;
  total: number;
  pct: number;
}

const emptyUpload: UploadState = {
  active: false,
  currentFile: '',
  currentIndex: 0,
  total: 0,
  pct: 0,
};

// ─── Image slot model ─────────────────────────────────────────
// Each slot is EITHER an already-uploaded Cloudinary image (isNew: false,
// url holds the real Cloudinary URL) OR a freshly-picked local file that
// hasn't been uploaded yet (isNew: true, url holds a temporary blob preview,
// file holds the actual File to upload on save).
// Keeping everything in ONE ordered array — instead of separate
// selectedFiles/previewUrls arrays — means adding new files APPENDS to the
// existing set and removing a slot only removes that one item, regardless
// of whether it was an existing image or a newly picked one.
interface ImageSlot {
  key: string;
  url: string;
  isNew: boolean;
  file?: File;
}

const AdminDashboardModal: React.FC<Props> = ({ onClose, sanitizeYouTubeUrl }) => {
  const { mediaItems, addMediaItem, updateMediaItem, deleteMediaItem, showToast, maxMediaItems } = useMedia();
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState<AdminMediaFormData>(emptyForm);
  const [isEditing, setIsEditing]       = useState(false);

  // Multi-image gallery state (type === 'file_image')
  const [imageSlots, setImageSlots]     = useState<ImageSlot[]>([]);
  // Single video file state (type === 'file_video')
  const [videoFile, setVideoFile]       = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');

  const [uploadState, setUploadState]   = useState<UploadState>(emptyUpload);
  const [aiLoading, setAiLoading]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting]         = useState<string | null>(null);

  // ─── Open/close helpers ──────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setIsEditing(false);
    clearFileState();
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

    if (item.type === 'file_image') {
      // Seed the slot list with the existing Cloudinary URLs so they can be
      // reordered/removed/added-to just like newly picked files.
      const existingUrls = item.images && item.images.length > 0 ? item.images : (item.url ? [item.url] : []);
      setImageSlots(existingUrls.map((url, i) => ({ key: `existing-${i}-${url}`, url, isNew: false })));
      setVideoFile(null);
      setVideoPreviewUrl('');
    } else if (item.type === 'file_video') {
      setImageSlots([]);
      setVideoFile(null);
      setVideoPreviewUrl(item.url || '');
    } else {
      setImageSlots([]);
      setVideoFile(null);
      setVideoPreviewUrl('');
    }

    setShowForm(true);
  };

  const clearFileState = () => {
    // Revoke any local blob URLs we created so we don't leak memory.
    imageSlots.forEach((slot) => { if (slot.isNew) URL.revokeObjectURL(slot.url); });
    if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl);

    setImageSlots([]);
    setVideoFile(null);
    setVideoPreviewUrl('');
    setUploadState(emptyUpload);
  };

  const handleTypeChange = (type: MediaItem['type']) => {
    const isVideo = type === 'file_video' || type === 'youtube' || type === 'instagram';
    setForm((f) => ({ ...f, type, category: isVideo ? 'Video' : 'Image', url: '', images: [] }));
    clearFileState();
  };

  // ─── File selection ───────────────────────────────────────────
  // For images: APPEND newly picked files to whatever is already in
  // imageSlots (existing Cloudinary images + any previously picked files).
  // This is the key fix — previously this handler replaced the entire
  // array, which is why removing one image and picking a new one wiped
  // out every other image in the gallery.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (form.type === 'file_image') {
      const fileArr = Array.from(files);
      const newSlots: ImageSlot[] = fileArr.map((f, i) => ({
        key: `new-${Date.now()}-${i}-${f.name}`,
        url: URL.createObjectURL(f),
        isNew: true,
        file: f,
      }));
      setImageSlots((prev) => [...prev, ...newSlots]);
    } else {
      // Video is a single file — replace whatever was selected before.
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      const file = files[0];
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }

    // Reset the input value so picking the exact same file again still fires onChange.
    e.target.value = '';
  };

  const removeImageSlot = (idx: number) => {
    setImageSlots((prev) => {
      const slot = prev[idx];
      if (slot?.isNew) URL.revokeObjectURL(slot.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // ─── Save handler ────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validate per media type ──
    if (form.type === 'file_image') {
      if (imageSlots.length === 0) {
        showToast('Please select at least one image.', 'error');
        return;
      }
    } else if (form.type === 'file_video') {
      if (!videoFile && !videoPreviewUrl) {
        showToast('Please select a video file.', 'error');
        return;
      }
    } else {
      if (!form.url.trim()) {
        showToast('Please provide a media URL.', 'error');
        return;
      }
    }

    setSaving(true);

    try {
      let finalUrl    = form.url;
      let finalImages: string[] = [];

      if (form.type === 'file_image') {
        const slotsToUpload = imageSlots.filter((s) => s.isNew && s.file);

        if (slotsToUpload.length > 0) {
          setUploadState({ active: true, currentFile: '', currentIndex: 0, total: slotsToUpload.length, pct: 0 });

          const uploadedUrls = await uploadFilesToCloudinary(
            slotsToUpload.map((s) => s.file as File),
            ({ file, index, total, pct }) => {
              setUploadState({ active: true, currentFile: file, currentIndex: index, total, pct });
            },
          );

          setUploadState(emptyUpload);

          // Merge uploaded URLs back into their original positions so the
          // final order (and cover image) matches what the admin arranged,
          // while keeping every existing image that wasn't touched.
          let uploadIdx = 0;
          finalImages = imageSlots.map((slot) => (slot.isNew ? uploadedUrls[uploadIdx++] : slot.url));
        } else {
          // Nothing new to upload — keep the existing images as-is (minus
          // whatever was removed with the "x" button).
          finalImages = imageSlots.map((slot) => slot.url);
        }

        finalUrl = finalImages[0] || '';
      } else if (form.type === 'file_video') {
        if (videoFile) {
          setUploadState({ active: true, currentFile: videoFile.name, currentIndex: 0, total: 1, pct: 0 });

          const uploadedUrls = await uploadFilesToCloudinary(
            [videoFile],
            ({ file, index, total, pct }) => {
              setUploadState({ active: true, currentFile: file, currentIndex: index, total, pct });
            },
          );

          setUploadState(emptyUpload);
          finalUrl = uploadedUrls[0];
        } else {
          // Editing without picking a new video — keep the existing URL.
          finalUrl = videoPreviewUrl;
        }
        finalImages = [];
      } else {
        finalUrl    = form.url;
        finalImages = [];
      }

      const payload = {
        title:          form.title,
        gujaratiTitle:  form.gujaratiTitle,
        type:           form.type,
        url:            finalUrl,
        // Always send the real array (even empty) — never `undefined`.
        // Sending `undefined` gets stripped by JSON.stringify, and the
        // backend's `COALESCE($5, images)` then silently keeps the OLD
        // images, which was the second half of this bug.
        images:         finalImages,
        description:    form.description,
        category:       form.category,
      };

      if (isEditing && form.id) {
        await updateMediaItem(form.id, payload);
      } else {
        await addMediaItem(payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      clearFileState();
    } catch (err: unknown) {
      // Cloudinary config error — give a clearer message
      const msg = (err as Error)?.message || '';
      if (msg.includes('Cloudinary is not configured')) {
        showToast('Image hosting not set up yet. See setup instructions.', 'error');
      }
      // Other errors already toasted by MediaContext
    } finally {
      setSaving(false);
      setUploadState(emptyUpload);
    }
  };

  // ─── Delete handler ──────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteMediaItem(id);
      setConfirmDelete(null);
    } catch { /* error toast shown by context */ } finally {
      setDeleting(null);
    }
  };

  // ─── AI Auto-Fill ────────────────────────────────────────────
  const autoFill = async () => {
    if (!form.title.trim()) { showToast('Enter a title first so AI can enrich it!', 'info'); return; }
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
      if (parsed.gujarati)    setForm((f) => ({ ...f, gujaratiTitle: parsed.gujarati }));
      if (parsed.description) setForm((f) => ({ ...f, description: parsed.description }));
      showToast('AI Auto-Fill successful!', 'success');
    } catch {
      showToast('AI Auto-Fill failed. Fill manually.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const isBusy = saving || uploadState.active;

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-royal-900 border border-gold-500/30 rounded-2xl w-full max-w-3xl my-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gold-500/10">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-gold-400">Media Management Dashboard</h2>
            <p className="text-xs text-slate-400 mt-0.5">Add, update, or remove gallery showcase assets in real time.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-md hover:scale-105 self-start"
            >
              <i className="fas fa-plus" /> Add New Media
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-gold-500 transition z-20 w-8 h-8 flex items-center justify-center bg-royal-950/50 hover:bg-royal-800 rounded-full border border-gold-500/10"
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-modal-scrollbar">

          {/* ── Add / Edit Form ── */}
          {showForm && (
            <div className="bg-royal-950 border border-gold-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-cinzel text-xs text-gold-400 font-semibold uppercase tracking-wider">
                  {isEditing ? 'Edit Gallery Item' : 'Add Gallery Item'}
                </h3>
                <button
                  type="button"
                  onClick={autoFill}
                  disabled={aiLoading || isBusy}
                  className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-royal-950 px-3 py-1.5 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                >
                  {aiLoading
                    ? <><i className="fas fa-circle-notch animate-spin" /> Thinking...</>
                    : <><i className="fas fa-wand-magic-sparkles" /> AI Auto-Fill</>}
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">

                {/* Title row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      Title (English) <span className="text-rose-400">*</span>
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
                      <option value="youtube">YouTube Link</option>
                      <option value="instagram">Instagram Link</option>
                      <option value="file_image">Upload Local Image(s)</option>
                      <option value="file_video">Upload Local Video</option>
                      <option value="image">Image URL (external)</option>
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

                {/* Media input */}
                {(form.type === 'file_image' || form.type === 'file_video') ? (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
                      {form.type === 'file_image' ? 'Select Image File(s)' : 'Select Video File'}
                    </label>
                    <input
                      type="file"
                      accept={form.type === 'file_image' ? 'image/*' : 'video/*'}
                      multiple={form.type === 'file_image'}
                      onChange={handleFileChange}
                      disabled={isBusy}
                      className="w-full bg-royal-900 border border-gold-500/20 rounded-lg px-3 py-2 text-slate-200 text-sm disabled:opacity-60"
                    />
                    {form.type === 'file_image' && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Select multiple photos to create a swipeable slider. Files are uploaded to Cloudinary — the first becomes the cover. Picking more files adds to your existing selection; use the × to remove any of them.
                      </p>
                    )}
                    {form.type === 'file_video' && videoFile && (
                      <p className="text-[10px] text-slate-400 mt-1">Selected: {videoFile.name}</p>
                    )}

                    {/* Upload progress bar */}
                    {uploadState.active && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-gold-400">
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-cloud-upload-alt animate-pulse" />
                            Uploading {uploadState.currentIndex + 1} of {uploadState.total}: {uploadState.currentFile}
                          </span>
                          <span>{uploadState.pct}%</span>
                        </div>
                        <div className="w-full bg-royal-800 rounded-full h-1.5">
                          <div
                            className="bg-gold-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadState.pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Image previews */}
                    {form.type === 'file_image' && imageSlots.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {imageSlots.map((slot, idx) => (
                          <div key={slot.key} className="relative w-16 h-16 shrink-0">
                            <img
                              src={slot.url}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full rounded-lg object-cover border border-gold-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageSlot(idx)}
                              disabled={isBusy}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[9px] shadow disabled:opacity-50"
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
                    onClick={() => { setShowForm(false); clearFileState(); }}
                    disabled={isBusy}
                    className="px-4 py-2 bg-royal-800 hover:bg-royal-700 text-slate-300 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-royal-950 rounded-lg text-xs font-bold transition shadow-md disabled:opacity-60 flex items-center gap-2"
                  >
                    {isBusy && <i className="fas fa-circle-notch animate-spin" />}
                    {uploadState.active ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Media List ── */}
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