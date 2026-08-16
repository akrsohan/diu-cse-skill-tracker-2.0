import React from 'react';
import { AlertTriangle, X, Trash2, ShieldAlert } from 'lucide-react';

interface CancelChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skillName: string;
}

export const CancelChallengeModal: React.FC<CancelChallengeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  skillName
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 cursor-default"
      id="cancel-challenge-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white border-2 border-rose-100 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-5 sm:gap-6"
        id="cancel-challenge-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 rounded-t-3xl"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-4 pt-1 pr-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shrink-0 ring-4 ring-rose-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600" /> Action Required
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1c2e] leading-tight">
              Cancel Challenge?
            </h3>
            <p className="text-xs sm:text-sm text-[#8a8ca3] font-medium">
              For skill: <b className="text-rose-600 font-bold">{skillName}</b>
            </p>
          </div>
        </div>

        {/* Description & Note */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 border-2 border-rose-200/80 rounded-2xl p-4 sm:p-5 text-rose-950 shadow-xs">
          <p className="text-sm sm:text-base font-black leading-snug mb-1.5 text-rose-900">
            Are you sure you want to cancel this challenge?
          </p>
          <p className="text-xs sm:text-sm text-rose-700/90 leading-relaxed font-medium">
            Cancelling will delete your progress for this skill and allow you to pick a new one anytime. No points will be lost.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 sm:py-3.5 px-5 bg-white border-2 border-[#e4e5ee] rounded-2xl font-bold text-sm text-[#4a4c63] hover:bg-[#f4f5f7] transition-colors cursor-pointer"
            id="btn-keep-challenge"
          >
            Keep Challenge
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-[1.5] py-3 sm:py-3.5 px-5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-black text-sm sm:text-base hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-rose-200 hover:scale-102"
            id="btn-confirm-cancel-challenge"
          >
            <Trash2 className="w-5 h-5" />
            Yes, Cancel Challenge
          </button>
        </div>
      </div>
    </div>
  );
};
