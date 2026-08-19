import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { submitFeedback } from '../lib/supabaseService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const MAX_CHARS = 1000;
  const charsRemaining = MAX_CHARS - message.length;
  const isTooLong = charsRemaining < 0;
  const isEmpty = message.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || isTooLong || loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await submitFeedback(message);
      if (!result.success) {
        setError(result.error || 'Failed to send feedback. Please try again.');
        setLoading(false);
        return;
      }

      setMessage('');
      setLoading(false);
      onClose();
      onSuccess('Thank you! Your feedback has been sent successfully.');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      id="modal-send-feedback-overlay"
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative text-[#1a1c2e] animate-scale-up"
        id="modal-send-feedback-content"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          title="Close"
          id="btn-close-feedback-modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2 pr-8">
          <div className="w-10 h-10 rounded-md bg-[#6c5ce7]/10 text-[#6c5ce7] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1a1c2e] tracking-tight">
              Send Feedback
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
          Help us improve DIU CSE Skill Tracker by sharing your thoughts.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback here..."
              rows={5}
              maxLength={MAX_CHARS + 50}
              disabled={loading}
              className={`w-full p-4 rounded-md border ${
                isTooLong 
                  ? 'border-red-400 focus:ring-red-300' 
                  : 'border-slate-300 focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20'
              } text-sm text-[#1a1c2e] placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none transition-all`}
              autoFocus
              id="textarea-feedback-message"
            />
          </div>

          {/* Character counter */}
          <div className="flex items-center justify-between text-xs mb-6">
            <span className="text-slate-500">
              Maximum 1000 characters
            </span>
            <span className={`font-mono font-medium ${isTooLong ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
              {message.length} / {MAX_CHARS}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
              id="btn-cancel-feedback"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEmpty || isTooLong || loading}
              className="px-6 py-2.5 rounded-md bg-[#6c5ce7] hover:bg-[#5b4bc4] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              id="btn-submit-feedback"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
