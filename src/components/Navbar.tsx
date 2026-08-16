import React, { useState, useRef, useEffect } from 'react';
import { PageType, Profile } from '../types';
import { Shield, User, LogOut, CheckCircle, Settings, Flame, Zap, ChevronDown, Compass, LayoutDashboard, Trophy } from 'lucide-react';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  currentUser: Profile;
  onSignOut: () => void;
  onSelectUserForProfile?: (userId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  currentUser,
  onSignOut,
  onSelectUserForProfile
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    { id: 'discover' as PageType, label: 'Discover', icon: Compass },
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard' as PageType, label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161828] border-b border-white/10 shadow-lg shadow-black/20" id="app-navbar-header">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Brand Logo & Title */}
        <div 
          className="logo cursor-pointer hover:opacity-90 transition-all group flex items-center gap-3.5 select-none shrink-0" 
          onClick={() => {
            setCurrentPage('discover');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          role="button"
          tabIndex={0}
          title="Go to SkillTrack Home (Discover)"
          id="navbar-brand-logo"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#6c5ce7] to-[#37f0ff] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#6c5ce7]/30 group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
              SkillTrack
            </span>
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#37f0ff] mt-1.5">
              DIU Student Hub
            </span>
          </div>
        </div>

        {/* Main Desktop Navigation Links (Spacious, Single Line, Crisp Separation) */}
        <div className="hidden md:flex items-center gap-2.5 bg-[#0e101a] p-2 rounded-2xl border border-white/10 shadow-inner" id="navbar-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id}
                type="button"
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-extrabold transition-all flex items-center gap-2.5 select-none whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/40 ring-1 ring-white/20' 
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setCurrentPage(item.id)}
                id={`nav-link-${item.id}`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-[#8a8ca3]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {currentUser.is_admin && (
            <button 
              type="button"
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-extrabold transition-all flex items-center gap-2 select-none whitespace-nowrap cursor-pointer ${
                currentPage === 'admin' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-1 ring-purple-300/30' 
                  : 'text-purple-300 hover:text-white hover:bg-purple-500/15'
              }`}
              onClick={() => setCurrentPage('admin')}
              id="nav-link-admin"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* User Avatar & Profile Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button 
            type="button"
            className="flex items-center gap-3 bg-[#0e101a] hover:bg-[#1f233a] border border-white/10 rounded-full pl-2 pr-4 py-2 transition-all shadow-md group focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            id="navbar-user-avatar-btn"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar Icon */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c5ce7] via-[#8b5cff] to-[#37f0ff] text-white flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-white/10 group-hover:scale-105 transition-transform">
              {getInitials(currentUser.full_name)}
            </div>
            
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                {currentUser.full_name.split(' ')[0]}
                {currentUser.profile_completed && (
                  <span className="w-2 h-2 rounded-full bg-[#00b894]"></span>
                )}
              </span>
              <span className="text-xs text-[#37f0ff] font-bold mt-0.5">
                {currentUser.points} pts
              </span>
            </div>

            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-white transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Spacious, Beautiful, Modern Dropdown Menu */}
          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-3 w-[calc(100vw-32px)] max-w-[320px] sm:w-80 bg-[#161828] border border-[#2b2f4c] rounded-2xl shadow-2xl p-3 sm:p-3.5 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
              id="navbar-user-dropdown"
            >
              {/* User Profile Header Card */}
              <div className="p-3.5 bg-gradient-to-b from-[#20233b] to-[#1a1c30] rounded-xl border border-white/5 mb-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#37f0ff] text-white flex items-center justify-center font-extrabold text-base shadow-md ring-2 ring-white/20 shrink-0">
                    {getInitials(currentUser.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-base leading-snug flex items-center gap-1.5 truncate">
                      <span className="truncate">{currentUser.full_name}</span>
                      {currentUser.profile_completed && (
                        <CheckCircle className="w-4 h-4 text-[#00b894] shrink-0" title="Profile verified" />
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                      {currentUser.department} {currentUser.batch_number ? `· ${currentUser.batch_number}` : ''}
                    </div>
                    {currentUser.roll_number && (
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        ID: {currentUser.roll_number}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats badges */}
                <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <div className="bg-[#121422]/80 px-3 py-2 rounded-lg flex items-center gap-2 border border-white/5">
                    <Zap className="w-4 h-4 text-[#37f0ff] shrink-0" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Points</div>
                      <div className="text-sm font-extrabold text-[#37f0ff] leading-none mt-0.5">{currentUser.points}</div>
                    </div>
                  </div>

                  <div className="bg-[#121422]/80 px-3 py-2 rounded-lg flex items-center gap-2 border border-white/5">
                    <Flame className="w-4 h-4 text-[#ff7675] shrink-0" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Streak</div>
                      <div className="text-sm font-extrabold text-[#ff7675] leading-none mt-0.5">{currentUser.current_streak}d</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="space-y-1">
                <button 
                  type="button"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl hover:bg-[#252945] text-slate-200 hover:text-white transition-all text-left group cursor-pointer"
                  onClick={() => {
                    if (onSelectUserForProfile) onSelectUserForProfile(currentUser.id);
                    setCurrentPage('profile');
                    setDropdownOpen(false);
                  }}
                  id="dropdown-my-profile"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#6c5ce7]/15 text-[#a29bfe] flex items-center justify-center group-hover:bg-[#6c5ce7] group-hover:text-white transition-colors shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-200 group-hover:text-white text-xs sm:text-sm">My Public Profile</div>
                    <div className="text-[11px] text-slate-400">View your earned badges and skills</div>
                  </div>
                </button>

                <button 
                  type="button"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl hover:bg-[#252945] text-slate-200 hover:text-white transition-all text-left group cursor-pointer"
                  onClick={() => {
                    setCurrentPage('profile-setup');
                    setDropdownOpen(false);
                  }}
                  id="dropdown-edit-profile"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#fdcb6e]/15 text-[#fdcb6e] flex items-center justify-center group-hover:bg-[#fdcb6e] group-hover:text-[#1a1c2e] transition-colors shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-200 group-hover:text-white text-xs sm:text-sm">Edit Profile Setup</div>
                    <div className="text-[11px] text-slate-400">Update socials, batch &amp; avatar</div>
                  </div>
                </button>

                {currentUser.is_admin && (
                  <button 
                    type="button"
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl hover:bg-purple-600/20 text-purple-200 hover:text-white transition-all text-left group cursor-pointer"
                    onClick={() => {
                      setCurrentPage('admin');
                      setDropdownOpen(false);
                    }}
                    id="dropdown-admin-panel"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-200 group-hover:text-white text-xs sm:text-sm">Admin Dashboard</div>
                      <div className="text-[11px] text-purple-300/70">Manage skills, steps &amp; users</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="my-2 border-t border-[#2b2f4c]"></div>

              {/* Sign Out */}
              <button 
                type="button"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-all text-left group cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  onSignOut();
                }}
                id="dropdown-signout"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex-1 font-semibold text-xs sm:text-sm">
                  Sign Out
                </div>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Responsive Secondary Nav Bar (For mobile & smaller screens: smooth, spacious single horizontal line) */}
      <div className="md:hidden border-t border-white/5 bg-[#121422] px-4 py-2 flex items-center justify-start gap-2.5 overflow-x-auto no-scrollbar" id="mobile-navbar-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button 
              key={item.id}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 select-none whitespace-nowrap shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/40 ring-1 ring-white/20' 
                  : 'text-[#9ca3af] hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setCurrentPage(item.id)}
              id={`mobile-nav-${item.id}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8a8ca3]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {currentUser.is_admin && (
          <button 
            type="button"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'admin' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-1 ring-purple-300/30' 
                : 'text-purple-300 hover:text-white hover:bg-purple-500/15'
            }`}
            onClick={() => setCurrentPage('admin')}
            id="mobile-nav-admin"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};

