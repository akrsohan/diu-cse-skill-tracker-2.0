import React from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0b12] text-white select-none px-4">
      {/* Background soft glow */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      
      {/* Brand Icon & Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-indigo-600/30 border border-cyan-400/30 flex items-center justify-center shadow-xl shadow-cyan-500/10">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0b12] flex items-center justify-center border border-cyan-500/40">
          <RefreshCcw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        </div>
      </div>

      {/* Title & Status */}
      <h2 className="text-xl font-bold tracking-tight text-white mb-2">
        DIU SkillTrack
      </h2>
      <p className="text-xs text-slate-400 tracking-wide animate-pulse font-medium">
        Verifying secure session & profile...
      </p>
    </div>
  );
};
