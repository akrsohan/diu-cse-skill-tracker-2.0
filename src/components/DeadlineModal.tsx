import React, { useState } from 'react';
import { Skill } from '../types';
import { Clock, AlertTriangle, Check, X, Flame } from 'lucide-react';

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

  const totalHours = days * 24 + hours;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="deadline-modal-backdrop">
      <div 
        className="bg-[#fff] border border-[#e4e5ee] rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        id="deadline-modal-container"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8a8ca3] hover:text-[#1a1c2e] p-1.5 rounded-full hover:bg-[#f4f5f7] transition-colors"
          id="deadline-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
            style={{ background: skill.bg_color || '#6c5ce7' }}
          >
            {skill.icon || skill.name.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1a1c2e]">{skill.name} Challenge</h3>
            <p className="text-xs text-[#8a8ca3]">Set your commitment & deadline</p>
          </div>
        </div>

        <div className="bg-[#f9f9fc] border border-[#e4e5ee] rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6c5ce7] mb-2 uppercase tracking-wide">
            <Flame className="w-4 h-4" /> Recommended Timeline
          </div>
          <p className="text-xs text-[#4a4c63] leading-relaxed">
            Most DIU students complete this skill within <b>{skill.avg_days || '2-3 days'}</b>. 
            Once started, your countdown clock begins immediately on your dashboard!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-[#4a4c63] uppercase tracking-wider block mb-2">
              Select Days
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    days === d
                      ? 'bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-md shadow-purple-200'
                      : 'bg-white text-[#4a4c63] border-[#e4e5ee] hover:bg-[#f4f5f7]'
                  }`}
                  id={`btn-deadline-days-${d}`}
                >
                  {d} {d === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#4a4c63] uppercase tracking-wider block mb-2">
              Additional Hours (Optional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 6, 12, 18].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    hours === h
                      ? 'bg-[#1a1c2e] text-white border-[#1a1c2e]'
                      : 'bg-white text-[#4a4c63] border-[#e4e5ee] hover:bg-[#f4f5f7]'
                  }`}
                  id={`btn-deadline-hours-${h}`}
                >
                  +{h} hrs
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#f1eefe] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#6c5ce7] font-bold mb-6">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Total Deadline:
          </span>
          <span className="text-sm font-extrabold text-[#1a1c2e]">
            {days} Days {hours > 0 ? `${hours} Hours` : ''} ({totalHours}h total)
          </span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-[#e4e5ee] rounded-xl font-bold text-xs text-[#4a4c63] hover:bg-[#f4f5f7] transition-colors"
            id="btn-cancel-deadline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(days, hours)}
            className="flex-[1.5] py-3 px-4 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-200 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            id="btn-confirm-deadline"
          >
            <Check className="w-4 h-4" />
            Start Challenge Now
          </button>
        </div>
      </div>
    </div>
  );
};
