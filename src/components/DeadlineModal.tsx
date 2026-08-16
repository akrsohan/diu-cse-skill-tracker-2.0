import React, { useState } from 'react';
import { Skill } from '../types';
import { Clock, Check, X, Flame, Calendar, AlertCircle } from 'lucide-react';

interface DeadlineModalProps {
  skill: Skill;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (days: number, hours: number) => void;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({
  skill,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [days, setDays] = useState<number>(2);
  const [hours, setHours] = useState<number>(0);

  if (!isOpen) return null;

  const validDays = Math.max(0, isNaN(days) ? 0 : days);
  const validHours = Math.max(0, isNaN(hours) ? 0 : hours);
  const totalHours = validDays * 24 + validHours;
  const isValidDuration = totalHours > 0;

  // Compute calculated finish date preview
  const estimatedEndDate = new Date(Date.now() + totalHours * 60 * 60 * 1000);
  const formattedEndDate = estimatedEndDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleQuickPreset = (presetDays: number, presetHours: number) => {
    setDays(presetDays);
    setHours(presetHours);
  };

  const handleConfirm = () => {
    if (!isValidDuration) return;
    onConfirm(validDays, validHours);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200" id="deadline-modal-backdrop">
      <div 
        className="bg-white border border-[#e4e5ee] rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        id="deadline-modal-container"
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#8a8ca3] hover:text-[#1a1c2e] p-1.5 rounded-full hover:bg-[#f4f5f7] transition-colors cursor-pointer"
          id="deadline-modal-close-btn"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Skill Header */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div 
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shrink-0"
            style={{ background: skill.bg_color || '#6c5ce7' }}
          >
            {skill.icon || skill.name.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] leading-tight">{skill.name} Challenge</h3>
            <p className="text-xs text-[#8a8ca3]">Set your custom deadline & commitment</p>
          </div>
        </div>

        {/* Recommended Timeline Note */}
        <div className="bg-[#f9f9fc] border border-[#e4e5ee] rounded-2xl p-3.5 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6c5ce7] mb-1 uppercase tracking-wide">
            <Flame className="w-4 h-4" /> Recommended Timeline
          </div>
          <p className="text-xs text-[#4a4c63] leading-relaxed">
            Most DIU students complete this skill within <b>{skill.avg_days || '2-3 days'}</b>. 
            Choose the pace that fits your schedule.
          </p>
        </div>

        {/* Custom Deadline Inputs: Days & Hours */}
        <div className="space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* Days input */}
            <div className="bg-white p-3.5 border border-[#e4e5ee] rounded-2xl focus-within:border-[#6c5ce7] focus-within:ring-2 focus-within:ring-[#6c5ce7]/10 transition-all shadow-xs">
              <label className="text-[11px] font-bold text-[#4a4c63] uppercase tracking-wider block mb-1.5" htmlFor="input-deadline-days">
                Days
              </label>
              <div className="flex items-center gap-2">
                <input 
                  id="input-deadline-days"
                  type="number"
                  min="0"
                  max="90"
                  value={days === 0 && hours > 0 ? 0 : days || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDays(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full text-lg sm:text-xl font-extrabold text-[#1a1c2e] focus:outline-none bg-transparent"
                  placeholder="0"
                />
                <span className="text-xs font-semibold text-[#8a8ca3]">days</span>
              </div>
            </div>

            {/* Hours input */}
            <div className="bg-white p-3.5 border border-[#e4e5ee] rounded-2xl focus-within:border-[#6c5ce7] focus-within:ring-2 focus-within:ring-[#6c5ce7]/10 transition-all shadow-xs">
              <label className="text-[11px] font-bold text-[#4a4c63] uppercase tracking-wider block mb-1.5" htmlFor="input-deadline-hours">
                Hours
              </label>
              <div className="flex items-center gap-2">
                <input 
                  id="input-deadline-hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours === 0 && days > 0 ? 0 : hours || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setHours(isNaN(val) ? 0 : Math.max(0, Math.min(23, val)));
                  }}
                  className="w-full text-lg sm:text-xl font-extrabold text-[#1a1c2e] focus:outline-none bg-transparent"
                  placeholder="0"
                />
                <span className="text-xs font-semibold text-[#8a8ca3]">hours</span>
              </div>
            </div>

          </div>

          {/* Quick presets for convenience */}
          <div>
            <div className="text-[11px] font-semibold text-[#8a8ca3] mb-2 flex items-center justify-between">
              <span>Quick Presets:</span>
              <span className="text-[10px] text-[#6c5ce7]">Click to populate</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '12 Hours', d: 0, h: 12 },
                { label: '1 Day', d: 1, h: 0 },
                { label: '2 Days', d: 2, h: 0 },
                { label: '3 Days', d: 3, h: 0 },
                { label: '5 Days', d: 5, h: 0 },
                { label: '7 Days', d: 7, h: 0 }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleQuickPreset(p.d, p.h)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    validDays === p.d && validHours === p.h
                      ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-xs'
                      : 'bg-[#f4f5f7] text-[#4a4c63] border-transparent hover:bg-[#e4e5ee]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Deadline Summary */}
        <div className={`rounded-2xl p-3.5 mb-5 transition-all ${
          isValidDuration ? 'bg-[#f1eefe] border border-[#6c5ce7]/20 text-[#6c5ce7]' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {isValidDuration ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Total Duration:
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#1a1c2e]">
                  {validDays > 0 ? `${validDays} Day${validDays > 1 ? 's' : ''} ` : ''}
                  {validHours > 0 ? `${validHours} Hour${validHours > 1 ? 's' : ''}` : ''}
                  {' '}({totalHours}h total)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#4a4c63] font-medium pt-1 border-t border-[#6c5ce7]/10">
                <Calendar className="w-3.5 h-3.5 text-[#6c5ce7]" />
                <span>Deadline target: <b>{formattedEndDate}</b></span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please enter at least 1 hour or 1 day for your deadline.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 bg-white border border-[#e4e5ee] rounded-xl font-bold text-xs text-[#4a4c63] hover:bg-[#f4f5f7] transition-colors cursor-pointer"
            id="btn-cancel-deadline"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValidDuration}
            onClick={handleConfirm}
            className={`w-full sm:flex-[1.5] py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              isValidDuration 
                ? 'bg-gradient-to-r from-[#6c5ce7] to-[#806af5] text-white shadow-purple-200 hover:opacity-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
            id="btn-confirm-deadline"
          >
            <Check className="w-4 h-4" />
            Confirm & Start
          </button>
        </div>
      </div>
    </div>
  );
};
