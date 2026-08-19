import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Lock, X, RefreshCcw, Link2, AlertCircle } from 'lucide-react';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNewPassword: (e: React.FormEvent) => Promise<void>;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isLoading: boolean;
  onPasteRecoveryLink: (url: string) => Promise<void>;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSaveNewPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isLoading,
  onPasteRecoveryLink
}) => {
  const [showPass, setShowPass] = useState(false);
  const [pastedUrl, setPastedUrl] = useState('');
  const [isVerifyingLink, setIsVerifyingLink] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyPasted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedUrl.trim()) return;
    setIsVerifyingLink(true);
    setPasteError(null);
    try {
      await onPasteRecoveryLink(pastedUrl.trim());
      setPastedUrl('');
    } catch (err: any) {
      setPasteError(err.message || 'Could not verify link');
    } finally {
      setIsVerifyingLink(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d0e17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 text-[#e8ecff]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <KeyRound size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Set New Password
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a secure new password for your account.
          </p>
        </div>

        {/* Main Password Form */}
        <form onSubmit={onSaveNewPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-3 bg-[#131524] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-10 pr-10 py-3 bg-[#131524] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCcw className="animate-spin" size={16} /> Saving Password...
              </>
            ) : (
              'Save New Password & Log In'
            )}
          </button>
        </form>

        {/* Fallback Section: If email opened localhost or did not link automatically */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Link2 size={13} className="text-cyan-400" /> Did the Gmail link redirect to localhost?
          </p>
          <form onSubmit={handleVerifyPasted} className="flex gap-2">
            <input
              type="text"
              value={pastedUrl}
              onChange={e => setPastedUrl(e.target.value)}
              placeholder="Paste link from email URL bar here..."
              className="flex-1 px-3 py-2 bg-[#131524] border border-slate-700/60 rounded-lg text-xs text-slate-200 outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isVerifyingLink || !pastedUrl.trim()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isVerifyingLink ? 'Verifying...' : 'Activate'}
            </button>
          </form>
          {pasteError && (
            <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle size={10} /> {pasteError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
