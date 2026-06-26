import React, { useState, useRef, useEffect } from 'react';
import { useMedia } from '../context/MediaContext';
import { authApi } from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const HARDCODED_PIN = '1008'; // fallback if backend not available

const AdminPinModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAdmin, showToast } = useMedia();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const verify = async () => {
    if (!pin) return;
    setLoading(true);
    setError('');

    try {
      // Try backend verification first
      const { token, success } = await authApi.verifyPin(pin);
      if (success) {
        localStorage.setItem('admin_token', token);
        setIsAdmin(true);
        showToast('Admin access granted!', 'success');
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    } catch {
      // Fallback to hardcoded PIN when backend unavailable
      if (pin === HARDCODED_PIN) {
        setIsAdmin(true);
        showToast('Admin access granted (offline mode)!', 'success');
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') verify();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-royal-900 border-2 border-gold-500 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <i className="fas fa-times text-lg" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500 mx-auto flex items-center justify-center text-gold-500 text-2xl">
            <i className="fas fa-key animate-bounce" />
          </div>
          <div>
            <h3 className="font-cinzel text-xl font-bold text-slate-200">Enter Admin PIN</h3>
            <p className="text-xs text-slate-400 mt-1">
              Authorized Access Only.
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <input
              ref={inputRef}
              type="password"
              maxLength={6}
              placeholder="• • • •"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              className="text-center tracking-widest text-2xl font-bold w-full bg-royal-950 border border-gold-500/30 rounded-lg py-3 text-gold-500 focus:border-gold-500 transition"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              onClick={verify}
              disabled={loading || !pin}
              className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-400 text-royal-950 font-bold uppercase tracking-wider text-xs rounded-lg shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? <i className="fas fa-circle-notch animate-spin" /> : 'Verify PIN & Unlock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPinModal;
