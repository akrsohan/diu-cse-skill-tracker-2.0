import React, { useState, useEffect, useMemo } from 'react';
import { 
  PageType, 
  Profile, 
  Skill, 
  Field, 
  RoadmapStep, 
  UserProgress, 
  Badge 
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { 
  ADMIN_EMAIL,
  initialFields, 
  initialSkills, 
  initialRoadmapSteps, 
  initialBadges, 
  initialProfiles, 
  initialCompletedSkills, 
  initialActiveProgress 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { DeadlineModal } from './components/DeadlineModal';
import { AddTimeModal } from './components/AddTimeModal';
import { CancelChallengeModal } from './components/CancelChallengeModal';
import { SkillModal, StepModal } from './components/AdminModals';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  Trophy, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink, 
  Plus, 
  Shield, 
  Trash2, 
  Edit, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Upload, 
  UserCheck, 
  Check, 
  Lock,
  Search,
  Filter
} from 'lucide-react';

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState<PageType>('discover');
  const [discoverView, setDiscoverView] = useState<'main' | 'fields' | 'field-skills' | 'all-skills'>('main');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState(ADMIN_EMAIL);
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('Md. Sohan Ali');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App Data State
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [roadmapSteps, setRoadmapSteps] = useState<Record<string, RoadmapStep[]>>(initialRoadmapSteps);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [completedSkillsMap, setCompletedSkillsMap] = useState(initialCompletedSkills);
  
  // Selected Profile for Public Profile view
  const [selectedUserId, setSelectedUserId] = useState<string>('user-sohan');

  // Logged-in User Profile (mdsohanali636@gmail.com is Admin)
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]); // Md. Sohan Ali

  // Active Challenge (User Progress) - Persisted in localStorage so deletions/cancellations persist across page refreshes
  const [activeProgress, setActiveProgress] = useState<UserProgress | null>(() => {
    try {
      const saved = localStorage.getItem('skill_active_progress');
      if (saved === 'null' || saved === 'cancelled' || saved === 'deleted') {
        return null;
      }
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading active progress from localStorage:', e);
    }
    return null;
  });

  // Keep active progress synced to localStorage
  useEffect(() => {
    try {
      if (activeProgress && activeProgress.status === 'in_progress') {
        localStorage.setItem('skill_active_progress', JSON.stringify(activeProgress));
      } else {
        localStorage.setItem('skill_active_progress', 'null');
      }
    } catch (e) {
      console.error('Error saving active progress to localStorage:', e);
    }
  }, [activeProgress]);

  // Selected Skill for Roadmap view
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill-html');

  // Modals
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isAddTimeModalOpen, setIsAddTimeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Filter state for Discover
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Leaderboard Batch Filter
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('Batch 55');

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<'users' | 'skills' | 'steps'>('users');

  // Profile Setup Form State
  const [setupFullName, setSetupFullName] = useState(currentUser.full_name);
  const [setupDepartment, setSetupDepartment] = useState(currentUser.department);
  const [setupRoll, setSetupRoll] = useState(currentUser.roll_number);
  const [setupBatch, setSetupBatch] = useState(currentUser.batch_number);
  const [setupFb, setSetupFb] = useState(currentUser.fb_link || 'facebook.com/mdsohanali');
  const [setupTelegram, setSetupTelegram] = useState(currentUser.telegram_link || 't.me/sohanali');
  const [setupWhatsapp, setSetupWhatsapp] = useState(currentUser.whatsapp_link || '+8801700000001');
  const [setupAvatarPreview, setSetupAvatarPreview] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Real-time Countdown Timer calculation
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean; percent: number }>({
    days: 1,
    hours: 4,
    minutes: 12,
    seconds: 0,
    isExpired: false,
    percent: 45
  });

  // Success Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync Supabase Auth Session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, overrideEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const emailToCheck = (overrideEmail || data?.email || currentUser.email || '').toLowerCase().trim();
      const isUserAdmin = emailToCheck === ADMIN_EMAIL.toLowerCase();

      if (data && !error) {
        setCurrentUser(prev => ({
          ...prev,
          id: data.id,
          email: emailToCheck || prev.email,
          full_name: data.full_name || prev.full_name,
          department: data.department || prev.department,
          roll_number: data.roll_number || prev.roll_number,
          batch_number: data.batch_number || prev.batch_number,
          fb_link: data.fb_link || prev.fb_link,
          telegram_link: data.telegram_link || prev.telegram_link,
          whatsapp_link: data.whatsapp_link || prev.whatsapp_link,
          profile_completed: data.profile_completed ?? prev.profile_completed,
          points: data.points ?? prev.points,
          current_streak: data.current_streak ?? prev.current_streak,
          is_admin: isUserAdmin,
          is_banned: data.is_banned ?? prev.is_banned
        }));
      }
    } catch {
      // Fallback to offline mock profile
    }
  };

  // Live Timer Tick (Updates every second)
  useEffect(() => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const interval = setInterval(() => {
      const start = new Date(activeProgress.started_at).getTime();
      const deadline = new Date(activeProgress.deadline_at).getTime();
      const now = Date.now();

      const totalDuration = deadline - start;
      const elapsed = now - start;
      const remainingMs = deadline - now;

      if (remainingMs <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          percent: 100
        });
      } else {
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingMs / 1000 / 60) % 60);
        const seconds = Math.floor((remainingMs / 1000) % 60);
        const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
          percent
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeProgress]);

  // Auth Handler: Login / Signup with Supabase
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const isUserAdmin = authEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

    try {
      if (authMode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authName
            }
          }
        });

        const newProfile: Profile = {
          id: data?.user?.id || `user-${Date.now()}`,
          email: authEmail.trim().toLowerCase(),
          full_name: authName.trim(),
          department: 'CSE',
          roll_number: '221-15-5000',
          batch_number: 'Batch 55',
          profile_completed: false,
          points: isUserAdmin ? 380 : 0,
          current_streak: 1,
          longest_streak: 1,
          is_admin: isUserAdmin,
          is_banned: false
        };

        setCurrentUser(newProfile);
        setProfiles(prev => [newProfile, ...prev]);
        setSetupFullName(authName.trim());

        if (error) {
          console.warn('Supabase signup notice:', error.message);
          showToast(`Account created for ${authName}!`);
        } else {
          showToast('Account created successfully! Complete your profile.');
        }
        setCurrentPage('profile-setup');
      } else {
        // Login mode
        const existingProfile = profiles.find(p => p.email?.toLowerCase() === authEmail.trim().toLowerCase());

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });

        if (error) {
          console.warn('Supabase login notice:', error.message);
          // If mock login, find matching profile or create fallback
          if (existingProfile) {
            setCurrentUser({
              ...existingProfile,
              is_admin: isUserAdmin
            });
            showToast(`Welcome back, ${existingProfile.full_name}! ${isUserAdmin ? '(Admin Access)' : ''}`);
          } else {
            const fallbackUser: Profile = {
              id: `user-${Date.now()}`,
              email: authEmail.trim().toLowerCase(),
              full_name: authEmail.split('@')[0],
              department: 'CSE',
              roll_number: '221-15-5000',
              batch_number: 'Batch 55',
              profile_completed: true,
              points: isUserAdmin ? 380 : 50,
              current_streak: 3,
              longest_streak: 5,
              is_admin: isUserAdmin,
              is_banned: false
            };
            setCurrentUser(fallbackUser);
            setProfiles(prev => [fallbackUser, ...prev]);
            showToast(`Welcome back! ${isUserAdmin ? '(Admin Access)' : ''}`);
          }
          setCurrentPage('discover');
        } else {
          if (data.user) {
            await fetchUserProfile(data.user.id, authEmail);
          }
          showToast(`Welcome back! ${isUserAdmin ? '(Admin Access)' : ''}`);
          setCurrentPage('discover');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error. Continuing in demo mode.');
      setCurrentPage('discover');
    } finally {
      setAuthLoading(false);
    }
  };

  // Profile Setup Save Handler (Requires at least ONE social link)
  const handleSaveProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    const hasAtLeastOneSocial = setupFb.trim() || setupTelegram.trim() || setupWhatsapp.trim();

    if (!hasAtLeastOneSocial) {
      setSetupError('At least one contact link (Facebook, Telegram, or WhatsApp) is required to complete profile setup!');
      return;
    }

    const updatedProfile: Profile = {
      ...currentUser,
      full_name: setupFullName.trim() || currentUser.full_name,
      department: setupDepartment.trim() || currentUser.department,
      roll_number: setupRoll.trim() || currentUser.roll_number,
      batch_number: setupBatch.trim() || currentUser.batch_number,
      fb_link: setupFb.trim() || undefined,
      telegram_link: setupTelegram.trim() || undefined,
      whatsapp_link: setupWhatsapp.trim() || undefined,
      profile_completed: true
    };

    setCurrentUser(updatedProfile);

    // Update in profiles list
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedProfile : p));

    // Try Supabase update
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.full_name,
          department: updatedProfile.department,
          roll_number: updatedProfile.roll_number,
          batch_number: updatedProfile.batch_number,
          fb_link: updatedProfile.fb_link,
          telegram_link: updatedProfile.telegram_link,
          whatsapp_link: updatedProfile.whatsapp_link,
          profile_completed: true
        })
        .eq('id', currentUser.id);
    } catch {
      // Offline fallback
    }

    showToast('Profile setup completed successfully!');
    setCurrentPage('discover');
  };

  // Start Skill Challenge Handler
  const handleStartSkill = (days: number, hours: number) => {
    // 1. Check if profile is completed
    if (!currentUser.profile_completed) {
      showToast('Please complete your profile setup before starting a skill challenge!');
      setIsDeadlineModalOpen(false);
      setCurrentPage('profile-setup');
      return;
    }

    // 2. Check if user already has an active challenge in progress
    if (activeProgress && activeProgress.status === 'in_progress') {
      showToast('You already have an active challenge. Finish or wait for it to expire before starting another.');
      setIsDeadlineModalOpen(false);
      setCurrentPage('dashboard');
      return;
    }

    // 3. Calculate deadline_at = current timestamp + (days * 24 + hours) hours
    const targetSkill = skills.find(s => s.id === selectedSkillId) || skills[0];
    const startedAt = new Date();
    const totalDurationHours = Math.max(1, days * 24 + hours);
    const durationMs = totalDurationHours * 60 * 60 * 1000;
    const deadlineAt = new Date(startedAt.getTime() + durationMs);

    // 4. Insert new user progress row
    const newProgress: UserProgress = {
      id: `progress-${Date.now()}`,
      user_id: currentUser.id,
      skill_id: targetSkill.id,
      started_at: startedAt.toISOString(),
      deadline_at: deadlineAt.toISOString(),
      status: 'in_progress',
      points_awarded: 10,
      skill: targetSkill,
      steps_completed: []
    };

    setActiveProgress(newProgress);
    setIsDeadlineModalOpen(false);
    showToast(`Started ${targetSkill.name} challenge! Deadline: ${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h` : ''}`);
    
    // 5. Redirect to Dashboard with live countdown
    setCurrentPage('dashboard');

    // Sync with Supabase user_progress table
    try {
      supabase.from('user_progress').insert({
        user_id: currentUser.id,
        skill_id: targetSkill.id,
        started_at: startedAt.toISOString(),
        deadline_at: deadlineAt.toISOString(),
        status: 'in_progress',
        points_awarded: 10
      });
    } catch {
      // Handled locally
    }
  };

  // Add Extra Time to Active Challenge
  const handleAddExtraTime = (extraDays: number, extraHours: number) => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const currentDeadline = new Date(activeProgress.deadline_at);
    const extraMs = (extraDays * 24 + extraHours) * 60 * 60 * 1000;
    const newDeadline = new Date(currentDeadline.getTime() + extraMs);

    const updatedProgress: UserProgress = {
      ...activeProgress,
      deadline_at: newDeadline.toISOString()
    };

    setActiveProgress(updatedProgress);
    showToast(`Added ${extraDays > 0 ? `${extraDays}d ` : ''}${extraHours > 0 ? `${extraHours}h` : ''} to your active challenge!`);

    try {
      supabase.from('user_progress').update({
        deadline_at: newDeadline.toISOString()
      }).eq('id', activeProgress.id);
    } catch {
      // Handled locally
    }
  };

  // Cancel Active Challenge Handler (Fully deletes row, no points deducted)
  const handleCancelChallenge = async () => {
    if (!activeProgress) return;
    const progressId = activeProgress.id;
    const targetSkill = skills.find(s => s.id === activeProgress.skill_id);
    const skillName = targetSkill?.name || 'Skill';

    // 1. Delete from local state and localStorage immediately
    setActiveProgress(null);
    try {
      localStorage.setItem('skill_active_progress', 'null');
      localStorage.removeItem('skill_active_progress');
    } catch (e) {
      console.error(e);
    }
    setIsCancelModalOpen(false);
    showToast(`Challenge for ${skillName} has been cancelled.`);

    // 2. Delete row from Supabase user_progress (no failed records kept, no points deducted)
    try {
      await supabase.from('user_progress').delete().eq('id', progressId);
    } catch (err) {
      console.error('Failed to delete progress row:', err);
    }
  };

  // Complete Active Challenge
  const handleCompleteActiveChallenge = () => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const skill = skills.find(s => s.id === activeProgress.skill_id) || skills[0];
    const completedAt = new Date().toISOString();
    const awarded = 10;

    // Clear active challenge
    const previousProgressId = activeProgress.id;
    setActiveProgress(null);
    try {
      localStorage.setItem('skill_active_progress', 'null');
      localStorage.removeItem('skill_active_progress');
    } catch (e) {
      console.error(e);
    }

    // Update user points and streak
    const newPoints = currentUser.points + awarded;
    const newStreak = currentUser.current_streak + 1;
    const updatedUser = {
      ...currentUser,
      points: newPoints,
      current_streak: newStreak
    };
    setCurrentUser(updatedUser);

    // Update profile in list
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));

    // Add to completed skills list
    setCompletedSkillsMap(prev => ({
      ...prev,
      [currentUser.id]: [
        {
          skillName: skill.name,
          icon: skill.icon || 'S',
          bg: skill.bg_color || '#6c5ce7',
          duration: `Finished on time (+10 pts)`,
          completedAt: 'Just now'
        },
        ...(prev[currentUser.id] || [])
      ]
    }));

    // Check Badges Unlock
    setBadges(prev => prev.map(b => {
      if (b.id === 'badge-3' && (completedSkillsMap[currentUser.id]?.length || 0) + 1 >= 5) {
        return { ...b, unlocked: true, icon_symbol: '📚' };
      }
      if (b.id === 'badge-6' && newPoints >= 300) {
        return { ...b, unlocked: true };
      }
      return b;
    }));

    showToast(`🎉 Congratulations! You completed ${skill.name} and earned +${awarded} points!`);

    // Sync with Supabase
    try {
      supabase.from('user_progress').update({
        status: 'completed',
        completed_at: completedAt
      }).eq('id', previousProgressId);

      supabase.from('profiles').update({
        points: newPoints,
        current_streak: newStreak
      }).eq('id', currentUser.id);
    } catch {
      // Handled
    }
  };

  // Toggle step completion in active challenge
  const handleToggleStep = (stepOrder: number) => {
    if (!activeProgress) return;
    const currentSteps = activeProgress.steps_completed || [];
    const newSteps = currentSteps.includes(stepOrder)
      ? currentSteps.filter(s => s !== stepOrder)
      : [...currentSteps, stepOrder];

    setActiveProgress({
      ...activeProgress,
      steps_completed: newSteps
    });
  };

  // Active Skill Object
  const currentSkill = useMemo(() => {
    return skills.find(s => s.id === selectedSkillId) || skills[0];
  }, [skills, selectedSkillId]);

  // Current Skill Steps
  const currentSkillSteps = useMemo(() => {
    return roadmapSteps[selectedSkillId] || [];
  }, [roadmapSteps, selectedSkillId]);

  // Selected Field object
  const selectedField = useMemo(() => {
    return fields.find(f => f.id === selectedFieldId) || fields[0];
  }, [fields, selectedFieldId]);

  // Skills belonging to selected Field
  const skillsInSelectedField = useMemo(() => {
    if (!selectedFieldId) return [];
    return skills.filter(s => s.field_id === selectedFieldId);
  }, [skills, selectedFieldId]);

  // All skills filtered by search query
  const allSearchedSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    const q = searchQuery.toLowerCase().trim();
    return skills.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q)
    );
  }, [skills, searchQuery]);

  // Popular skills for main Discover page (top learner count / curated picks)
  const popularSkills = useMemo(() => {
    return [...skills].sort((a, b) => (b.learner_count || 0) - (a.learner_count || 0)).slice(0, 8);
  }, [skills]);

  // Leaderboard Sorted Profiles
  const filteredLeaderboardProfiles = useMemo(() => {
    let list = [...profiles];
    if (selectedBatchFilter !== 'All departments') {
      list = list.filter(p => p.batch_number === selectedBatchFilter);
    }
    return list.sort((a, b) => b.points - a.points);
  }, [profiles, selectedBatchFilter]);

  // Top 3 Podium
  const top1 = filteredLeaderboardProfiles[0];
  const top2 = filteredLeaderboardProfiles[1];
  const top3 = filteredLeaderboardProfiles[2];

  // Admin Actions
  const handleBanToggle = (userId: string) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === userId) {
        const updated = { ...p, is_banned: !p.is_banned };
        showToast(`${p.full_name} is now ${updated.is_banned ? 'Banned' : 'Active'}`);
        return updated;
      }
      return p;
    }));
  };

  const handleSaveSkill = (skillData: Partial<Skill>) => {
    if (editingSkill) {
      setSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...skillData } as Skill : s));
      showToast(`Updated skill ${skillData.name}`);
    } else {
      const newSkill: Skill = {
        id: skillData.id || `skill-${Date.now()}`,
        name: skillData.name || 'New Skill',
        description: skillData.description || '',
        order_index: skills.length + 1,
        icon: skillData.icon || 'S',
        bg_color: skillData.bg_color || '#6c5ce7',
        difficulty: skillData.difficulty || 'Beginner',
        avg_days: skillData.avg_days || '3 days',
        learner_count: 1,
        step_count: 1
      };
      setSkills(prev => [...prev, newSkill]);
      setRoadmapSteps(prev => ({
        ...prev,
        [newSkill.id]: [
          {
            id: `step-${newSkill.id}-1`,
            skill_id: newSkill.id,
            title: 'Getting Started',
            description: 'Fundamental setup, documentation review, and core syntax',
            step_order: 1
          }
        ]
      }));
      showToast(`Added new skill track ${newSkill.name}`);
    }
    setEditingSkill(null);
  };

  const handleDeleteSkill = (skillId: string) => {
    setSkills(prev => prev.filter(s => s.id !== skillId));
    showToast('Skill deleted');
  };

  const handleAddStep = (stepData: Partial<RoadmapStep>) => {
    const newStep: RoadmapStep = {
      id: stepData.id || `step-${Date.now()}`,
      skill_id: stepData.skill_id!,
      title: stepData.title || 'New Step',
      description: stepData.description || '',
      step_order: stepData.step_order || 1,
      resource_link: stepData.resource_link
    };
    setRoadmapSteps(prev => ({
      ...prev,
      [stepData.skill_id!]: [...(prev[stepData.skill_id!] || []), newStep]
    }));
    showToast(`Added step to roadmap`);
  };

  const handleDeleteStep = (skillId: string, stepId: string) => {
    setRoadmapSteps(prev => ({
      ...prev,
      [skillId]: prev[skillId].filter(s => s.id !== stepId)
    }));
    showToast('Step removed');
  };

  // Helper to open public profile
  const handleOpenUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentPage('profile');
  };

  // Selected Profile Data
  const targetProfile = profiles.find(p => p.id === selectedUserId) || currentUser;
  const targetUserCompletedSkills = completedSkillsMap[targetProfile.id] || [];

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-12 relative selection:bg-[#6c5ce7] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#1a1c2e] text-white border border-[#37f0ff]/40 shadow-2xl px-5 py-3 rounded-2xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#37f0ff]" />
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTICATION: LOGIN & SIGNUP (SAME PAGE WITH SMOOTH TOGGLE & GLOW) */}
      {/* ========================================================================= */}
      {(currentPage === 'login' || currentPage === 'signup') && (
        <div className="dark-page" id="page-auth">
          <div className="page-tag" style={{ background: '#37f0ff', color: '#03040a' }}>
            PAGE 1 &amp; 2 — {authMode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </div>
          <div className="bg-glow"></div>
          
          <div className={`stage ${authMode === 'signup' ? 'swap-mode' : ''}`} id="auth-stage-container">
            
            {/* Visual Panel with Rotating Blurred Blob */}
            <div className="visual" id="auth-visual-panel">
              <div className="visual-blob"></div>
              <div className="brand">
                <div className="logo-badge">S</div>
                <h1>{authMode === 'login' ? 'Welcome back' : 'Join SkillTrack'}</h1>
                <p>
                  {authMode === 'login' 
                    ? 'Sign in to continue tracking your skills and climb the leaderboard.' 
                    : 'Create your account and start racing the clock on your next skill.'}
                </p>
              </div>
            </div>

            {/* Form Panel */}
            <div className="formside" id="auth-form-panel">
              <div>
                <div className="toggle-title">SkillTrack DIU</div>
                <h2>{authMode === 'login' ? 'Log in' : 'Create account'}</h2>

                {authError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit}>
                  {authMode === 'signup' && (
                    <div className="dark-field" id="field-full-name">
                      <span className="flabel">FULL NAME</span>
                      <input 
                        type="text"
                        className="finput"
                        placeholder="e.g. Rakib Hassan"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                        id="input-auth-name"
                      />
                    </div>
                  )}

                  <div className="dark-field" id="field-email-address">
                    <span className="flabel">EMAIL ADDRESS</span>
                    <input 
                      type="email"
                      className="finput"
                      placeholder="e.g. rakib.cse@diu.edu.bd"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      id="input-auth-email"
                    />
                  </div>

                  <div className="dark-field" id="field-password">
                    <span className="flabel">PASSWORD</span>
                    <input 
                      type="password"
                      className="finput"
                      placeholder="••••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      id="input-auth-password"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="dark-btn"
                    disabled={authLoading}
                    id="auth-submit-btn"
                  >
                    {authLoading 
                      ? 'Connecting...' 
                      : authMode === 'login' ? 'Log in' : 'Create account'}
                  </button>
                </form>

                <div 
                  className="dark-switch select-none"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    setAuthError(null);
                  }}
                  id="auth-toggle-text-btn"
                >
                  {authMode === 'login' ? (
                    <>New here? <b>Create an account</b></>
                  ) : (
                    <>Already have an account? <b>Log in</b></>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NAVBAR (VISIBLE ON ALL INTERNAL PAGES) */}
      {/* ========================================================================= */}
      {currentPage !== 'login' && currentPage !== 'signup' && (
        <Navbar 
          currentPage={currentPage}
          setCurrentPage={(page) => {
            setCurrentPage(page);
            if (page === 'discover') {
              setDiscoverView('main');
            }
          }}
          currentUser={currentUser}
          onSignOut={() => {
            supabase.auth.signOut();
            setCurrentPage('login');
            showToast('Signed out successfully.');
          }}
          onSelectUserForProfile={handleOpenUserProfile}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 3 — PROFILE SETUP */}
      {/* ========================================================================= */}
      {currentPage === 'profile-setup' && (
        <div className="page" id="page-profile-setup">
          <div className="page-tag">PAGE 3 — PROFILE SETUP</div>

          <div className="content pt-4 sm:pt-8 md:pt-10">
            
            {/* Segmented Progress Bar */}
            <div className="setup-progress max-w-[640px] mx-auto mb-6">
              <div className="seg done"></div>
              <div className="seg done"></div>
              <div className="seg"></div>
            </div>

            <div className="setup-card">
              <div className="setup-heading">Set up your profile</div>
              <div className="setup-sub">This helps others find and recognize you on the leaderboard</div>

              {setupError && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfileSetup}>
                
                {/* Avatar upload */}
                <label 
                  htmlFor="avatar-file-input"
                  className="avatar-upload cursor-pointer hover:bg-[#e8e4fe] transition-colors relative overflow-hidden group"
                  title="Click to upload profile photo"
                >
                  {setupAvatarPreview ? (
                    <img src={setupAvatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-4 h-4 mb-1" />
                      <span>Upload<br />photo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="avatar-file-input" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setSetupAvatarPreview(reader.result as string);
                        reader.readAsDataURL(file);
                        showToast('Photo uploaded!');
                      }
                    }}
                  />
                </label>

                <label className="field-label">Full name</label>
                <input 
                  type="text" 
                  className="field-input" 
                  value={setupFullName}
                  onChange={(e) => setSetupFullName(e.target.value)}
                  placeholder="e.g. Rakib Hassan"
                  required
                />

                <div className="row2">
                  <div>
                    <label className="field-label">Department</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={setupDepartment}
                      onChange={(e) => setSetupDepartment(e.target.value)}
                      placeholder="e.g. CSE"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">Roll / ID number</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={setupRoll}
                      onChange={(e) => setSetupRoll(e.target.value)}
                      placeholder="e.g. 221-15-4521"
                      required
                    />
                  </div>
                </div>

                <label className="field-label">Batch number</label>
                <input 
                  type="text" 
                  className="field-input" 
                  value={setupBatch}
                  onChange={(e) => setSetupBatch(e.target.value)}
                  placeholder="e.g. Batch 55"
                  required
                />

                <label className="field-label" style={{ marginTop: '4px' }}>
                  Contact link (at least one required)
                </label>

                {/* Facebook */}
                <div className="social-box">
                  <div className="social-icon" style={{ background: '#3b5998' }}>f</div>
                  <input 
                    type="text" 
                    className="w-full bg-transparent outline-none text-[13px] text-[#1a1c2e]" 
                    placeholder="facebook.com/your.username"
                    value={setupFb}
                    onChange={(e) => setSetupFb(e.target.value)}
                  />
                </div>

                {/* Telegram */}
                <div className="social-box">
                  <div className="social-icon" style={{ background: '#0088cc' }}>T</div>
                  <input 
                    type="text" 
                    className="w-full bg-transparent outline-none text-[13px] text-[#1a1c2e]" 
                    placeholder="t.me/your_telegram (optional)"
                    value={setupTelegram}
                    onChange={(e) => setSetupTelegram(e.target.value)}
                  />
                </div>

                {/* WhatsApp */}
                <div className="social-box">
                  <div className="social-icon" style={{ background: '#25d366' }}>W</div>
                  <input 
                    type="text" 
                    className="w-full bg-transparent outline-none text-[13px] text-[#1a1c2e]" 
                    placeholder="+88017... WhatsApp number (optional)"
                    value={setupWhatsapp}
                    onChange={(e) => setSetupWhatsapp(e.target.value)}
                  />
                </div>

                <div className="social-note">
                  At least one of Facebook, Telegram, or WhatsApp is required to complete setup — this is how batchmates connect with you for study help.
                </div>

                <div className="btn-row">
                  <button 
                    type="button"
                    className="btn-ghost cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      showToast('Browsing in guest mode. Note: Profile setup required to start skill challenges.');
                      setCurrentPage('discover');
                    }}
                    id="btn-skip-setup"
                  >
                    Skip for now
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary flex1 cursor-pointer hover:opacity-90 transition-opacity"
                    id="btn-complete-setup"
                  >
                    Complete setup
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4 — DISCOVER (HOME) */}
      {/* ========================================================================= */}
      {currentPage === 'discover' && (
        <div className="page" id="page-discover">
          <div className="page-tag">PAGE 4 — DISCOVER</div>

          <div className="content">
            
            {/* ================================================================= */}
            {/* DISCOVER VIEW: MAIN (EXPLORE OVERVIEW) */}
            {/* ================================================================= */}
            {discoverView === 'main' && (
              <>
                {/* Hero Banner */}
                <div className="hero-banner">
                  <div>
                    <div style={{ fontSize: '13px', opacity: 0.85 }}>Welcome back</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>
                      {currentUser.full_name.split(' ')[0]}, ready to level up?
                    </div>
                  </div>
                  <div className="hero-stats">
                    <div className="stat">
                      <b>{currentUser.points}</b>
                      <span>points</span>
                    </div>
                    <div className="stat">
                      <b>{currentUser.current_streak}</b>
                      <span>day streak</span>
                    </div>
                    <div className="stat">
                      <b>#3</b>
                      <span>in batch</span>
                    </div>
                  </div>
                </div>

                {/* Incomplete profile warning reminder if skipped */}
                {!currentUser.profile_completed && (
                  <div className="mb-6 p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-900">Your profile is incomplete</div>
                        <div className="text-[11px] text-amber-700">Complete setup to unlock starting challenges and earn leaderboard points.</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentPage('profile-setup')}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors whitespace-nowrap text-center cursor-pointer"
                    >
                      Finish Setup →
                    </button>
                  </div>
                )}

                {/* Active Challenge Card (Rendered only when activeProgress is in_progress) */}
                {activeProgress && activeProgress.status === 'in_progress' && (() => {
                  const activeSkill = skills.find(s => s.id === activeProgress.skill_id) || skills[0];
                  const steps = roadmapSteps[activeProgress.skill_id] || [];
                  const completedStepCount = (activeProgress.steps_completed || []).length;
                  const totalStepCount = steps.length;

                  return (
                    <div 
                      className="mb-8 bg-gradient-to-br from-[#161828] via-[#222646] to-[#161828] text-white border-2 border-[#37f0ff]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300"
                      id="discover-active-challenge-card"
                    >
                      {/* Background decorative glow */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-[#6c5ce7]/25 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
                      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#37f0ff]/20 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24"></div>

                      <div className="relative z-10 flex flex-col gap-6">
                        {/* Header: Skill Name, Status Badge, and Points info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl shrink-0 border-2 border-white/20"
                              style={{ background: activeSkill.bg_color || '#6c5ce7' }}
                            >
                              {activeSkill.icon || activeSkill.name.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-full bg-[#37f0ff]/20 text-[#37f0ff] border border-[#37f0ff]/50 shadow-xs">
                                  Active Challenge
                                </span>
                                <span className="text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-1.5 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-300/30">
                                  <Trophy className="w-4 h-4" /> +10 pts on finish
                                </span>
                              </div>
                              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-tight tracking-tight">
                                {activeSkill.name} Challenge
                              </h3>
                            </div>
                          </div>

                          {/* Quick Add Time & Dashboard jump */}
                          <div className="flex items-center gap-2.5 self-start sm:self-center">
                            <button
                              onClick={() => setIsAddTimeModalOpen(true)}
                              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-102"
                              id="btn-discover-add-time"
                              title="Add more time"
                            >
                              <Plus className="w-4 h-4 text-[#37f0ff]" />
                              Add Time
                            </button>
                            <button
                              onClick={() => setCurrentPage('dashboard')}
                              className="px-4 py-2.5 bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-102"
                              id="btn-discover-goto-dashboard"
                            >
                              Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Live Countdown & Progress Bar */}
                        <div className="bg-black/40 border border-white/15 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col gap-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80">
                              <Clock className="w-4 h-4 text-[#37f0ff]" /> Time Remaining
                            </div>
                            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                              {timeRemaining.isExpired ? (
                                <span className="text-red-400">Deadline reached!</span>
                              ) : (
                                `${timeRemaining.days}d ${String(timeRemaining.hours).padStart(2, '0')}h ${String(timeRemaining.minutes).padStart(2, '0')}m ${String(timeRemaining.seconds).padStart(2, '0')}s left`
                              )}
                            </div>
                          </div>

                          {/* Dynamic Progress Bar */}
                          <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden p-0.5">
                            <div 
                              className="bg-gradient-to-r from-[#37f0ff] via-[#806af5] to-[#6c5ce7] h-full rounded-full transition-all duration-1000 shadow-md"
                              style={{ width: `${timeRemaining.percent}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm text-white/70 font-semibold">
                            <span>Elapsed: {timeRemaining.percent}%</span>
                            <span>Completed: {completedStepCount}/{totalStepCount} milestones</span>
                          </div>
                        </div>

                        {/* Roadmap Steps Checklist */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/90">
                              Roadmap Milestones &amp; Checklist
                            </span>
                            <span className="text-xs text-[#37f0ff] font-semibold">
                              Click any step to mark complete
                            </span>
                          </div>

                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {steps.length > 0 ? (
                              steps.map((st, idx) => {
                                const isDone = (activeProgress.steps_completed || []).includes(st.step_order);
                                return (
                                  <div 
                                    key={st.id}
                                    onClick={() => handleToggleStep(st.step_order)}
                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                                      isDone 
                                        ? 'bg-emerald-500/20 border-emerald-400/50 text-white font-bold shadow-sm' 
                                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0 font-black ${
                                        isDone 
                                          ? 'bg-emerald-400 text-[#1a1c2e] border-emerald-400 shadow-sm' 
                                          : 'border-white/40 text-white/80'
                                      }`}>
                                        {isDone ? '✓' : idx + 1}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-sm sm:text-base font-bold text-white leading-snug truncate">
                                          {st.title}
                                        </div>
                                        {st.description && (
                                          <div className="text-xs sm:text-sm text-white/70 mt-0.5 line-clamp-1">
                                            {st.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <span className={`text-xs font-black px-3 py-1 rounded-xl shrink-0 uppercase tracking-wider ${
                                      isDone ? 'bg-emerald-400 text-[#1a1c2e] shadow-xs' : 'bg-white/10 text-white/70'
                                    }`}>
                                      {isDone ? 'Done' : 'Pending'}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-sm text-white/60 italic py-2">No steps listed for this roadmap.</div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions: Cancel challenge and Mark complete */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/15">
                          {/* Cancel Challenge Button */}
                          <button
                            type="button"
                            onClick={() => setIsCancelModalOpen(true)}
                            className="w-full sm:w-auto px-5 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 border-2 border-red-500/40 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                            id="btn-cancel-challenge-discover"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                            Cancel challenge
                          </button>

                          {/* Complete Challenge Button */}
                          <button
                            type="button"
                            onClick={handleCompleteActiveChallenge}
                            className="w-full sm:w-auto px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-[#1a1c2e] font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
                            id="btn-complete-challenge-discover"
                          >
                            <CheckCircle2 className="w-5 h-5 text-[#1a1c2e]" />
                            Mark as complete (+10 pts)
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* How do you want to explore? */}
                <div className="section-title">How do you want to explore?</div>
                <div className="choice-grid">
                  
                  {/* Choice 1: Browse by field */}
                  <div 
                    className="choice-card c1 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
                    onClick={() => {
                      setDiscoverView('fields');
                    }}
                    id="card-choice-field"
                  >
                    <div className="icon-badge">💼</div>
                    <h3>Browse by field</h3>
                    <p>Web Development, Cyber Security, Software Engineering and more</p>
                  </div>

                  {/* Choice 2: Browse by skill */}
                  <div 
                    className="choice-card c2 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
                    onClick={() => {
                      setDiscoverView('all-skills');
                    }}
                    id="card-choice-skill"
                  >
                    <div className="icon-badge">⚡</div>
                    <h3>Browse by skill</h3>
                    <p>Pick a single skill like HTML, C, or Python and start today</p>
                  </div>
                </div>

                {/* Popular this week Section (Unchanged, no pill filters above) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-1">
                  <div className="section-title mb-0">Popular this week</div>
                  <span className="text-xs text-[#8a8ca3] font-medium">Click any skill to view roadmap</span>
                </div>

                <div className="skill-grid">
                  {popularSkills.map((skill) => (
                    <div 
                      key={skill.id}
                      className="skill-card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group border border-transparent hover:border-[#6c5ce7]/30 flex flex-col justify-between"
                      onClick={() => {
                        setSelectedSkillId(skill.id);
                        setCurrentPage('roadmap');
                      }}
                      id={`skill-card-${skill.id}`}
                    >
                      <div>
                        <div className="icon" style={{ background: skill.bg_color || '#6c5ce7' }}>
                          {skill.icon || skill.name.slice(0, 2)}
                        </div>
                        <h4 className="group-hover:text-[#6c5ce7] transition-colors">{skill.name}</h4>
                        <p className="line-clamp-2 mb-2">{skill.description}</p>
                      </div>
                      <div className="text-[11px] text-[#8a8ca3] pt-2 border-t border-[#f0f1f6] flex items-center justify-between font-medium">
                        <span>{roadmapSteps[skill.id]?.length || skill.step_count || 3} steps</span>
                        <span className="text-[#6c5ce7] font-semibold">{skill.learner_count || 24} learners</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ================================================================= */}
            {/* DISCOVER VIEW: BROWSE BY FIELD — STEP 1 (ALL FIELDS GRID) */}
            {/* ================================================================= */}
            {discoverView === 'fields' && (
              <div>
                {/* Back to Discover link */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <button 
                    onClick={() => setDiscoverView('main')}
                    className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold flex items-center gap-1.5 transition-colors group cursor-pointer"
                    id="btn-back-to-discover-from-fields"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Discover
                  </button>
                  <div className="text-xs font-medium text-[#8a8ca3] flex items-center gap-1.5">
                    <span className="hover:underline cursor-pointer" onClick={() => setDiscoverView('main')}>Discover</span>
                    <span>/</span>
                    <span className="font-bold text-[#1a1c2e]">Browse by Field</span>
                  </div>
                </div>

                {/* View Header */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1c2e] tracking-tight">Browse by Field</h2>
                  <p className="text-xs sm:text-sm text-[#8a8ca3] mt-1">
                    Select an engineering field to view all specialized learning tracks and roadmaps.
                  </p>
                </div>

                {/* All Fields as Large Cards (Matching Popular Skill Cards Style) */}
                <div className="skill-grid">
                  {fields.map((field) => {
                    const fieldSkills = skills.filter(s => s.field_id === field.id);
                    return (
                      <div 
                        key={field.id}
                        className="skill-card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group border border-transparent hover:border-[#6c5ce7]/30 flex flex-col justify-between"
                        onClick={() => {
                          setSelectedFieldId(field.id);
                          setDiscoverView('field-skills');
                        }}
                        id={`field-card-${field.id}`}
                      >
                        <div>
                          <div className="icon shadow-sm" style={{ background: field.color || '#6c5ce7' }}>
                            {field.icon}
                          </div>
                          <h4 className="group-hover:text-[#6c5ce7] transition-colors flex items-center justify-between">
                            <span>{field.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#8a8ca3] group-hover:text-[#6c5ce7] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                          </h4>
                          <p className="line-clamp-2 mb-3">{field.description}</p>
                        </div>
                        <div className="text-[11px] text-[#8a8ca3] pt-2 border-t border-[#f0f1f6] flex items-center justify-between font-medium">
                          <span className="text-[#6c5ce7] font-bold bg-[#f1eefe] px-2 py-0.5 rounded-full">
                            {fieldSkills.length} {fieldSkills.length === 1 ? 'skill' : 'skills'}
                          </span>
                          <span className="group-hover:text-[#1a1c2e] transition-colors">Explore track →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* DISCOVER VIEW: BROWSE BY FIELD — STEP 2 (SKILLS WITHIN SELECTED FIELD) */}
            {/* ================================================================= */}
            {discoverView === 'field-skills' && (
              <div>
                {/* Back to fields Breadcrumb & Button */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <button 
                    onClick={() => setDiscoverView('fields')}
                    className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold flex items-center gap-1.5 transition-colors group cursor-pointer"
                    id="btn-back-to-fields"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to fields
                  </button>
                  <div className="text-xs font-medium text-[#8a8ca3] flex items-center gap-1.5">
                    <span className="hover:underline cursor-pointer" onClick={() => setDiscoverView('main')}>Discover</span>
                    <span>/</span>
                    <span className="hover:underline cursor-pointer" onClick={() => setDiscoverView('fields')}>Fields</span>
                    <span>/</span>
                    <span className="font-bold text-[#1a1c2e]">{selectedField?.name}</span>
                  </div>
                </div>

                {/* Field Overview Banner */}
                <div className="hero-banner mb-6" style={{ background: selectedField?.color ? `linear-gradient(120deg, ${selectedField.color}, #a29bfe)` : undefined }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {selectedField?.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>Domain Track</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '2px' }}>{selectedField?.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{selectedField?.description}</div>
                    </div>
                  </div>
                  <div className="hero-stats">
                    <div className="stat">
                      <b>{skillsInSelectedField.length}</b>
                      <span>roadmaps</span>
                    </div>
                  </div>
                </div>

                {/* Section title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-1">
                  <div className="section-title mb-0">Skills in {selectedField?.name}</div>
                  <span className="text-xs text-[#8a8ca3] font-medium">Click any skill to view roadmap</span>
                </div>

                {/* Large Card Grid of Skills in this Field */}
                {skillsInSelectedField.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-[#e4e5ee] shadow-sm">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="font-bold text-sm text-[#1a1c2e]">No roadmaps yet in this field</div>
                    <div className="text-xs text-[#8a8ca3] mt-1">Admin will publish new skill tracks soon.</div>
                  </div>
                ) : (
                  <div className="skill-grid">
                    {skillsInSelectedField.map((skill) => (
                      <div 
                        key={skill.id}
                        className="skill-card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group border border-transparent hover:border-[#6c5ce7]/30 flex flex-col justify-between"
                        onClick={() => {
                          setSelectedSkillId(skill.id);
                          setCurrentPage('roadmap');
                        }}
                        id={`skill-card-field-${skill.id}`}
                      >
                        <div>
                          <div className="icon" style={{ background: skill.bg_color || '#6c5ce7' }}>
                            {skill.icon || skill.name.slice(0, 2)}
                          </div>
                          <h4 className="group-hover:text-[#6c5ce7] transition-colors">{skill.name}</h4>
                          <p className="line-clamp-2 mb-2">{skill.description}</p>
                        </div>
                        <div className="text-[11px] text-[#8a8ca3] pt-2 border-t border-[#f0f1f6] flex items-center justify-between font-medium">
                          <span>{roadmapSteps[skill.id]?.length || skill.step_count || 3} steps</span>
                          <span className="text-[#6c5ce7] font-semibold">{skill.learner_count || 24} learners</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* DISCOVER VIEW: BROWSE BY SKILL (ALL INDIVIDUAL SKILLS GRID) */}
            {/* ================================================================= */}
            {discoverView === 'all-skills' && (
              <div>
                {/* Back to Discover Breadcrumb & Button */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <button 
                    onClick={() => setDiscoverView('main')}
                    className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold flex items-center gap-1.5 transition-colors group cursor-pointer"
                    id="btn-back-to-discover-from-skills"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Discover
                  </button>
                  <div className="text-xs font-medium text-[#8a8ca3] flex items-center gap-1.5">
                    <span className="hover:underline cursor-pointer" onClick={() => setDiscoverView('main')}>Discover</span>
                    <span>/</span>
                    <span className="font-bold text-[#1a1c2e]">Browse by Skill</span>
                  </div>
                </div>

                {/* View Header & Real-time Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1c2e] tracking-tight">Browse by Skill</h2>
                    <p className="text-xs sm:text-sm text-[#8a8ca3] mt-0.5">
                      Explore all {skills.length} individual skills across all fields. Select any skill to view its roadmap.
                    </p>
                  </div>
                  {/* Search Bar */}
                  <div className="relative min-w-[240px] max-w-sm w-full sm:w-auto">
                    <Search className="w-4 h-4 text-[#8a8ca3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search skills (e.g. React, C, Python)..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[#e4e5ee] rounded-xl text-xs text-[#1a1c2e] focus:outline-none focus:border-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* All Individual Skills Grid */}
                {allSearchedSkills.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-[#e4e5ee] shadow-sm">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-bold text-sm text-[#1a1c2e]">No skills match "{searchQuery}"</div>
                    <div className="text-xs text-[#8a8ca3] mt-1">Try searching for something else or clear the search.</div>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-3 px-4 py-1.5 bg-[#6c5ce7] text-white rounded-lg text-xs font-bold hover:bg-[#5b4cc4] transition-colors cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="skill-grid">
                    {allSearchedSkills.map((skill) => {
                      const fieldOfSkill = fields.find(f => f.id === skill.field_id);
                      return (
                        <div 
                          key={skill.id}
                          className="skill-card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group border border-transparent hover:border-[#6c5ce7]/30 flex flex-col justify-between"
                          onClick={() => {
                            setSelectedSkillId(skill.id);
                            setCurrentPage('roadmap');
                          }}
                          id={`skill-card-all-${skill.id}`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="icon" style={{ background: skill.bg_color || '#6c5ce7' }}>
                                {skill.icon || skill.name.slice(0, 2)}
                              </div>
                              {fieldOfSkill && (
                                <span className="text-[10px] font-bold text-[#6c5ce7] bg-[#f1eefe] px-2 py-0.5 rounded-full truncate max-w-[120px]">
                                  {fieldOfSkill.name}
                                </span>
                              )}
                            </div>
                            <h4 className="group-hover:text-[#6c5ce7] transition-colors">{skill.name}</h4>
                            <p className="line-clamp-2 mb-2">{skill.description}</p>
                          </div>
                          <div className="text-[11px] text-[#8a8ca3] pt-2 border-t border-[#f0f1f6] flex items-center justify-between font-medium">
                            <span>{roadmapSteps[skill.id]?.length || skill.step_count || 3} steps</span>
                            <span className="text-[#6c5ce7] font-semibold">{skill.learner_count || 24} learners</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 5 — ROADMAP */}
      {/* ========================================================================= */}
      {currentPage === 'roadmap' && (
        <div className="page" id="page-roadmap">
          <div className="page-tag">PAGE 5 — ROADMAP</div>

          <div className="content">
            
            {/* Back button */}
            <button 
              onClick={() => setCurrentPage('discover')}
              className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold mb-4 flex items-center gap-1.5 transition-colors cursor-pointer group"
              id="btn-roadmap-back"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              {discoverView === 'field-skills' && selectedField 
                ? `Back to ${selectedField.name} Roadmaps` 
                : discoverView === 'all-skills'
                ? 'Back to All Skills'
                : 'Back to Discover'}
            </button>

            {/* Roadmap Header */}
            <div className="roadmap-head">
              <div 
                className="roadmap-icon shadow-md"
                style={{ background: currentSkill.bg_color || 'linear-gradient(135deg,#6c5ce7,#a29bfe)' }}
              >
                {currentSkill.icon || currentSkill.name.slice(0, 2)}
              </div>
              <div>
                <div className="roadmap-title">{currentSkill.name} roadmap</div>
                <div className="roadmap-meta">
                  {currentSkillSteps.length} steps · {currentSkill.difficulty || 'beginner friendly'} · avg. completion {currentSkill.avg_days || '2 days'}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="timeline">
              {currentSkillSteps.map((step, idx) => {
                const isLast = idx === currentSkillSteps.length - 1;
                return (
                  <div key={step.id} className="tl-step">
                    <div className="tl-marker-col">
                      <div className="tl-num">{step.step_order || idx + 1}</div>
                      {!isLast && <div className="tl-line"></div>}
                    </div>
                    <div className="tl-body">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                      {step.resource_link && (
                        <a 
                          href={step.resource_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#6c5ce7] font-semibold mt-1.5 hover:underline"
                        >
                          Official Docs / Study Guide <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              <div 
                className="start-btn cursor-pointer hover:opacity-95 hover:shadow-lg transition-all select-none inline-flex items-center gap-2"
                onClick={() => {
                  if (!currentUser.profile_completed) {
                    showToast('Please complete your profile setup before starting a skill challenge!');
                    setCurrentPage('profile-setup');
                    return;
                  }
                  if (activeProgress && activeProgress.status === 'in_progress') {
                    showToast('You already have an active challenge. Finish or wait for it to expire before starting another.');
                    setCurrentPage('dashboard');
                    return;
                  }
                  setIsDeadlineModalOpen(true);
                }}
                id="btn-start-skill-roadmap"
              >
                Start this skill →
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 6 — DASHBOARD */}
      {/* ========================================================================= */}
      {currentPage === 'dashboard' && (
        <div className="page" id="page-dashboard">
          <div className="page-tag">PAGE 6 — DASHBOARD</div>

          <div className="content">
            <div className="dash-grid">
              
              {/* Left Column: Active Challenge & Stats */}
              <div>
                
                {/* Active Challenge Card */}
                {activeProgress && activeProgress.status === 'in_progress' ? (
                  <div className="bg-gradient-to-br from-[#fdcb6e] via-[#f39c12] to-[#e17055] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {(skills.find(s => s.id === activeProgress.skill_id)?.name || 'HTML')} Challenge
                        </div>
                        <div className="text-xs sm:text-sm text-white/90 font-medium mt-1">
                          Started recently · Target: <b className="text-white font-extrabold">+10 points</b>
                        </div>
                      </div>
                      <div className="bg-white/30 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white border border-white/40 shadow-xs">
                        In progress
                      </div>
                    </div>

                    {/* Live countdown */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Time Remaining
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono tracking-wide text-white">
                        {timeRemaining.isExpired ? (
                          <span className="text-red-200">Deadline reached!</span>
                        ) : (
                          `${timeRemaining.days}d ${String(timeRemaining.hours).padStart(2, '0')}h ${String(timeRemaining.minutes).padStart(2, '0')}m ${String(timeRemaining.seconds).padStart(2, '0')}s left`
                        )}
                      </div>

                      {/* Dynamic progress bar */}
                      <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden mt-3 p-0.5">
                        <div 
                          className="bg-white h-full rounded-full transition-all duration-1000 shadow-sm" 
                          style={{ width: `${timeRemaining.percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-white/80 font-semibold mt-1.5">
                        <span>Elapsed: {timeRemaining.percent}%</span>
                        <span>Milestones: {(activeProgress.steps_completed || []).length}/{(roadmapSteps[activeProgress.skill_id] || []).length}</span>
                      </div>
                    </div>

                    {/* Interactive Step Checklist */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/90">
                          Milestone Checklist
                        </div>
                        <div className="text-xs text-white/80 font-medium">
                          Click step to toggle
                        </div>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {(roadmapSteps[activeProgress.skill_id] || []).map((st, i) => {
                          const isDone = (activeProgress.steps_completed || []).includes(st.step_order);
                          return (
                            <div 
                              key={st.id}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border ${
                                isDone 
                                  ? 'bg-white/30 border-white/50 text-white font-bold shadow-xs' 
                                  : 'bg-black/15 border-white/15 text-white hover:bg-black/25'
                              }`}
                              onClick={() => handleToggleStep(st.step_order)}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 font-black ${
                                  isDone ? 'bg-white text-[#e17055] font-black border-white' : 'border-white/60 text-white'
                                }`}>
                                  {isDone ? '✓' : i + 1}
                                </div>
                                <span className="text-xs sm:text-sm font-bold truncate">{st.title}</span>
                              </div>
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wide ${
                                isDone ? 'bg-white text-[#e17055]' : 'bg-black/20 text-white/80'
                              }`}>
                                {isDone ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Challenge Action Buttons: Cancel, Add Extra Time & Complete */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-white/20">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsCancelModalOpen(true)}
                          className="flex-1 sm:flex-none py-2.5 sm:py-3 px-3.5 bg-black/25 hover:bg-black/35 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/25"
                          id="btn-open-cancel-challenge-dashboard"
                          title="Cancel this challenge"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          Cancel
                        </button>
                        <button 
                          onClick={() => setIsAddTimeModalOpen(true)}
                          className="flex-1 sm:flex-none py-2.5 sm:py-3 px-3.5 bg-black/25 hover:bg-black/35 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/25"
                          id="btn-open-add-time"
                          title="Add more time to this challenge"
                        >
                          <Plus className="w-4 h-4 text-white" />
                          Add Time
                        </button>
                      </div>
                      <button 
                        onClick={handleCompleteActiveChallenge}
                        className="flex-1 py-2.5 sm:py-3 px-4 bg-white text-[#e17055] font-black rounded-xl text-xs sm:text-sm shadow-lg hover:bg-amber-50 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                        id="btn-mark-challenge-complete"
                      >
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00b894]" />
                        Mark as complete (+10 pts)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-[#e4e5ee] rounded-2xl p-6 text-center shadow-sm mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#f1eefe] text-[#6c5ce7] flex items-center justify-center text-xl mx-auto mb-3">
                      ⚡
                    </div>
                    <h4 className="text-base font-bold text-[#1a1c2e] mb-1">No active challenge right now</h4>
                    <p className="text-xs text-[#8a8ca3] mb-4">Pick a skill roadmap to challenge yourself against the clock and earn points.</p>
                    <button 
                      onClick={() => setCurrentPage('discover')}
                      className="px-4 py-2 bg-[#6c5ce7] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Browse Skill Roadmaps →
                    </button>
                  </div>
                )}

                {/* Stat Mini Grid */}
                <div className="stat-mini-grid">
                  <div className="stat-mini">
                    <div className="val">{currentUser.points}</div>
                    <div className="lbl">total points</div>
                  </div>
                  <div className="stat-mini">
                    <div className="val">{currentUser.current_streak} days</div>
                    <div className="lbl">current streak</div>
                  </div>
                  <div className="stat-mini">
                    <div className="val">{(completedSkillsMap[currentUser.id] || []).length}</div>
                    <div className="lbl">skills completed</div>
                  </div>
                  <div className="stat-mini">
                    <div className="val">#3</div>
                    <div className="lbl">batch rank</div>
                  </div>
                </div>

              </div>

              {/* Right Column: Badges */}
              <div className="badge-side">
                <div className="section-title" style={{ marginBottom: '18px' }}>Badges</div>
                
                {badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`badge-item ${badge.unlocked ? '' : 'badge-locked'}`}
                  >
                    <div 
                      className="badge-circle" 
                      style={{ background: badge.bg_color || (badge.unlocked ? '#6c5ce7' : '#b2bec3') }}
                    >
                      {badge.icon_symbol || '★'}
                    </div>
                    <div>
                      <h5>{badge.name}</h5>
                      <p>{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 7 — LEADERBOARD */}
      {/* ========================================================================= */}
      {currentPage === 'leaderboard' && (
        <div className="page" id="page-leaderboard">
          <div className="page-tag">PAGE 7 — LEADERBOARD</div>

          <div className="content">
            
            {/* Batch Filter Tabs */}
            <div className="lb-tabs">
              {['Batch 55', 'Batch 56', 'Batch 57', 'All departments'].map((tab) => (
                <div 
                  key={tab}
                  className={`lb-tab cursor-pointer select-none transition-all ${
                    selectedBatchFilter === tab ? 'active' : 'hover:bg-slate-100'
                  }`}
                  onClick={() => setSelectedBatchFilter(tab)}
                  id={`lb-tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Top 3 Podium View */}
            <div className="lb-podium">
              
              {/* #2 Silver (Left) */}
              {top2 && (
                <div 
                  className="podium-col silver cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleOpenUserProfile(top2.id)}
                >
                  <div className="avatar-big">
                    {top2.id === currentUser.id ? 'YO' : top2.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="podium-block">2</div>
                  <div className="pname">{top2.id === currentUser.id ? 'You' : top2.full_name}</div>
                  <div className="ppts">{top2.points} pts</div>
                </div>
              )}

              {/* #1 Gold (Center) */}
              {top1 && (
                <div 
                  className="podium-col gold cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleOpenUserProfile(top1.id)}
                >
                  <div className="avatar-big">
                    {top1.id === currentUser.id ? 'YO' : top1.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="podium-block">1</div>
                  <div className="pname">{top1.id === currentUser.id ? 'You' : top1.full_name}</div>
                  <div className="ppts">{top1.points} pts</div>
                </div>
              )}

              {/* #3 Bronze (Right) */}
              {top3 && (
                <div 
                  className="podium-col bronze cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleOpenUserProfile(top3.id)}
                >
                  <div className="avatar-big">
                    {top3.id === currentUser.id ? 'YO' : top3.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="podium-block">3</div>
                  <div className="pname">{top3.id === currentUser.id ? 'You' : top3.full_name}</div>
                  <div className="ppts">{top3.points} pts</div>
                </div>
              )}

            </div>

            {/* Ranked List */}
            <div className="lb-list">
              {filteredLeaderboardProfiles.map((p, idx) => {
                const rank = idx + 1;
                const isYou = p.id === currentUser.id;
                const initials = isYou ? 'YO' : p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);

                return (
                  <div 
                    key={p.id}
                    className={`lb-row cursor-pointer transition-colors ${isYou ? 'you' : 'hover:bg-[#f9f9fc]'}`}
                    onClick={() => handleOpenUserProfile(p.id)}
                    id={`lb-row-rank-${rank}`}
                  >
                    <div className="lb-rank">{rank}</div>
                    <div 
                      className="lb-avatar" 
                      style={{ 
                        background: rank === 1 ? '#fdcb6e' : (isYou ? '#6c5ce7' : '#1a1c2e'),
                        color: rank === 1 ? '#7a5200' : '#fff'
                      }}
                    >
                      {initials}
                    </div>
                    <div className="lb-name">
                      {isYou ? 'You' : p.full_name}
                      <span className="ml-2 text-xs text-[#8a8ca3] font-normal">
                        ({p.department} · {p.batch_number})
                      </span>
                    </div>
                    <div className="lb-pts">{p.points}</div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 8 — PUBLIC PROFILE */}
      {/* ========================================================================= */}
      {currentPage === 'profile' && (
        <div className="page" id="page-profile">
          <div className="page-tag">PAGE 8 — PUBLIC PROFILE</div>

          <div className="content">
            
            <button 
              onClick={() => setCurrentPage('leaderboard')}
              className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold mb-4 flex items-center gap-1 transition-colors"
            >
              ← Back to Leaderboard
            </button>

            {/* Profile Hero */}
            <div className="profile-hero shadow-lg">
              <div className="profile-avatar-big">
                {targetProfile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="profile-hero-info">
                <h2>{targetProfile.full_name}</h2>
                <p>{targetProfile.department} · {targetProfile.batch_number} · Roll {targetProfile.roll_number}</p>
              </div>
              <div className="profile-hero-stats">
                <div className="stat">
                  <b>{targetProfile.points}</b>
                  <span>points</span>
                </div>
                <div className="stat">
                  <b>{targetProfile.current_streak}</b>
                  <span>day streak</span>
                </div>
                <div className="stat">
                  <b>#1</b>
                  <span>in batch</span>
                </div>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="profile-grid">
              
              {/* Left: Details */}
              <div>
                <div className="info-card">
                  <div className="section-title" style={{ marginBottom: '14px' }}>Details</div>
                  <div className="info-row">
                    <span>Department</span>
                    <span>{targetProfile.department}</span>
                  </div>
                  <div className="info-row">
                    <span>Batch</span>
                    <span>{targetProfile.batch_number}</span>
                  </div>
                  <div className="info-row">
                    <span>Roll / ID</span>
                    <span>{targetProfile.roll_number}</span>
                  </div>
                  <div className="info-row">
                    <span>Skills completed</span>
                    <span>{targetUserCompletedSkills.length || 4}</span>
                  </div>

                  <div className="social-links-row">
                    {targetProfile.fb_link && (
                      <a 
                        href={`https://${targetProfile.fb_link.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="social-icon hover:scale-105 transition-transform" 
                        style={{ background: '#3b5998' }}
                        title="Facebook Profile"
                      >
                        f
                      </a>
                    )}
                    {targetProfile.telegram_link && (
                      <a 
                        href={`https://${targetProfile.telegram_link.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="social-icon hover:scale-105 transition-transform" 
                        style={{ background: '#0088cc' }}
                        title="Telegram Profile"
                      >
                        T
                      </a>
                    )}
                    {targetProfile.whatsapp_link && (
                      <a 
                        href={`https://wa.me/${targetProfile.whatsapp_link.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="social-icon hover:scale-105 transition-transform" 
                        style={{ background: '#25d366' }}
                        title="WhatsApp Contact"
                      >
                        W
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Completed Skills */}
              <div>
                <div className="section-title">Completed skills</div>
                
                {targetUserCompletedSkills.map((cs, idx) => (
                  <div key={idx} className="completed-skill-card">
                    <div className="icon" style={{ background: cs.bg || '#e84393' }}>
                      {cs.icon || 'S'}
                    </div>
                    <div className="info">
                      <h5>{cs.skillName}</h5>
                      <p>{cs.duration}</p>
                    </div>
                    <div className="time-badge">On time</div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 9 — ADMIN PANEL */}
      {/* ========================================================================= */}
      {currentPage === 'admin' && (
        <div className="page" id="page-admin">
          <div className="page-tag">PAGE 9 — ADMIN PANEL</div>

          {!currentUser.is_admin ? (
            <div className="content py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1c2e] mb-2">Admin Access Restricted</h2>
              <p className="text-[#8a8ca3] text-sm max-w-md mx-auto mb-6">
                Only the designated system administrator (<span className="text-[#6c5ce7] font-semibold">{ADMIN_EMAIL}</span>) has permission to manage platform skills, tracks, and student accounts.
              </p>
              <button
                onClick={() => setCurrentPage('discover')}
                className="px-6 py-2.5 bg-[#6c5ce7] hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#6c5ce7]/20"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <div className="content">
              
              <div className="admin-header-row">
                <div className="section-title" style={{ margin: 0 }}>Admin dashboard</div>
                <div 
                  className="admin-add-btn cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5 select-none"
                  onClick={() => {
                    setEditingSkill(null);
                    setIsSkillModalOpen(true);
                  }}
                  id="btn-admin-add-skill"
                >
                  <Plus className="w-4 h-4" />
                  Add new skill
                </div>
              </div>

              {/* Admin Stats Grid */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#6c5ce7' }}>👥</div>
                  <div className="val">{profiles.length * 16}</div>
                  <div className="lbl">Total users</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#00b894' }}>⚡</div>
                  <div className="val">34</div>
                  <div className="lbl">Active challenges right now</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#e17055' }}>🔥</div>
                  <div className="val">HTML</div>
                  <div className="lbl">Most popular skill</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#fdcb6e' }}>🏆</div>
                  <div className="val">312</div>
                  <div className="lbl">Total completions</div>
                </div>
              </div>

              {/* Admin Tabs */}
              <div className="admin-tabs">
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminTab('users')}
                >
                  Users ({profiles.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setAdminTab('skills')}
                >
                  Fields &amp; skills ({skills.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setAdminTab('steps')}
                >
                  Roadmap steps
                </div>
              </div>

              {/* TAB 1: USERS TABLE */}
              {adminTab === 'users' && (
                <div className="admin-table">
                  <div className="admin-table-head">
                    <div>Name &amp; Email</div>
                    <div>Department</div>
                    <div>Batch</div>
                    <div>Points</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>

                  {profiles.map((p) => (
                    <div key={p.id} className="admin-table-row">
                      <div className="flex flex-col">
                        <div className="font-bold flex items-center gap-2">
                          {p.full_name}
                          {p.is_admin && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                        {p.email && (
                          <div className="text-[11px] text-[#8a8ca3] font-normal">{p.email}</div>
                        )}
                      </div>
                      <div>{p.department}</div>
                      <div>{p.batch_number}</div>
                      <div className="font-bold">{p.points}</div>
                      <div>
                        <span className={`admin-badge-role ${p.is_banned ? 'bg-red-100 text-red-600' : ''}`}>
                          {p.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </div>
                      <div>
                        <button 
                          className="admin-action-btn hover:bg-slate-100"
                          onClick={() => handleOpenUserProfile(p.id)}
                        >
                          View
                        </button>
                        <button 
                          className={`admin-action-btn danger hover:bg-red-50`}
                          onClick={() => handleBanToggle(p.id)}
                        >
                          {p.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* TAB 2: FIELDS & SKILLS */}
            {adminTab === 'skills' && (
              <div className="admin-table">
                <div className="admin-table-head">
                  <div>Skill Track</div>
                  <div>Parent Field</div>
                  <div>Difficulty</div>
                  <div>Avg Duration</div>
                  <div>Steps Count</div>
                  <div>Actions</div>
                </div>

                {skills.map((s) => {
                  const parentField = fields.find(f => f.id === s.field_id);
                  const stepsCount = roadmapSteps[s.id]?.length || 3;
                  return (
                    <div key={s.id} className="admin-table-row">
                      <div className="font-bold flex items-center gap-2">
                        <span 
                          className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                          style={{ background: s.bg_color || '#6c5ce7' }}
                        >
                          {s.icon}
                        </span>
                        {s.name}
                      </div>
                      <div>{parentField?.name || 'General'}</div>
                      <div>{s.difficulty || 'Beginner'}</div>
                      <div>{s.avg_days || '3 days'}</div>
                      <div className="font-bold">{stepsCount} steps</div>
                      <div>
                        <button 
                          className="admin-action-btn hover:bg-slate-100"
                          onClick={() => {
                            setEditingSkill(s);
                            setIsSkillModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="admin-action-btn danger hover:bg-red-50"
                          onClick={() => handleDeleteSkill(s.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: ROADMAP STEPS */}
            {adminTab === 'steps' && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <label className="text-xs font-bold text-[#4a4c63]">Select Skill Track:</label>
                    <select 
                      className="field-input py-2 px-3 text-xs mb-0 w-full sm:w-auto"
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                    >
                      {skills.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setIsStepModalOpen(true)}
                    className="w-full sm:w-auto px-3.5 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Step to {currentSkill.name}
                  </button>
                </div>

                <div className="space-y-3">
                  {currentSkillSteps.map((st, idx) => (
                    <div key={st.id} className="p-3 sm:p-3.5 border border-[#e4e5ee] rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#6c5ce7] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#1a1c2e] truncate">{st.title}</div>
                          <div className="text-[11px] text-[#8a8ca3] line-clamp-2">{st.description}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteStep(currentSkill.id, st.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg text-xs shrink-0"
                        title="Delete Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* Deadline Picker Modal */}
      <DeadlineModal
        skill={currentSkill}
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        onConfirm={handleStartSkill}
      />

      {/* Add Extra Time Modal */}
      {activeProgress && (
        <AddTimeModal
          isOpen={isAddTimeModalOpen}
          onClose={() => setIsAddTimeModalOpen(false)}
          onConfirm={handleAddExtraTime}
          currentDeadline={activeProgress.deadline_at}
          skillName={skills.find(s => s.id === activeProgress.skill_id)?.name || 'Active Skill'}
        />
      )}

      {/* Cancel Challenge Confirmation Modal */}
      {activeProgress && (
        <CancelChallengeModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelChallenge}
          skillName={skills.find(s => s.id === activeProgress.skill_id)?.name || 'Skill'}
        />
      )}

      {/* Admin Skill Add/Edit Modal */}
      <SkillModal 
        isOpen={isSkillModalOpen}
        onClose={() => {
          setIsSkillModalOpen(false);
          setEditingSkill(null);
        }}
        onSave={handleSaveSkill}
        fields={fields}
        initialData={editingSkill}
      />

      {/* Admin Step Add Modal */}
      <StepModal 
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        onSave={handleAddStep}
        skillId={currentSkill.id}
        skillName={currentSkill.name}
        nextOrder={currentSkillSteps.length + 1}
      />

    </div>
  );
}
