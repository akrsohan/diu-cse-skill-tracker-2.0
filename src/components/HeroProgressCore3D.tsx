import React from 'react';

interface HeroProgressCore3DProps {
  points: number;
  streak: number;
  batchRank: string | number;
}

export const HeroProgressCore3D: React.FC<HeroProgressCore3DProps> = ({
  points,
  streak,
  batchRank
}) => {
  return (
    <div 
      className="hero-3d-core-container relative select-none pointer-events-none hidden lg:flex items-center justify-center"
      style={{ perspective: '900px' }}
      aria-hidden="true"
    >
      {/* Outer 3D floating orb/rings */}
      <div className="relative w-28 h-28 flex items-center justify-center transform-gpu">
        
        {/* Soft Background Radial Light Depth */}
        <div 
          className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-125 opacity-70 animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        {/* Ambient Ring 1 (Tilted 3D Orbit) */}
        <div 
          className="absolute w-28 h-28 rounded-full border border-white/35 shadow-inner"
          style={{
            transform: 'rotateX(62deg) rotateY(18deg) translateZ(0)',
            boxShadow: '0 0 15px rgba(255,255,255,0.35), inset 0 0 15px rgba(255,255,255,0.25)',
            animation: 'heroOrbitSpin 14s linear infinite'
          }}
        />

        {/* Ambient Ring 2 (Cross Orbit with Accent glow) */}
        <div 
          className="absolute w-24 h-24 rounded-full border border-white/25"
          style={{
            transform: 'rotateX(-55deg) rotateY(35deg) translateZ(0)',
            borderStyle: 'dashed',
            animation: 'heroOrbitSpinReverse 18s linear infinite'
          }}
        />

        {/* Center 2.5D Sphere Core */}
        <div 
          className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-white/30 via-white/70 to-white flex items-center justify-center shadow-lg transform-gpu transition-transform duration-500 hover:scale-110"
          style={{
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(108, 92, 231, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* Core Central Symbol */}
          <div className="flex flex-col items-center justify-center text-[#6c5ce7] font-black leading-none">
            <span className="text-xl filter drop-shadow-xs">⚡</span>
            <span className="text-[9px] tracking-wider uppercase opacity-90 font-mono font-extrabold mt-0.5">HUB</span>
          </div>

          {/* Core Glint Reflection */}
          <div 
            className="absolute top-1.5 left-2 w-4 h-2 rounded-full bg-white/90 blur-[0.5px] transform -rotate-35"
          />
        </div>

        {/* Floating Node 1: Mini points indicator */}
        <div 
          className="absolute -top-1 -right-2 px-2 py-0.5 rounded-full bg-white/90 text-[#6c5ce7] text-[10px] font-black shadow-md border border-white flex items-center gap-1 transform-gpu"
          style={{
            animation: 'heroFloatingNode 3.5s ease-in-out infinite alternate',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00b894] animate-ping" />
          <span>DIU</span>
        </div>

        {/* Floating Node 2: Mini Rank Star */}
        <div 
          className="absolute -bottom-1 -left-2 px-2 py-0.5 rounded-full bg-white/90 text-[#e84393] text-[10px] font-black shadow-md border border-white flex items-center gap-1 transform-gpu"
          style={{
            animation: 'heroFloatingNodeReverse 4s ease-in-out infinite alternate',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
          }}
        >
          <span>🎯</span>
          <span>{batchRank}</span>
        </div>

      </div>
    </div>
  );
};
