import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, X, Calendar, Sparkles, Flame, Check } from 'lucide-react';

interface AddTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extraDays: number, extraHours: number) => void;
  currentDeadline: string;
  skillName: string;
}

export const AddTimeModal: React.FC<AddTimeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentDeadline,
  skillName
}) => {
  const [extraDays, setExtraDays] = useState<number>(0);
  const [extraHours, setExtraHours] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setExtraDays(0);
      setExtraHours(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validDays = Math.max(0, isNaN(extraDays) ? 0 : extraDays);
  const validHours = Math.max(0, isNaN(extraHours) ? 0 : extraHours);
  const totalExtraHours = validDays * 24 + validHours;
  const isValid = totalExtraHours > 0;

  const baseDate = new Date(currentDeadline);
  const newDeadlineDate = new Date(baseDate.getTime() + totalExtraHours * 60 * 60 * 1000);
  
  const formattedNewDeadline = newDeadlineDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(validDays, validHours);
    onClose();
  };

  const presets = [
    { label: '+6 Hours', d: 0, h: 6, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 border-cyan-300 text-cyan-800 hover:bg-cyan-100' },
    { label: '+12 Hours', d: 0, h: 12, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50 border-teal-300 text-teal-800 hover:bg-teal-100' },
    { label: '+1 Day', d: 1, h: 0, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' },
    { label: '+2 Days', d: 2, h: 0, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50 border-indigo-300 text-indigo-800 hover:bg-indigo-100' },
    { label: '+3 Days', d: 3, h: 0, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100' },
    { label: '+5 Days', d: 5, h: 0, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150 cursor-default"
      id="add-time-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white border-2 border-emerald-100 rounded-3xl p-6 sm:p-9 max-w-2xl w-full my-auto shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col gap-6"
        id="add-time-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
          title="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with Emerald Badge */}
        <div className="flex items-center gap-4 pt-2 pr-8">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shrink-0 ring-4 ring-emerald-100">
            <Plus className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Deadline Extension
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1c2e] leading-tight tracking-tight">
              Add More Time
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-0.5">
              Extend duration for <b className="text-emerald-700 font-bold">{skillName}</b>
            </p>
          </div>
        </div>

        {/* Stepper Inputs for Days and Hours with Colorful Themes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Add Days Input Card (Teal/Emerald Theme) */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-teal-50/70 p-5 border-2 border-emerald-200 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                ADD DAYS
              </span>
              <span className="text-xs font-bold text-emerald-600">+24 hrs / day</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setExtraDays(Math.max(0, validDays - 1))}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-emerald-200 text-emerald-700 font-black flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0 text-lg"
                title="Decrease 1 day"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0 py-1">
                <input 
                  id="input-extra-days"
                  type="number"
                  min="0"
                  max="90"
                  value={extraDays === 0 ? '' : extraDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setExtraDays(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-emerald-950 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                  autoFocus
                />
                <span className="text-sm font-bold text-emerald-700 shrink-0">days</span>
              </div>

              <button
                type="button"
                onClick={() => setExtraDays(validDays + 1)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 cursor-pointer active:scale-95 shrink-0 text-lg"
                title="Increase 1 day"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Add Hours Input Card (Cyan/Sky Theme) */}
          <div className="bg-gradient-to-br from-cyan-50/90 via-cyan-50/50 to-blue-50/70 p-5 border-2 border-cyan-200 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-800 bg-cyan-100 px-3 py-1 rounded-lg">
                ADD HOURS
              </span>
              <span className="text-xs font-bold text-cyan-600">+1 hr each</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setExtraHours(Math.max(0, validHours - 1))}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-cyan-200 text-cyan-700 font-black flex items-center justify-center hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0 text-lg"
                title="Decrease 1 hour"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0 py-1">
                <input 
                  id="input-extra-hours"
                  type="number"
                  min="0"
                  max="48"
                  value={extraHours === 0 ? '' : extraHours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setExtraHours(isNaN(val) ? 0 : Math.max(0, Math.min(48, val)));
                  }}
                  className="w-16 sm:w-20 text-center text-3xl sm:text-4xl font-black text-cyan-950 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-cyan-700 shrink-0">hours</span>
              </div>

              <button
                type="button"
                onClick={() => setExtraHours(Math.min(48, validHours + 1))}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-600 text-white font-black flex items-center justify-center hover:bg-cyan-700 transition-all shadow-md shadow-cyan-200 cursor-pointer active:scale-95 shrink-0 text-lg"
                title="Increase 1 hour"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Colorful Quick Presets */}
        <div className="flex flex-col gap-2.5">
          <div className="text-xs sm:text-sm font-bold text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-800 font-extrabold">
              <Flame className="w-4 h-4 text-emerald-600" /> Quick Presets:
            </span>
            <span className="text-emerald-700 font-bold">Tap to auto-fill</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presets.map((btn) => {
              const isSelected = validDays === btn.d && validHours === btn.h;
              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => {
                    setExtraDays(btn.d);
                    setExtraHours(btn.h);
                  }}
                  className={`py-2.5 px-2 text-xs sm:text-sm font-black rounded-xl border-2 transition-all cursor-pointer text-center leading-tight ${
                    isSelected
                      ? `bg-gradient-to-r ${btn.color} text-white border-transparent shadow-lg scale-103 ring-2 ring-emerald-400`
                      : `${btn.bg} shadow-xs`
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview of Extended Deadline */}
        <div className={`rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
          isValid 
            ? 'bg-gradient-to-br from-[#161828] via-[#1d2d3d] to-[#161828] text-white border-2 border-emerald-400/50' 
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-emerald-950'
        }`}>
          {isValid ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base font-bold">
                <span className="flex items-center gap-2 text-emerald-400">
                  <Clock className="w-5 h-5" /> Added Time:
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-300">
                  +{validDays > 0 ? `${validDays} Day${validDays > 1 ? 's' : ''} ` : ''}
                  {validHours > 0 ? `${validHours} Hour${validHours > 1 ? 's' : ''}` : ''}
                  {' '}(+{totalExtraHours} hours)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-medium pt-2 border-t border-white/20">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>New Target: <b className="text-white font-extrabold">{formattedNewDeadline}</b></span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-900">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Enter or tap days/hours to add to this challenge.</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3.5 sm:py-4 px-5 bg-white border-2 border-gray-200 rounded-2xl font-bold text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleConfirm}
            className={`w-full sm:flex-[1.6] py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
              isValid 
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-[#37f0ff] text-white shadow-emerald-300 hover:scale-102 hover:opacity-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
            id="btn-confirm-add-time"
          >
            <Check className="w-5 h-5 text-white" />
            Add Time to Challenge
          </button>
        </div>
      </div>
    </div>
  );
};
