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
  initialProfiles
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { getMainName } from './lib/nameHelper';
import { DeadlineModal } from './components/DeadlineModal';
import { AddTimeModal } from './components/AddTimeModal';
import { CancelChallengeModal } from './components/CancelChallengeModal';
import { SkillModal, FieldModal, StepModal } from './components/AdminModals';
import { PasswordRecoveryModal } from './components/PasswordRecoveryModal';
import { AuthLoadingScreen } from './components/AuthLoadingScreen';
import { FeedbackModal } from './components/FeedbackModal';
import { UserFeedbackHistoryModal } from './components/UserFeedbackHistoryModal';
import { AdminFeedbackSection } from './components/AdminFeedbackSection';
import { 
  getProfile,
  updateProfile,
  ensureProfile,
  getAllProfiles,
  getActiveProgress,
  startSkillChallenge,
  addExtraTimeToProgress,
  cancelProgress,
  completeChallenge,
  getUserCompletedProgress,
  getAllCompletedProgress,
  getUserBadges,
  getAdminStats,
  uploadAvatarImage,
  getAllFeedback
} from './lib/supabaseService';
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
  ChevronRight, 
  BookOpen, 
  Upload, 
  Search,
  Filter,
  Zap,
  Sparkles,
  User,
  GraduationCap,
  Building2,
  Hash,
  MessageSquare,
  Phone,
  Camera,
  Save,
  Check,
  Share2,
  KeyRound,
  Eye,
  EyeOff,
  Link2,
  X
} from 'lucide-react';

// Helper to format social contact links into working URLs
function formatSocialLink(type: 'facebook' | 'telegram' | 'whatsapp', input?: string): string {
  if (!input || !input.trim()) return '';
  const val = input.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) return val;

  if (type === 'facebook') {
    if (val.startsWith('facebook.com/') || val.startsWith('fb.com/')) return `https://${val}`;
    const cleaned = val.startsWith('@') ? val.slice(1) : val;
    return `https://facebook.com/${cleaned}`;
  }

  if (type === 'telegram') {
    if (val.startsWith('t.me/')) return `https://${val}`;
    const cleaned = val.startsWith('@') ? val.slice(1) : val;
    return `https://t.me/${cleaned}`;
  }

  if (type === 'whatsapp') {
    if (val.startsWith('wa.me/')) return `https://${val}`;
    // If user provided an alphanumeric username / handle
    if (/[a-zA-Z]/.test(val)) {
      const cleaned = val.startsWith('@') ? val.slice(1) : val;
      return `https://wa.me/${cleaned}`;
    }
    // If user provided a numeric phone number
    let digits = val.replace(/[^0-9]/g, '');
    if (digits.startsWith('01')) {
      digits = '88' + digits;
    }
    return `https://wa.me/${digits}`;
  }

  return val;
}

export default function App() {
  // Navigation (Default to login so users must login/signup first)
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [discoverView, setDiscoverView] = useState<'main' | 'fields' | 'field-skills' | 'all-skills'>('main');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form State (Clean by default)
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App Data State (Fields and skills remain seeded as requested)
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [roadmapSteps, setRoadmapSteps] = useState<Record<string, RoadmapStep[]>>(initialRoadmapSteps);
  const [badges] = useState<Badge[]>(initialBadges);
  
  // Live Profiles & Progress State from Supabase
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [userBadgeIds, setUserBadgeIds] = useState<string[]>([]);
  const [allCompletedProgress, setAllCompletedProgress] = useState<UserProgress[]>([]);
  const [selectedUserCompletedProgress, setSelectedUserCompletedProgress] = useState<UserProgress[]>([]);
  
  // Selected Profile for Public Profile view
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Loading & Initialization state (Explicit loading state so app does not redirect while restoring session)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Logged-in User Profile (null when not authenticated)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Enforce Protected Route rules once session restoration is complete
  useEffect(() => {
    if (isAuthLoading) return;

    if (!currentUser || !currentUser.id) {
      if (currentPage !== 'login' && currentPage !== 'signup') {
        setCurrentPage('login');
      }
    } else if (!currentUser.profile_completed) {
      if (currentPage !== 'profile-setup') {
        setCurrentPage('profile-setup');
      }
    }
  }, [isAuthLoading, currentUser, currentPage]);

  // Active Challenge (User Progress)
  const [activeProgress, setActiveProgress] = useState<UserProgress | null>(null);

  // Admin Aggregate Stats
  const [adminStats, setAdminStats] = useState({
    totalUsers: 1,
    activeChallenges: 0,
    mostPopularSkillName: 'HTML',
    totalCompletions: 0
  });

  // Selected Skill for Roadmap view
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill-html');

  // Modals
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isAddTimeModalOpen, setIsAddTimeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);

  // Filter state for Discover
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Leaderboard Batch Filter
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('Batch 55');

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<'users' | 'fields' | 'skills' | 'steps' | 'feedback'>('users');

  // Feedback Modals
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMyFeedbackModalOpen, setIsMyFeedbackModalOpen] = useState(false);

  // Profile Setup Form State
  const [setupFullName, setSetupFullName] = useState('');
  const [setupDepartment, setSetupDepartment] = useState('');
  const [setupRoll, setSetupRoll] = useState('');
  const [setupBatch, setSetupBatch] = useState('');
  const [setupFb, setSetupFb] = useState('');
  const [setupTelegram, setSetupTelegram] = useState('');
  const [setupWhatsapp, setSetupWhatsapp] = useState('');
  const [setupAvatarPreview, setSetupAvatarPreview] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Real-time Countdown Timer calculation
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean; percent: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    percent: 0
  });

  // Success Notification Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password Recovery / Reset New Password State
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(false);
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pastedLinkInput, setPastedLinkInput] = useState('');
  const [showRecoveryPass, setShowRecoveryPass] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  /**
   * Helper to activate session from a pasted Supabase email URL / hash
   */
  const handlePasteRecoveryLink = async (pastedText: string) => {
    try {
      let clean = pastedText.trim();
      if (clean.includes('#')) {
        clean = clean.split('#')[1];
      } else if (clean.includes('?')) {
        clean = clean.split('?')[1];
      }
      const params = new URLSearchParams(clean);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          showToast('Invalid or expired token link: ' + error.message);
        } else if (data?.session) {
          setIsPasswordRecoveryMode(true);
          showToast('✅ Session verified! Please enter your new password.');
        }
      } else {
        showToast('Could not find access_token in the pasted link.');
      }
    } catch (e: any) {
      showToast('Error verifying token link: ' + e.message);
    }
  };

  /**
   * Save the new password chosen during recovery
   */
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecoveryPassword || newRecoveryPassword.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }
    if (newRecoveryPassword !== confirmRecoveryPassword) {
      showToast('Passwords do not match. Please recheck.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newRecoveryPassword
      });
      if (error) {
        showToast('Failed to update password: ' + error.message);
      } else {
        showToast('✅ Password updated successfully! Welcome to your dashboard.');
        setIsPasswordRecoveryMode(false);
        setNewRecoveryPassword('');
        setConfirmRecoveryPassword('');
        if (data?.user) {
          await refreshAppData(data.user.id);
          setCurrentPage('discover');
        }
      }
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Master Data Loader: Fetches all live Supabase records
   */
  const refreshAppData = async (targetUid?: string) => {
    const uid = targetUid || currentUser?.id;

    try {
      // 1. Fetch all profiles
      const liveProfiles = await getAllProfiles();
      if (liveProfiles.length > 0) {
        setProfiles(liveProfiles);
      }

      // 2. Fetch all completed challenges across all users
      const liveCompleted = await getAllCompletedProgress();
      setAllCompletedProgress(liveCompleted);

      // 3. Fetch Admin stats
      const liveStats = await getAdminStats();
      setAdminStats(liveStats);

      // 4. Fetch specific user data if logged in
      if (uid) {
        const userProf = await getProfile(uid);
        if (userProf) {
          setCurrentUser(userProf);
        }

        const active = await getActiveProgress(uid);
        setActiveProgress(active);

        const badgesList = await getUserBadges(uid);
        setUserBadgeIds(badgesList);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  };

  // Sync Supabase Auth Session on mount and listen to changes
  useEffect(() => {
    let isMounted = true;

    // Auto-detect password recovery in URL hash or params
    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setIsPasswordRecoveryMode(true);
    }

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured()) {
          if (isMounted) {
            setIsAuthLoading(false);
            setCurrentPage('login');
          }
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Supabase Auth Init] getSession error:', error.message);
        }

        if (session?.user) {
          const uid = session.user.id;
          const uemail = session.user.email;

          let profile = await getProfile(uid);
          if (!profile) {
            profile = await ensureProfile({
              id: uid,
              email: uemail,
              full_name: session.user.user_metadata?.full_name
            });
          }

          if (uemail && (!profile.email || profile.email !== uemail)) {
            profile.email = uemail;
            const isAdmin = uemail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() || Boolean(profile.is_admin);
            profile.is_admin = isAdmin;
            await updateProfile(uid, { email: uemail, is_admin: isAdmin });
          }

          if (isMounted) {
            setCurrentUser(profile);
            await refreshAppData(uid);
            if (!profile.profile_completed) {
              setCurrentPage('profile-setup');
            } else {
              setCurrentPage('discover');
            }
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
            setCurrentPage('login');
            await refreshAppData();
          }
        }
      } catch (err) {
        console.error('[Supabase Auth Init] Exception:', err);
        if (isMounted) {
          setCurrentUser(null);
          setCurrentPage('login');
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Supabase Auth Event]:', event, session?.user?.email);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
        showToast('🔑 Recovery verified! Please set your new password.');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const uid = session.user.id;
        const uemail = session.user.email;
        let profile = await getProfile(uid);
        if (!profile) {
          profile = await ensureProfile({
            id: uid,
            email: uemail,
            full_name: session.user.user_metadata?.full_name
          });
        }
        if (uemail && (!profile.email || profile.email !== uemail)) {
          profile.email = uemail;
          const isAdmin = uemail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() || Boolean(profile.is_admin);
          profile.is_admin = isAdmin;
          await updateProfile(uid, { email: uemail, is_admin: isAdmin });
        }
        if (isMounted) {
          setCurrentUser(profile);
          await refreshAppData(uid);
          if (!profile.profile_completed) {
            setCurrentPage('profile-setup');
          } else {
            setCurrentPage('discover');
          }
          setIsAuthLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setCurrentUser(null);
          setActiveProgress(null);
          setUserBadgeIds([]);
          setCurrentPage('login');
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // When currentUser changes, sync the Profile Setup form state
  useEffect(() => {
    if (currentUser) {
      setSetupFullName(currentUser.full_name || '');
      setSetupDepartment(currentUser.department || '');
      setSetupRoll(currentUser.roll_number || '');
      setSetupBatch(currentUser.batch_number || '');
      setSetupFb(currentUser.fb_link || '');
      setSetupTelegram(currentUser.telegram_link || '');
      setSetupWhatsapp(currentUser.whatsapp_link || '');
      setSetupAvatarPreview(currentUser.avatar_url || null);
    }
  }, [currentUser]);

  // When selectedUserId changes or Public Profile page is opened, fetch target user's completed skills
  useEffect(() => {
    if (currentPage === 'profile' && selectedUserId) {
      getUserCompletedProgress(selectedUserId).then(completedRows => {
        setSelectedUserCompletedProgress(completedRows);
      });
    }
  }, [currentPage, selectedUserId]);

  // Live Timer Tick (Updates every second based on real dates)
  useEffect(() => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const calculateTime = () => {
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
        const percent = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 0;

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
          percent
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeProgress]);

  // Live Batch Rank calculation for current user
  const userBatchRank = useMemo(() => {
    if (!currentUser || !currentUser.id) return '—';
    const batchList = profiles
      .filter(p => !currentUser.batch_number || p.batch_number === currentUser.batch_number)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    const idx = batchList.findIndex(p => p.id === currentUser.id);
    if (idx === -1) return '—';
    return `#${idx + 1}`;
  }, [profiles, currentUser]);

  // Derived current skill and steps
  const currentSkill = useMemo(() => {
    return skills.find(s => s.id === selectedSkillId) || skills[0];
  }, [skills, selectedSkillId]);

  const currentSkillSteps = useMemo(() => {
    return roadmapSteps[selectedSkillId] || [];
  }, [roadmapSteps, selectedSkillId]);

  // Target profile for Public Profile view
  const targetProfile = useMemo(() => {
    return profiles.find(p => p.id === selectedUserId) || currentUser;
  }, [profiles, selectedUserId, currentUser]);

  const targetBatchRank = useMemo(() => {
    if (!targetProfile || !targetProfile.id) return '—';
    const batchList = profiles
      .filter(p => !targetProfile.batch_number || p.batch_number === targetProfile.batch_number)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    const idx = batchList.findIndex(p => p.id === targetProfile.id);
    if (idx === -1) return '—';
    return `#${idx + 1}`;
  }, [profiles, targetProfile]);

  // Leaderboard Qualified Profiles (must have completed at least one challenge, or points > 0)
  const filteredLeaderboardProfiles = useMemo(() => {
    const completedUserIds = new Set(allCompletedProgress.map(cp => cp.user_id));
    let list = profiles.filter(p => completedUserIds.has(p.id) || p.points > 0);

    if (selectedBatchFilter !== 'All departments') {
      list = list.filter(p => p.batch_number === selectedBatchFilter);
    }

    return list.sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [profiles, allCompletedProgress, selectedBatchFilter]);

  const top1 = filteredLeaderboardProfiles[0];
  const top2 = filteredLeaderboardProfiles[1];
  const top3 = filteredLeaderboardProfiles[2];

  // ==========================================
  // HANDLERS
  // ==========================================

  // Authentication Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthLoading(false);
          return;
        }

        console.log('[Supabase Auth] Initiating signUp for email:', authEmail.trim());

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authName.trim()
            }
          }
        });

        if (error) {
          console.error('[Supabase Auth] signUp request failed:', {
            message: error.message,
            status: error.status,
            name: error.name,
            error
          });
          if (error.message.toLowerCase().includes('already registered')) {
            setAuthError('An account with this email already exists. Please switch to Log in.');
          } else {
            setAuthError(error.message);
          }
          setAuthLoading(false);
          return;
        }

        console.log('[Supabase Auth] signUp successful:', data);

        if (data.user) {
          const isUserAdmin = authEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
          const newProfile: Profile = {
            id: data.user.id,
            email: authEmail.trim().toLowerCase(),
            full_name: authName.trim(),
            department: '',
            roll_number: '',
            batch_number: '',
            profile_completed: false,
            points: 0,
            current_streak: 0,
            longest_streak: 0,
            is_admin: isUserAdmin,
            is_banned: false
          };

          await updateProfile(data.user.id, newProfile);
          setCurrentUser(newProfile);
          setProfiles(prev => [newProfile, ...prev.filter(p => p.id !== newProfile.id)]);

          // Initialize Profile Setup form with empty/blank fields
          setSetupFullName(authName.trim());
          setSetupDepartment('');
          setSetupRoll('');
          setSetupBatch('');
          setSetupFb('');
          setSetupTelegram('');
          setSetupWhatsapp('');
          setSetupAvatarPreview(null);

          showToast('Account created successfully! Please complete your profile.');
          setCurrentPage('profile-setup');
          await refreshAppData(data.user.id);
        }
      } else {
        // Login Mode
        console.log('[Supabase Auth] Initiating signIn for email:', authEmail.trim());

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });

        if (error) {
          console.error('[Supabase Auth] signIn failed:', {
            message: error.message,
            status: error.status,
            name: error.name,
            error
          });
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setAuthError('Invalid email or password. If you have not created an account yet, please click "Create an account" to Sign up first.');
          } else {
            setAuthError(error.message);
          }
          setAuthLoading(false);
          return;
        }

        console.log('[Supabase Auth] signIn successful:', data);

        if (data.user) {
          let userProf = await getProfile(data.user.id);
          const loginEmail = data.user.email || authEmail.trim();
          if (!userProf) {
            userProf = await ensureProfile({
              id: data.user.id,
              email: loginEmail,
              full_name: data.user.user_metadata?.full_name
            });
          }
          if (loginEmail && (!userProf.email || userProf.email !== loginEmail)) {
            userProf.email = loginEmail;
            const isAdmin = loginEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
            userProf.is_admin = isAdmin;
            await updateProfile(data.user.id, { email: loginEmail, is_admin: isAdmin });
          }

          setCurrentUser(userProf);
          await refreshAppData(data.user.id);
          showToast(`Welcome back, ${userProf.full_name || 'Student'}!`);

          if (!userProf.profile_completed) {
            setCurrentPage('profile-setup');
          } else {
            setCurrentPage('discover');
          }
        }
      }
    } catch (err: any) {
      console.error('[Supabase Auth] Unexpected exception during auth submit:', err);
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser({
        id: '',
        email: '',
        full_name: 'Guest User',
        department: '',
        roll_number: '',
        batch_number: '',
        profile_completed: false,
        points: 0,
        current_streak: 0,
        longest_streak: 0,
        is_admin: false,
        is_banned: false
      });
      setActiveProgress(null);
      setUserBadgeIds([]);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      setCurrentPage('login');
      showToast('You have been signed out.');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Profile Setup Submission
  const handleSaveProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    setSetupLoading(true);

    const hasAtLeastOneSocial = setupFb.trim() || setupTelegram.trim() || setupWhatsapp.trim();

    if (!hasAtLeastOneSocial) {
      setSetupError('At least one contact link (Facebook, Telegram, or WhatsApp) is required to complete profile setup!');
      setSetupLoading(false);
      return;
    }

    if (!currentUser || !currentUser.id) {
      setSetupError('Session expired. Please log in again.');
      setSetupLoading(false);
      setCurrentPage('login');
      return;
    }

    let finalAvatarUrl = currentUser.avatar_url;
    if (setupAvatarPreview && setupAvatarPreview.startsWith('data:')) {
      finalAvatarUrl = await uploadAvatarImage(currentUser.id, setupAvatarPreview);
    } else if (setupAvatarPreview) {
      finalAvatarUrl = setupAvatarPreview;
    }

    const payload: Partial<Profile> = {
      full_name: setupFullName.trim() || currentUser.full_name,
      department: setupDepartment.trim() || currentUser.department,
      roll_number: setupRoll.trim() || currentUser.roll_number,
      batch_number: setupBatch.trim() || currentUser.batch_number,
      avatar_url: finalAvatarUrl,
      fb_link: setupFb.trim() || undefined,
      telegram_link: setupTelegram.trim() || undefined,
      whatsapp_link: setupWhatsapp.trim() || undefined,
      profile_completed: true
    };

    const { success, error } = await updateProfile(currentUser.id, payload);
    if (!success) {
      setSetupError(error || 'Failed to save profile to database.');
      setSetupLoading(false);
      return;
    }

    // Verify by re-fetching the updated profile from Supabase
    const freshProfile = await getProfile(currentUser.id);
    const verifiedProfile: Profile = freshProfile || {
      ...currentUser,
      ...payload,
      profile_completed: true
    };

    setCurrentUser(verifiedProfile);
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === currentUser.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = verifiedProfile;
        return copy;
      }
      return [verifiedProfile, ...prev];
    });

    setSetupLoading(false);
    showToast('Profile setup completed successfully!');
    setCurrentPage('discover');
    await refreshAppData(currentUser.id);
  };

  // Avatar Upload Handler with Automatic Optimization
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize & compress to ~256x256 max for instant Supabase syncing
          const canvas = document.createElement('canvas');
          const maxDim = 280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setSetupAvatarPreview(optimizedBase64);
          } else {
            setSetupAvatarPreview(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Skill Challenge
  const handleStartSkill = async (days: number, hours: number) => {
    if (!currentUser.profile_completed) {
      showToast('Please complete your profile setup before starting a skill challenge!');
      setIsDeadlineModalOpen(false);
      setCurrentPage('profile-setup');
      return;
    }

    if (activeProgress && activeProgress.status === 'in_progress') {
      showToast('You already have an active challenge. Complete or cancel it before starting another.');
      setIsDeadlineModalOpen(false);
      setCurrentPage('dashboard');
      return;
    }

    const targetSkill = skills.find(s => s.id === selectedSkillId) || skills[0];
    const totalHours = Math.max(1, days * 24 + hours);

    const progress = await startSkillChallenge(currentUser.id, targetSkill.id, totalHours);
    if (progress) {
      setActiveProgress(progress);
      setIsDeadlineModalOpen(false);
      showToast(`Started ${targetSkill.name} challenge! Deadline: ${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h` : ''}`);
      setCurrentPage('dashboard');
    } else {
      showToast('Could not start challenge. Please try again.');
    }
  };

  // Cancel Active Challenge
  const handleCancelChallenge = async () => {
    if (!activeProgress) return;
    const progressId = activeProgress.id;
    const targetSkill = skills.find(s => s.id === activeProgress.skill_id);
    const skillName = targetSkill?.name || 'Skill';

    setActiveProgress(null);
    setIsCancelModalOpen(false);
    showToast(`Challenge for ${skillName} has been cancelled.`);

    await cancelProgress(progressId);
    await refreshAppData(currentUser.id);
  };

  // Complete Active Challenge
  const handleCompleteActiveChallenge = async () => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const skill = skills.find(s => s.id === activeProgress.skill_id) || skills[0];
    const progressId = activeProgress.id;

    const { success, newPoints, newStreak } = await completeChallenge(
      progressId,
      currentUser.id,
      currentUser.points,
      currentUser.current_streak,
      activeProgress.skill_id
    );

    setActiveProgress(null);

    const updatedUser = {
      ...currentUser,
      points: newPoints,
      current_streak: newStreak
    };
    setCurrentUser(updatedUser);
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));

    showToast(`🎉 Congratulations! You completed ${skill.name} and earned +10 points!`);
    await refreshAppData(currentUser.id);
  };

  // Add Extra Time to Active Challenge
  const handleAddExtraTime = async (extraDays: number, extraHours: number) => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const currentDeadline = new Date(activeProgress.deadline_at);
    const extraMs = (extraDays * 24 + extraHours) * 60 * 60 * 1000;
    const newDeadline = new Date(currentDeadline.getTime() + extraMs);
    const newDeadlineIso = newDeadline.toISOString();

    const updatedProgress: UserProgress = {
      ...activeProgress,
      deadline_at: newDeadlineIso
    };

    setActiveProgress(updatedProgress);
    showToast(`Added ${extraDays > 0 ? `${extraDays}d ` : ''}${extraHours > 0 ? `${extraHours}h` : ''} to your active challenge!`);

    await addExtraTimeToProgress(activeProgress.id, newDeadlineIso);
  };

  // Toggle Step Checkmark in Active Challenge
  const handleToggleStep = async (stepOrder: number) => {
    if (!activeProgress) return;
    const currentSteps = activeProgress.steps_completed || [];
    const newSteps = currentSteps.includes(stepOrder)
      ? currentSteps.filter(s => s !== stepOrder)
      : [...currentSteps, stepOrder];

    const updated = {
      ...activeProgress,
      steps_completed: newSteps
    };
    setActiveProgress(updated);

    try {
      await supabase
        .from('user_progress')
        .update({ steps_completed: newSteps })
        .eq('id', activeProgress.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Open Public Profile
  const handleOpenUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentPage('profile');
  };

  // Admin Ban Toggle
  const handleBanToggle = async (userId: string) => {
    const userToToggle = profiles.find(p => p.id === userId);
    if (!userToToggle) return;

    // Prevent banning self or any admin
    if (
      userToToggle.id === currentUser?.id ||
      userToToggle.is_admin ||
      (userToToggle.email || '').toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()
    ) {
      showToast('Admin accounts cannot be banned.');
      return;
    }

    const newStatus = !userToToggle.is_banned;
    await updateProfile(userId, { is_banned: newStatus });
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, is_banned: newStatus } : p));
    showToast(`${userToToggle.full_name} is now ${newStatus ? 'Banned' : 'Active'}`);
  };

  // Admin Add/Edit Skill
  const handleSaveSkill = (skillData: Partial<Skill>) => {
    if (editingSkill) {
      setSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...skillData } as Skill : s));
      showToast(`Updated skill: ${skillData.name}`);
    } else {
      const newSkill: Skill = {
        id: `skill-${Date.now()}`,
        field_id: skillData.field_id || 'field-1',
        name: skillData.name || 'New Skill',
        description: skillData.description || '',
        order_index: skills.length + 1,
        icon: skillData.icon || '★',
        bg_color: skillData.bg_color || '#6c5ce7',
        difficulty: skillData.difficulty || 'Beginner',
        avg_days: skillData.avg_days || '3 days',
        learner_count: 0,
        step_count: 3
      };
      setSkills(prev => [...prev, newSkill]);
      showToast(`Added new skill: ${newSkill.name}`);
    }
    setIsSkillModalOpen(false);
    setEditingSkill(null);
  };

  const handleDeleteSkill = (skillId: string) => {
    const skillToDelete = skills.find(s => s.id === skillId);
    if (confirm(`Are you sure you want to delete "${skillToDelete?.name}"?`)) {
      setSkills(prev => prev.filter(s => s.id !== skillId));
      showToast(`Skill deleted`);
    }
  };

  const handleSaveField = (fieldData: Partial<Field>) => {
    if (editingField) {
      setFields(prev => prev.map(f => f.id === editingField.id ? { ...f, ...fieldData } as Field : f));
      showToast(`Updated field: ${fieldData.name}`);
    } else {
      const newField: Field = {
        id: fieldData.id || `field-${Date.now()}`,
        name: fieldData.name || 'New Field',
        description: fieldData.description || '',
        icon: fieldData.icon || '💻'
      };
      setFields(prev => [...prev, newField]);
      showToast(`Added new field: ${newField.name}`);
    }
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    const fieldToDelete = fields.find(f => f.id === fieldId);
    if (confirm(`Are you sure you want to delete category "${fieldToDelete?.name}"?`)) {
      setFields(prev => prev.filter(f => f.id !== fieldId));
      showToast(`Field category deleted`);
    }
  };

  // Admin Add Step
  const handleAddStep = (stepData: Partial<RoadmapStep>) => {
    const newStep: RoadmapStep = {
      id: `step-${Date.now()}`,
      skill_id: currentSkill.id,
      title: stepData.title || 'New Step',
      description: stepData.description || '',
      step_order: currentSkillSteps.length + 1,
      resource_link: stepData.resource_link
    };

    setRoadmapSteps(prev => ({
      ...prev,
      [currentSkill.id]: [...(prev[currentSkill.id] || []), newStep]
    }));

    setIsStepModalOpen(false);
    showToast(`Added step "${newStep.title}" to ${currentSkill.name}`);
  };

  const handleDeleteStep = (skillId: string, stepId: string) => {
    setRoadmapSteps(prev => ({
      ...prev,
      [skillId]: (prev[skillId] || []).filter(st => st.id !== stepId)
    }));
    showToast(`Roadmap step deleted`);
  };

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#1a1c2e] font-sans antialiased">
      
      {currentUser && currentUser.is_banned && !currentUser.is_admin && (
        <div className="fixed inset-0 z-[100] bg-[#111322] flex items-center justify-center p-6 text-white font-sans antialiased">
          <div className="bg-[#1a1c2e] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/10">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black mb-2 text-white">Account Suspended</h1>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Your account (<span className="text-[#37f0ff] font-semibold">{currentUser.full_name}</span>) has been banned and suspended by the system administrator. You cannot access SkillTrack resources, roadmaps, or leaderboards until your account is unbanned.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-xs text-slate-400 space-y-1">
              <div>Contact DIU Admin / Support:</div>
              <div className="text-white font-bold">{ADMIN_EMAIL}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-8 right-4 sm:right-6 z-50 bg-[#1a1c2e] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/15 animate-fade-in text-sm font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00b894] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation Bar */}
      {currentUser && currentUser.id && (
        <Navbar 
          currentPage={currentPage}
          setCurrentPage={(page) => {
            if (page === 'discover') {
              setDiscoverView('main');
              setSelectedFieldId(null);
            }
            if (page === 'profile') {
              setSelectedUserId(currentUser.id);
            }
            setCurrentPage(page);
          }}
          onNavigate={(page) => {
            if (page === 'discover') {
              setDiscoverView('main');
              setSelectedFieldId(null);
            }
            if (page === 'profile') {
              setSelectedUserId(currentUser.id);
            }
            setCurrentPage(page);
          }}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onSelectUserForProfile={(userId) => {
            setSelectedUserId(userId);
            setCurrentPage('profile');
          }}
          onOpenSendFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenMyFeedback={() => setIsMyFeedbackModalOpen(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 1 — LOGIN / SIGNUP */}
      {/* ========================================================================= */}
      {(currentPage === 'login' || currentPage === 'signup') && (
        <LandingPage 
          authMode={authMode}
          setAuthMode={setAuthMode}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authName={authName}
          setAuthName={setAuthName}
          authLoading={authLoading}
          authError={authError}
          setAuthError={setAuthError}
          handleAuthSubmit={handleAuthSubmit}
          onForgotPassword={async (email) => {
            console.log('[Supabase Auth] Requesting resetPasswordForEmail for:', email);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin
            });
            if (error) {
              console.error('[Supabase Auth] resetPasswordForEmail failed:', error);
              if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('rate_limit') || (error as any).status === 429) {
                const friendlyMsg = 'A reset email was already sent recently. Please check your inbox (including spam) or wait 60 seconds.';
                setAuthError(friendlyMsg);
                throw new Error(friendlyMsg);
              }
              setAuthError(error.message);
              throw error;
            }
            console.log('[Supabase Auth] resetPasswordForEmail success for:', email);
            setAuthError(null);
            showToast('Password reset email sent! Check your inbox.');
          }}
          onSendMagicLink={async (email) => {
            console.log('[Supabase Auth] Requesting signInWithOtp for:', email);
            const { error } = await supabase.auth.signInWithOtp({
              email,
              options: {
                emailRedirectTo: window.location.origin
              }
            });
            if (error) {
              console.error('[Supabase Auth] signInWithOtp failed:', error);
              if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('rate_limit') || (error as any).status === 429) {
                const friendlyMsg = 'A login email was already sent recently. Please check your inbox (including spam) or wait 60 seconds.';
                setAuthError(friendlyMsg);
                throw new Error(friendlyMsg);
              }
              setAuthError(error.message);
              throw error;
            }
            console.log('[Supabase Auth] signInWithOtp success for:', email);
            setAuthError(null);
            showToast('Magic login link sent to your email!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 2 — PROFILE SETUP & SETTINGS */}
      {/* ========================================================================= */}
      {currentPage === 'profile-setup' && (
        <div className="page" id="page-profile-setup">
          <div className="page-tag">PAGE 2 — STUDENT PROFILE SETTINGS</div>

          <div className="profile-edit-wrapper">
            
            {/* Header / Breadcrumb Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                {currentUser.profile_completed && (
                  <button 
                    onClick={() => setCurrentPage('profile')}
                    className="text-xs font-bold text-[#6c5ce7] hover:underline flex items-center gap-1.5 mb-2 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to My Profile
                  </button>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c2e] tracking-tight">
                  {currentUser.profile_completed ? 'Edit Profile & Settings' : 'Complete Your Profile'}
                </h1>
                <p className="text-xs text-[#8a8ca3] mt-1">
                  Keep your academic credentials and peer contact channels accurate for leaderboard rankings.
                </p>
              </div>

              {currentUser.email && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs font-semibold text-[#64748b] shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{currentUser.email}</span>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {setupError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-600 text-xs font-semibold flex items-center gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{setupError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSetup}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Identity Preview & Avatar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="profile-edit-card text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8a8ca3] mb-4">
                      Profile Avatar
                    </div>

                    {/* Interactive Avatar Upload */}
                    <div className="relative inline-block mb-3">
                      <div className="profile-avatar-uploader">
                        {setupAvatarPreview ? (
                          <img src={setupAvatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-3xl font-black">
                            {setupFullName ? setupFullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DIU'}
                          </span>
                        )}
                        <label 
                          htmlFor="avatar-file-input" 
                          className="avatar-overlay"
                        >
                          <Camera className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold">Change Photo</span>
                        </label>
                      </div>

                      <input 
                        id="avatar-file-input"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarFileChange}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <label 
                        htmlFor="avatar-file-input"
                        className="text-xs font-bold text-[#6c5ce7] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload New
                      </label>
                      {setupAvatarPreview && (
                        <>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() => setSetupAvatarPreview(null)}
                            className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </>
                      )}
                    </div>

                    {/* Preview Student Identity Card */}
                    <div className="pt-4 border-t border-[#f1f5f9] text-left space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a8ca3]">Live Preview</div>
                      <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                        <div className="font-bold text-sm text-[#1a1c2e] truncate">
                          {setupFullName || 'Student Name'}
                        </div>
                        <div className="text-xs text-[#64748b] mt-0.5">
                          {setupDepartment || 'Dept'} · {setupBatch || 'Batch'}
                        </div>
                        <div className="text-[11px] font-mono text-[#8a8ca3] mt-1">
                          ID: {setupRoll || 'Not Set'}
                        </div>
                      </div>
                    </div>

                    {/* Academic Stat Pill */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="text-xs font-black text-[#6c5ce7]">⚡ {currentUser.points}</div>
                        <div className="text-[10px] text-[#64748b] font-medium">Total Points</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                        <div className="text-xs font-black text-orange-600">🔥 {currentUser.current_streak}d</div>
                        <div className="text-[10px] text-[#64748b] font-medium">Active Streak</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Academic & Social Forms (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Card 1: Academic Credentials */}
                  <div className="profile-edit-card space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#f1f5f9]">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6c5ce7] flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1c2e]">Academic Credentials</h3>
                        <p className="text-[11px] text-[#8a8ca3]">Official university details verified for batch-wise leaderboards.</p>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="input-with-icon-wrap">
                        <User className="icon-leading" />
                        <input 
                          type="text" 
                          className="input-styled" 
                          placeholder="e.g. Md. Sohan Ali"
                          value={setupFullName}
                          onChange={(e) => setSetupFullName(e.target.value)}
                          required
                          id="input-setup-fullname"
                        />
                      </div>
                    </div>

                    {/* Department & Batch Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          Department <span className="text-rose-500">*</span>
                        </label>
                        <div className="input-with-icon-wrap">
                          <Building2 className="icon-leading" />
                          <input 
                            type="text"
                            list="dept-datalist-options"
                            className="input-styled"
                            placeholder="e.g. Department of CSE, SWE, EEE..."
                            value={setupDepartment}
                            onChange={(e) => setSetupDepartment(e.target.value)}
                            required
                            id="input-setup-dept"
                          />
                          <datalist id="dept-datalist-options">
                            <option value="Department of CSE" />
                            <option value="Department of SWE" />
                            <option value="Department of CIS" />
                            <option value="Department of EEE" />
                            <option value="Department of Civil Engineering" />
                            <option value="Department of Pharmacy" />
                            <option value="Department of BBA" />
                            <option value="Department of English" />
                            <option value="Department of Journalism" />
                          </datalist>
                        </div>
                        <p className="text-[11px] text-[#8a8ca3] mt-1">
                          You can choose from suggestions or type your custom department name.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          Batch Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="input-with-icon-wrap">
                          <Hash className="icon-leading" />
                          <input 
                            type="text"
                            list="batch-datalist-options"
                            className="input-styled"
                            placeholder="e.g. Batch 55, Batch 56..."
                            value={setupBatch}
                            onChange={(e) => setSetupBatch(e.target.value)}
                            required
                            id="input-setup-batch"
                          />
                          <datalist id="batch-datalist-options">
                            <option value="Batch 50" />
                            <option value="Batch 51" />
                            <option value="Batch 52" />
                            <option value="Batch 53" />
                            <option value="Batch 54" />
                            <option value="Batch 55" />
                            <option value="Batch 56" />
                            <option value="Batch 57" />
                            <option value="Batch 58" />
                            <option value="Batch 59" />
                            <option value="Batch 60" />
                            <option value="Batch 61" />
                            <option value="Batch 62" />
                            <option value="Batch 63" />
                            <option value="Batch 64" />
                            <option value="Batch 65" />
                          </datalist>
                        </div>
                        <p className="text-[11px] text-[#8a8ca3] mt-1">
                          Type your batch (e.g. Batch 55) for cohort ranking.
                        </p>
                      </div>
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                        Student ID / Roll Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="input-with-icon-wrap">
                        <Hash className="icon-leading" />
                        <input 
                          type="text" 
                          className="input-styled" 
                          placeholder="e.g. 221-15-5001"
                          value={setupRoll}
                          onChange={(e) => setSetupRoll(e.target.value)}
                          required
                          id="input-setup-roll"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Social & Peer Communication Contacts */}
                  <div className="profile-edit-card space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#f1f5f9]">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1c2e]">Peer Contact &amp; Social Links</h3>
                        <p className="text-[11px] text-[#8a8ca3]">
                          Provide at least one channel so study peers and faculty can reach you directly.
                        </p>
                      </div>
                    </div>

                    {/* Facebook */}
                    <div>
                      <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                        Facebook Profile URL or Username
                      </label>
                      <div className="input-with-icon-wrap">
                        <span className="icon-leading text-blue-600 font-bold text-sm">f</span>
                        <input 
                          type="text" 
                          className="input-styled" 
                          placeholder="e.g. facebook.com/sohanali or @sohanali"
                          value={setupFb}
                          onChange={(e) => setSetupFb(e.target.value)}
                          id="input-setup-fb"
                        />
                      </div>
                    </div>

                    {/* Telegram & WhatsApp Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          Telegram Handle / Username
                        </label>
                        <div className="input-with-icon-wrap">
                          <MessageSquare className="icon-leading text-sky-500" />
                          <input 
                            type="text" 
                            className="input-styled" 
                            placeholder="e.g. @sohanali or t.me/sohanali"
                            value={setupTelegram}
                            onChange={(e) => setSetupTelegram(e.target.value)}
                            id="input-setup-telegram"
                          />
                        </div>
                        <p className="text-[10px] text-[#8a8ca3] mt-1">Accepts username, @handle or link</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          WhatsApp Number or Username
                        </label>
                        <div className="input-with-icon-wrap">
                          <Phone className="icon-leading text-emerald-500" />
                          <input 
                            type="text" 
                            className="input-styled" 
                            placeholder="e.g. +8801700000000 or @username / wa.me/..."
                            value={setupWhatsapp}
                            onChange={(e) => setSetupWhatsapp(e.target.value)}
                            id="input-setup-whatsapp"
                          />
                        </div>
                        <p className="text-[10px] text-[#8a8ca3] mt-1">Accepts phone number, username or link</p>
                      </div>
                    </div>
                  </div>

                  {/* Prominent, Centered & Large Action Buttons */}
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 mb-20 flex flex-col items-center justify-center gap-5 shadow-sm text-center">
                    <div className="text-xs sm:text-sm text-[#64748b] font-medium">
                      Changes will be saved immediately and synced live to your Supabase cloud profile.
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
                      {currentUser.profile_completed && (
                        <button
                          type="button"
                          onClick={() => setCurrentPage('profile')}
                          className="min-w-[160px] px-8 py-4 rounded-2xl border-2 border-[#e2e8f0] text-base font-bold text-[#475569] hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#1e293b] transition-all cursor-pointer shadow-xs active:scale-98"
                        >
                          Discard
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="min-w-[220px] px-10 py-4 bg-[#6c5ce7] hover:bg-[#5b4cc4] text-white text-base font-extrabold rounded-2xl transition-all shadow-xl shadow-[#6c5ce7]/30 flex items-center justify-center gap-3 cursor-pointer active:scale-98"
                        disabled={setupLoading}
                        id="btn-save-profile-setup"
                      >
                        {setupLoading ? (
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-6 h-6" />
                        )}
                        <span>{currentUser.profile_completed ? 'Save Changes' : 'Save & Enter Skill Hub →'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3 — DISCOVER SKILLS & FIELDS */}
      {/* ========================================================================= */}
      {currentPage === 'discover' && (
        <div className="page" id="page-discover">
          <div className="page-tag">PAGE 3 — DISCOVER SKILLS &amp; FIELDS</div>

          <div className="content">
            
            {/* Real Dynamic Hero Banner */}
            <div className="hero-banner shadow-lg">
              <div className="hero-text">
                <h1>Level up your skills, {getMainName(currentUser.full_name)}.</h1>
                <p>Pick a roadmap, challenge your limits, beat the deadline and earn points to rank #1 in your batch.</p>
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
                  <b>{userBatchRank}</b>
                  <span>in batch</span>
                </div>
              </div>
            </div>

            {/* Active Challenge Banner in Discover (If user has an active challenge) */}
            {activeProgress && activeProgress.status === 'in_progress' && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#6c5ce7] to-[#8075ff] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                    {skills.find(s => s.id === activeProgress.skill_id)?.icon || '⚡'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/80">Active Timed Challenge</div>
                    <div className="text-base font-bold">{skills.find(s => s.id === activeProgress.skill_id)?.name || 'Active Skill'}</div>
                    <div className="text-xs text-white/90 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {timeRemaining.isExpired 
                          ? 'Expired' 
                          : `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white text-[#6c5ce7] text-xs font-bold rounded-xl hover:bg-white/95 transition-colors shadow-sm"
                  >
                    Go to Challenge →
                  </button>
                  <button
                    onClick={handleCompleteActiveChallenge}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#00b894] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Complete (+10 pts)
                  </button>
                </div>
              </div>
            )}

            {/* Sub-view switcher for Discover */}
            {discoverView === 'main' && (
              <>
                {/* 2 Main Choice Cards: Browse by Field & Browse by Skill */}
                <div className="choice-grid" id="discover-choice-grid">
                  <div 
                    className="choice-card c1 cursor-pointer"
                    onClick={() => setDiscoverView('fields')}
                    id="card-browse-by-field"
                  >
                    <div className="icon-badge">🧭</div>
                    <h3>Browse by Field</h3>
                    <p>Explore roadmap tracks organized by software fields — Web, AI, DevOps, Mobile &amp; more.</p>
                  </div>

                  <div 
                    className="choice-card c2 cursor-pointer"
                    onClick={() => setDiscoverView('all-skills')}
                    id="card-browse-by-skill"
                  >
                    <div className="icon-badge">⚡</div>
                    <h3>Browse by Skill</h3>
                    <p>Pick a specific technology roadmap like React, Node.js, Python, Flutter &amp; more.</p>
                  </div>
                </div>

                {/* Search Bar (Line 1) */}
                <div className="search-wrapper w-full mb-3">
                  <span className="search-icon-inside">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search skills (HTML, React, Python, C++, Docker)..."
                    className="search-input-field"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="input-search-skills"
                  />
                </div>

                {/* Category / Fields Filter Row (Line 2) */}
                <div className="flex items-center gap-2 mb-2.5 overflow-hidden">
                  <div className="filter-pills-row flex-1">
                    <button 
                      onClick={() => setFieldFilter(null)}
                      className={`filter-pill-btn ${!fieldFilter ? 'active' : 'inactive'}`}
                      id="pill-filter-all-fields"
                    >
                      All Fields
                    </button>
                    {fields.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => setFieldFilter(f.id === fieldFilter ? null : f.id)}
                        className={`filter-pill-btn ${fieldFilter === f.id ? 'active-accent' : 'inactive'}`}
                        id={`pill-filter-${f.id}`}
                      >
                        {f.name}
                      </button>
                    ))}
                    <button 
                      onClick={() => setDiscoverView('fields')}
                      className="filter-pill-link"
                      id="btn-view-all-fields-link"
                    >
                      View all fields →
                    </button>
                  </div>
                </div>

                {/* Skills Row with All Skills option (Line 3) */}
                <div className="flex items-center gap-2 mb-6 overflow-hidden">
                  <div className="filter-pills-row flex-1">
                    <button 
                      onClick={() => setSkillFilter(null)}
                      className={`filter-pill-btn ${!skillFilter ? 'active-accent' : 'inactive'} flex items-center gap-1.5`}
                      id="pill-all-skills-option"
                    >
                      <span>⚡ All Skills</span>
                    </button>
                    {skills.slice(0, 10).map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSkillFilter(skillFilter === s.id ? null : s.id)}
                        className={`filter-pill-btn ${skillFilter === s.id ? 'active-accent' : 'inactive'} flex items-center gap-1.5`}
                        id={`pill-quick-skill-${s.id}`}
                      >
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => setDiscoverView('all-skills')}
                      className="filter-pill-link"
                      id="btn-view-all-skills-link"
                    >
                      Explore all {skills.length} skills →
                    </button>
                  </div>
                </div>

                {/* Popular Skill Tracks Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="section-title" style={{ margin: 0 }}>
                    {skillFilter 
                      ? `Selected Skill: ${skills.find(s => s.id === skillFilter)?.name || ''}` 
                      : fieldFilter 
                        ? `${fields.find(f => f.id === fieldFilter)?.name || ''} Roadmaps`
                        : 'Popular Roadmap Tracks'}
                  </div>
                  <div className="flex items-center gap-3">
                    {(skillFilter || fieldFilter || searchQuery) && (
                      <button
                        onClick={() => {
                          setSkillFilter(null);
                          setFieldFilter(null);
                          setSearchQuery('');
                        }}
                        className="text-xs text-[#e84393] font-bold cursor-pointer hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                    <span 
                      onClick={() => setDiscoverView('all-skills')}
                      className="text-xs text-[#6c5ce7] font-bold cursor-pointer hover:underline"
                    >
                      View all {skills.length} skills →
                    </span>
                  </div>
                </div>

                <div className="skills-grid">
                  {skills
                    .filter(s => !fieldFilter || s.field_id === fieldFilter)
                    .filter(s => !skillFilter || s.id === skillFilter)
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => {
                      const isActive = activeProgress?.skill_id === s.id && activeProgress?.status === 'in_progress';
                      return (
                        <div 
                          key={s.id} 
                          className="skill-card group hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedSkillId(s.id);
                            setCurrentPage('roadmap');
                          }}
                          id={`skill-card-${s.id}`}
                        >
                          <div className="icon" style={{ background: s.bg_color || '#6c5ce7' }}>
                            {s.icon}
                          </div>
                          <h4>{s.name}</h4>
                          <p>{s.description}</p>
                          <div className="meta">
                            <span className="diff">{s.difficulty || 'Beginner'}</span>
                            <span className="learners">
                              {isActive ? '⚡ In progress' : `⏱ ${s.avg_days || '3 days'}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Category Exploration Banner */}
                <div className="mt-10 mb-4 section-title">Explore by Domain</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {fields.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => {
                        setSelectedFieldId(f.id);
                        setDiscoverView('field-skills');
                      }}
                      className="p-5 rounded-2xl bg-white border border-[#e4e5ee] hover:border-[#6c5ce7] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl">{f.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-[#1a1c2e]">{f.name}</div>
                          <div className="text-xs text-[#8a8ca3]">{skills.filter(s => s.field_id === f.id).length} Roadmaps</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8a8ca3]" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Sub-view: All Fields */}
            {discoverView === 'fields' && (
              <div>
                <button 
                  onClick={() => setDiscoverView('main')}
                  className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Back to Discover
                </button>
                <div className="section-title">All Engineering Disciplines</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {fields.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => {
                        setSelectedFieldId(f.id);
                        setDiscoverView('field-skills');
                      }}
                      className="p-5 rounded-2xl bg-white border border-[#e4e5ee] hover:border-[#6c5ce7] transition-all cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <span className="text-3xl block mb-2">{f.icon}</span>
                      <div className="font-bold text-base text-[#1a1c2e] mb-1">{f.name}</div>
                      <div className="text-xs text-[#8a8ca3] mb-3">{f.description}</div>
                      <div className="text-xs font-bold text-[#6c5ce7] flex items-center gap-1">
                        View {skills.filter(s => s.field_id === f.id).length} Tracks <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Skills in Selected Field */}
            {discoverView === 'field-skills' && (
              <div>
                <button 
                  onClick={() => setDiscoverView('fields')}
                  className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Back to Disciplines
                </button>
                <div className="section-title">
                  {fields.find(f => f.id === selectedFieldId)?.name || 'Field'} Roadmaps
                </div>
                <div className="skills-grid">
                  {skills.filter(s => s.field_id === selectedFieldId).map(s => (
                    <div 
                      key={s.id}
                      className="skill-card cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        setSelectedSkillId(s.id);
                        setCurrentPage('roadmap');
                      }}
                    >
                      <div className="icon" style={{ background: s.bg_color || '#6c5ce7' }}>
                        {s.icon}
                      </div>
                      <h4>{s.name}</h4>
                      <p>{s.description}</p>
                      <div className="meta">
                        <span className="diff">{s.difficulty || 'Beginner'}</span>
                        <span className="learners">⏱ {s.avg_days || '3 days'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: All Skills */}
            {discoverView === 'all-skills' && (
              <div>
                <button 
                  onClick={() => setDiscoverView('main')}
                  className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Back to Discover
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
                  <div className="section-title" style={{ margin: 0 }}>All Available Roadmap Tracks ({skills.length})</div>
                  <div className="search-wrapper max-w-sm">
                    <span className="search-icon-inside">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Filter all roadmaps..."
                      className="search-input-field"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="skills-grid">
                  {skills
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(s => (
                    <div 
                      key={s.id}
                      className="skill-card cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        setSelectedSkillId(s.id);
                        setCurrentPage('roadmap');
                      }}
                    >
                      <div className="icon" style={{ background: s.bg_color || '#6c5ce7' }}>
                        {s.icon}
                      </div>
                      <h4>{s.name}</h4>
                      <p>{s.description}</p>
                      <div className="meta">
                        <span className="diff">{s.difficulty || 'Beginner'}</span>
                        <span className="learners">⏱ {s.avg_days || '3 days'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4 & 5 — ROADMAP STEPS & OVERVIEW */}
      {/* ========================================================================= */}
      {currentPage === 'roadmap' && (
        <div className="page" id="page-roadmap">
          <div className="page-tag">PAGE 4 &amp; 5 — ROADMAP STEPS &amp; OVERVIEW</div>

          <div className="content">
            
            <div className="flex items-center justify-between mb-5">
              <button 
                onClick={() => setCurrentPage('discover')}
                className="text-xs text-[#8a8ca3] hover:text-[#1a1c2e] font-bold flex items-center gap-1.5 transition-colors bg-white px-4 py-2.5 rounded-xl border border-[#e4e5ee] hover:border-[#6c5ce7] shadow-2xs"
                id="btn-back-to-discover"
              >
                ← Back to Discover &amp; Roadmaps
              </button>
              <div className="text-xs text-[#8a8ca3] font-medium hidden sm:block">
                Skill Track: <span className="font-bold text-[#1a1c2e]">{currentSkill.name}</span> ({currentSkillSteps.length} milestones)
              </div>
            </div>

            <div className="w-full max-w-4xl mx-auto">
              
              {/* Header info */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e4e5ee] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 min-w-14 rounded-2xl text-white font-extrabold flex items-center justify-center text-xl shadow-md"
                    style={{ background: currentSkill.bg_color || '#6c5ce7' }}
                  >
                    {currentSkill.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-2xl text-[#1a1c2e] leading-tight">{currentSkill.name}</h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#f1eefe] text-[#6c5ce7]">
                        {currentSkill.difficulty || 'Beginner'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#8a8ca3] max-w-xl leading-relaxed">{currentSkill.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {activeProgress?.skill_id === currentSkill.id && activeProgress?.status === 'in_progress' ? (
                    <button 
                      onClick={() => setCurrentPage('dashboard')}
                      className="btn-challenge-active w-full sm:w-auto"
                      id="btn-active-challenge-dashboard"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>⚡ Active Challenge (Go to Dashboard)</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsDeadlineModalOpen(true)}
                      className="btn-challenge-cta w-full sm:w-auto"
                      id="btn-start-challenge-roadmap"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>Start Timed Challenge</span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  )}
                </div>
              </div>

              {/* Steps List */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="section-title" style={{ margin: 0 }}>Roadmap Curriculum &amp; Milestones</div>
                <span className="text-xs text-[#8a8ca3] font-semibold">{currentSkillSteps.length} Steps to Complete</span>
              </div>

              {currentSkillSteps.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-[#8a8ca3] text-xs border border-[#e4e5ee]">
                  No roadmap steps listed yet for this skill track.
                </div>
              ) : (
                currentSkillSteps.map((st, idx) => (
                  <div key={st.id} className="step-card" id={`step-card-${st.id}`}>
                    <div className="step-num">{idx + 1}</div>
                    <div className="step-body">
                      <h5>{st.title}</h5>
                      <p>{st.description}</p>
                      {st.resource_link && (
                        <a 
                          href={st.resource_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="resource-link inline-flex items-center gap-1.5 text-xs font-bold text-[#6c5ce7] hover:underline mt-2.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Official Documentation &amp; Reference <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 6 — DASHBOARD / ACTIVE CHALLENGE */}
      {/* ========================================================================= */}
      {currentPage === 'dashboard' && (
        <div className="page" id="page-dashboard">
          <div className="page-tag">PAGE 6 — DASHBOARD / ACTIVE CHALLENGE</div>

          <div className="content">
            
            {/* Real Stats Mini Grid */}
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
                <div className="val">
                  {allCompletedProgress.filter(cp => cp.user_id === currentUser.id).length}
                </div>
                <div className="lbl">skills completed</div>
              </div>
              <div className="stat-mini">
                <div className="val">{userBatchRank}</div>
                <div className="lbl">batch rank</div>
              </div>
            </div>

            {/* Active Challenge Card */}
            {activeProgress && activeProgress.status === 'in_progress' ? (
              <div className="active-card shadow-sm border border-[#e4e5ee]" id="dashboard-active-challenge-card">
                
                {/* Header info */}
                <div className="active-card-top pb-4 border-b border-[#f0f1f7]">
                  <div className="active-card-title">
                    <span 
                      className="w-12 h-12 rounded-2xl text-white font-extrabold flex items-center justify-center text-lg shadow-md"
                      style={{ background: skills.find(s => s.id === activeProgress.skill_id)?.bg_color || '#6c5ce7' }}
                    >
                      {skills.find(s => s.id === activeProgress.skill_id)?.icon || '⚡'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4>{skills.find(s => s.id === activeProgress.skill_id)?.name || 'Active Skill'}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f1eefe] text-[#6c5ce7]">
                          Challenge
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8ca3] mt-0.5">
                        Finish all checkpoints before the deadline to earn points &amp; streak!
                      </p>
                    </div>
                  </div>
                  <div className="active-badge">
                    <span className="w-2 h-2 rounded-full bg-[#00b894] animate-pulse"></span>
                    <span>LIVE CHALLENGE</span>
                  </div>
                </div>

                {/* Real Live Countdown Timer */}
                <div className="my-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#8a8ca3] uppercase tracking-wider">Time Remaining:</span>
                    <span className="text-xs font-bold text-[#6c5ce7]">{timeRemaining.percent}% time left</span>
                  </div>
                  
                  <div className="countdown-grid">
                    <div className="count-unit">
                      <b>{String(timeRemaining.days).padStart(2, '0')}</b>
                      <span>Days</span>
                    </div>
                    <div className="count-unit">
                      <b>{String(timeRemaining.hours).padStart(2, '0')}</b>
                      <span>Hours</span>
                    </div>
                    <div className="count-unit">
                      <b>{String(timeRemaining.minutes).padStart(2, '0')}</b>
                      <span>Mins</span>
                    </div>
                    <div className="count-unit">
                      <b>{String(timeRemaining.seconds).padStart(2, '0')}</b>
                      <span>Secs</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#f0f1f7] h-2.5 rounded-full overflow-hidden border border-[#e4e5ee] mt-3">
                    <div 
                      className="bg-linear-to-r from-[#6c5ce7] to-[#a29bfe] h-full rounded-full transition-all duration-1000"
                      style={{ width: `${timeRemaining.percent}%` }}
                    />
                  </div>
                </div>

                {/* Steps Checklist */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="section-title" style={{ fontSize: '13px', margin: 0 }}>
                      Roadmap Checkpoints
                    </div>
                    <span className="text-xs text-[#8a8ca3] font-semibold">
                      {(activeProgress.steps_completed || []).length} / {(roadmapSteps[activeProgress.skill_id] || []).length} Completed
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {(roadmapSteps[activeProgress.skill_id] || []).map((step, idx) => {
                      const isChecked = (activeProgress.steps_completed || []).includes(step.step_order);
                      return (
                        <div 
                          key={step.id}
                          onClick={() => handleToggleStep(step.step_order)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${isChecked ? 'bg-[#00b894]/8 border-[#00b894]/30 shadow-2xs' : 'bg-white border-[#e4e5ee] hover:border-[#6c5ce7] hover:bg-[#fafbff]'}`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-extrabold transition-all ${isChecked ? 'bg-[#00b894] text-white shadow-xs' : 'border-2 border-[#c8cad6] text-transparent'}`}>
                            ✓
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-bold ${isChecked ? 'text-[#00b894] line-through' : 'text-[#1a1c2e]'}`}>
                              {idx + 1}. {step.title}
                            </div>
                            {step.description && (
                              <div className="text-[11px] text-[#8a8ca3] truncate mt-0.5">
                                {step.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Challenge Action Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-[#f0f1f7]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button 
                      onClick={handleCompleteActiveChallenge}
                      className="px-6 py-3 bg-[#00b894] hover:bg-[#00a383] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#00b894]/25 flex items-center justify-center gap-2"
                      id="btn-complete-challenge"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Challenge (+10 pts)</span>
                    </button>

                    <button 
                      onClick={() => setIsAddTimeModalOpen(true)}
                      className="px-4 py-3 bg-white border border-[#e4e5ee] text-[#1a1c2e] hover:bg-[#f4f5f8] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      id="btn-add-extra-time"
                    >
                      <Clock className="w-4 h-4 text-[#6c5ce7]" />
                      <span>Add Extra Time</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-4 py-2.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs font-bold rounded-xl transition-colors text-center sm:text-right"
                    id="btn-cancel-challenge"
                  >
                    Cancel Challenge
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-[#e4e5ee] rounded-2xl p-8 mb-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#6c5ce7]/10 text-[#6c5ce7] mx-auto flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-[#1a1c2e] mb-1">No Active Timed Challenge</h4>
                <p className="text-xs text-[#8a8ca3] max-w-sm mx-auto mb-4">
                  Select a skill track from the discover roadmaps and set your custom sprint deadline to earn +10 points.
                </p>
                <button 
                  onClick={() => setCurrentPage('discover')}
                  className="px-5 py-2.5 bg-[#6c5ce7] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-[#6c5ce7]/20"
                >
                  Pick a Skill to Learn →
                </button>
              </div>
            )}

            {/* Badges & History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Badges Unlocked */}
              <div>
                <div className="section-title">Milestones &amp; Badges</div>
                <div className="badge-grid">
                  {badges.map((badge) => {
                    const isUnlocked = userBadgeIds.includes(badge.id);

                    return (
                      <div 
                        key={badge.id}
                        className={`badge-item ${isUnlocked ? '' : 'badge-locked'}`}
                      >
                        <div 
                          className="badge-circle" 
                          style={{ background: isUnlocked ? (badge.bg_color || '#6c5ce7') : '#b2bec3' }}
                        >
                          {isUnlocked ? (badge.icon_symbol || '★') : '🔒'}
                        </div>
                        <div>
                          <h5>{badge.name}</h5>
                          <p>{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Completed Skills History */}
              <div>
                <div className="section-title">Completed Skills History</div>
                {allCompletedProgress.filter(cp => cp.user_id === currentUser.id).length > 0 ? (
                  allCompletedProgress
                    .filter(cp => cp.user_id === currentUser.id)
                    .map((cs) => {
                      const sk = skills.find(s => s.id === cs.skill_id) || { name: 'Skill', icon: 'S', bg_color: '#6c5ce7' };
                      return (
                        <div key={cs.id} className="completed-skill-card">
                          <div className="icon" style={{ background: sk.bg_color || '#e84393' }}>
                            {sk.icon || 'S'}
                          </div>
                          <div className="info">
                            <h5>{sk.name}</h5>
                            <p>Finished on time (+10 pts)</p>
                          </div>
                          <div className="time-badge">Completed</div>
                        </div>
                      );
                    })
                ) : (
                  <div className="bg-white border border-[#e4e5ee] rounded-2xl p-6 text-center text-xs text-[#8a8ca3]">
                    No completed challenges yet. Finish your active sprint to earn your first completion badge!
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 7 — LEADERBOARD */}
      {/* ========================================================================= */}
      {currentPage === 'leaderboard' && (() => {
        const userRank = filteredLeaderboardProfiles.findIndex(p => p.id === currentUser.id) + 1;
        const batchTabs = [
          { id: 'All departments', label: 'All Students' },
          { id: 'Batch 55', label: 'Batch 55' },
          { id: 'Batch 56', label: 'Batch 56' },
          { id: 'Batch 57', label: 'Batch 57' },
        ];

        return (
          <div className="page" id="page-leaderboard">
            <div className="page-tag">PAGE 7 — LEADERBOARD</div>

            <div className="content">
              
              {/* Leaderboard Header Banner */}
              <div className="bg-white border border-[#e4e5ee] rounded-2xl p-5 sm:p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#1a1c2e] tracking-tight">
                      Campus Leaderboard
                    </h2>
                  </div>
                  <p className="text-xs text-[#8a8ca3] max-w-md">
                    Live peer rankings based on completed skill challenges and streak consistency.
                  </p>
                </div>

                {/* User's quick rank status */}
                <div className="flex items-center gap-2.5 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-xl self-stretch sm:self-auto justify-between sm:justify-start">
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-[#8a8ca3] tracking-wider">Your Position</div>
                    <div className="text-sm font-black text-[#1a1c2e] flex items-center gap-1.5">
                      {userRank > 0 ? (
                        <span className="text-[#6c5ce7]">#{userRank} on Board</span>
                      ) : (
                        <span className="text-[#8a8ca3]">Unranked</span>
                      )}
                    </div>
                  </div>
                  <div className="w-[1px] h-7 bg-[#e2e8f0] mx-1" />
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] uppercase font-bold text-[#8a8ca3] tracking-wider">Total Score</div>
                    <div className="text-sm font-black text-[#6c5ce7] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#6c5ce7]" />
                      {currentUser.points} pts
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="lb-filter-row">
                {batchTabs.map(tab => {
                  const count = tab.id === 'All departments' 
                    ? profiles.length 
                    : profiles.filter(p => p.batch_number === tab.id).length;
                  const isActive = selectedBatchFilter === tab.id;

                  return (
                    <button 
                      key={tab.id}
                      type="button"
                      className={`lb-filter-btn cursor-pointer select-none ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedBatchFilter(tab.id)}
                      id={`btn-lb-filter-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Top 3 3D Podium */}
              {filteredLeaderboardProfiles.length > 0 && (
                <div className="podium-container">
                  
                  {/* #2 Silver (Left) */}
                  {top2 && (
                    <div 
                      className="podium-col silver"
                      onClick={() => handleOpenUserProfile(top2.id)}
                      id="podium-rank-2"
                    >
                      <div className="podium-avatar-wrap">
                        <div className="avatar-big">
                          {top2.avatar_url ? (
                            <img src={top2.avatar_url} alt={top2.full_name} className="w-full h-full object-cover" />
                          ) : (
                            top2.id === currentUser.id ? 'YO' : top2.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                      </div>
                      
                      <div className="podium-block">
                        <span className="text-[10px] tracking-wider uppercase opacity-75">SILVER</span>
                        <div className="podium-rank-num">2</div>
                      </div>

                      <div className="pname">
                        {top2.id === currentUser.id ? `${top2.full_name} (You)` : top2.full_name}
                      </div>
                      <div className="pmeta">
                        {top2.department} · {top2.batch_number}
                      </div>
                      <div className="ppts-pill">
                        🥈 {top2.points} pts
                      </div>
                    </div>
                  )}

                  {/* #1 Gold (Center) */}
                  {top1 && (
                    <div 
                      className="podium-col gold"
                      onClick={() => handleOpenUserProfile(top1.id)}
                      id="podium-rank-1"
                    >
                      <div className="podium-avatar-wrap">
                        <div className="podium-crown-icon">👑</div>
                        <div className="avatar-big">
                          {top1.avatar_url ? (
                            <img src={top1.avatar_url} alt={top1.full_name} className="w-full h-full object-cover" />
                          ) : (
                            top1.id === currentUser.id ? 'YO' : top1.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                      </div>
                      
                      <div className="podium-block">
                        <span className="text-[10px] tracking-wider uppercase opacity-80">CHAMPION</span>
                        <div className="podium-rank-num">1</div>
                      </div>

                      <div className="pname">
                        {top1.id === currentUser.id ? `${top1.full_name} (You)` : top1.full_name}
                      </div>
                      <div className="pmeta">
                        {top1.department} · {top1.batch_number}
                      </div>
                      <div className="ppts-pill">
                        🥇 {top1.points} pts
                      </div>
                    </div>
                  )}

                  {/* #3 Bronze (Right) */}
                  {top3 && (
                    <div 
                      className="podium-col bronze"
                      onClick={() => handleOpenUserProfile(top3.id)}
                      id="podium-rank-3"
                    >
                      <div className="podium-avatar-wrap">
                        <div className="avatar-big">
                          {top3.avatar_url ? (
                            <img src={top3.avatar_url} alt={top3.full_name} className="w-full h-full object-cover" />
                          ) : (
                            top3.id === currentUser.id ? 'YO' : top3.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                      </div>
                      
                      <div className="podium-block">
                        <span className="text-[10px] tracking-wider uppercase opacity-75">BRONZE</span>
                        <div className="podium-rank-num">3</div>
                      </div>

                      <div className="pname">
                        {top3.id === currentUser.id ? `${top3.full_name} (You)` : top3.full_name}
                      </div>
                      <div className="pmeta">
                        {top3.department} · {top3.batch_number}
                      </div>
                      <div className="ppts-pill">
                        🥉 {top3.points} pts
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Ranked List Table */}
              {filteredLeaderboardProfiles.length === 0 ? (
                <div className="bg-white border border-[#e4e5ee] rounded-2xl p-10 text-center shadow-xs">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#1a1c2e]">No students in this batch yet</h3>
                  <p className="text-xs text-[#8a8ca3] max-w-sm mx-auto mt-1 mb-4">
                    Be the first in this cohort to finish a skill challenge and take the top spot!
                  </p>
                  <button 
                    onClick={() => setCurrentPage('discover')} 
                    className="px-5 py-2.5 bg-[#6c5ce7] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-[#6c5ce7]/20"
                  >
                    Explore Roadmaps →
                  </button>
                </div>
              ) : (
                <div className="lb-table-card">
                  {/* Table Header */}
                  <div className="lb-table-header">
                    <div>Rank</div>
                    <div>Student</div>
                    <div className="hidden sm:block">Cohort & Track</div>
                    <div className="hidden sm:block text-center">Streak</div>
                    <div className="text-right">Points</div>
                  </div>

                  {/* Table Rows */}
                  {filteredLeaderboardProfiles.map((p, idx) => {
                    const rank = idx + 1;
                    const isYou = p.id === currentUser.id;
                    const initials = isYou ? 'YO' : p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);

                    return (
                      <div 
                        key={p.id} 
                        className={`lb-row-item ${isYou ? 'is-current-user' : ''}`}
                        onClick={() => handleOpenUserProfile(p.id)}
                        id={`lb-row-rank-${rank}`}
                      >
                        {/* Rank Badge */}
                        <div>
                          <div className={`lb-rank-badge ${
                            rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other'
                          }`}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                          </div>
                        </div>

                        {/* Student Name & Avatar */}
                        <div className="lb-student-info">
                          <div 
                            className="lb-student-avatar"
                            style={{ 
                              background: rank === 1 ? '#f59e0b' : (isYou ? '#6c5ce7' : '#1e293b')
                            }}
                          >
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="lb-student-name">
                              <span>{p.full_name}</span>
                              {isYou && <span className="lb-you-tag">YOU</span>}
                            </div>
                            <div className="text-[11px] text-[#8a8ca3] sm:hidden truncate">
                              {p.department} · {p.batch_number}
                            </div>
                          </div>
                        </div>

                        {/* Department / Batch (Desktop) */}
                        <div className="hidden sm:block lb-dept-pill truncate">
                          {p.department} · <span className="text-[#1a1c2e] font-bold">{p.batch_number}</span>
                        </div>

                        {/* Streak (Desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          {p.current_streak > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200/60">
                              🔥 {p.current_streak}d
                            </span>
                          ) : (
                            <span className="text-xs text-[#cbd5e1]">-</span>
                          )}
                        </div>

                        {/* Total Points */}
                        <div className="lb-points-val justify-end">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{p.points}</span>
                          <span className="text-[11px] text-[#8a8ca3] font-normal hidden sm:inline">pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        );
      })()}

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
                {targetProfile.avatar_url ? (
                  <img src={targetProfile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  targetProfile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                )}
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
                  <b>{targetBatchRank}</b>
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
                    <span>{targetProfile.department || 'CSE'}</span>
                  </div>
                  <div className="info-row">
                    <span>Batch</span>
                    <span>{targetProfile.batch_number || 'General'}</span>
                  </div>
                  <div className="info-row">
                    <span>Roll / ID</span>
                    <span>{targetProfile.roll_number || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span>Skills completed</span>
                    <span>{selectedUserCompletedProgress.length}</span>
                  </div>

                  <div className="social-links-row">
                    {targetProfile.fb_link && (
                      <a 
                        href={formatSocialLink('facebook', targetProfile.fb_link)}
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
                        href={formatSocialLink('telegram', targetProfile.telegram_link)}
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
                        href={formatSocialLink('whatsapp', targetProfile.whatsapp_link)}
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
                
                {selectedUserCompletedProgress.length > 0 ? (
                  selectedUserCompletedProgress.map((cs) => {
                    const sk = skills.find(s => s.id === cs.skill_id) || { name: 'Skill', icon: 'S', bg_color: '#6c5ce7' };
                    return (
                      <div key={cs.id} className="completed-skill-card">
                        <div className="icon" style={{ background: sk.bg_color || '#e84393' }}>
                          {sk.icon || 'S'}
                        </div>
                        <div className="info">
                          <h5>{sk.name}</h5>
                          <p>Finished on time (+10 pts)</p>
                        </div>
                        <div className="time-badge">Completed</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white border border-[#e4e5ee] rounded-2xl p-6 text-center text-xs text-[#8a8ca3]">
                    No completed skills recorded yet for this student.
                  </div>
                )}
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

              {/* Real Admin Stats Grid */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#6c5ce7' }}>👥</div>
                  <div className="val">{adminStats.totalUsers}</div>
                  <div className="lbl">Total users</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#00b894' }}>⚡</div>
                  <div className="val">{adminStats.activeChallenges}</div>
                  <div className="lbl">Active challenges right now</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#e17055' }}>🔥</div>
                  <div className="val">{adminStats.mostPopularSkillName}</div>
                  <div className="lbl">Most popular skill</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#fdcb6e' }}>🏆</div>
                  <div className="val">{adminStats.totalCompletions}</div>
                  <div className="lbl">Total completions</div>
                </div>
              </div>

              {/* Admin Tabs */}
              <div className="admin-tabs flex flex-wrap gap-2 mb-4">
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminTab('users')}
                >
                  Users ({profiles.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'fields' ? 'active' : ''}`}
                  onClick={() => setAdminTab('fields')}
                >
                  Fields &amp; Categories ({fields.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setAdminTab('skills')}
                >
                  Skill Tracks ({skills.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setAdminTab('steps')}
                >
                  Roadmap steps
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none flex items-center gap-1.5 ${adminTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setAdminTab('feedback')}
                  id="admin-tab-feedback"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </div>
              </div>

              {/* TAB: FIELDS / CATEGORIES */}
              {adminTab === 'fields' && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-[#1a1c2e]">Browse by Field Categories</div>
                    <button
                      onClick={() => {
                        setEditingField(null);
                        setIsFieldModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg hover:opacity-90 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Field Category
                    </button>
                  </div>
                  <div className="admin-table">
                    <div className="admin-table-head">
                      <div>Field Category</div>
                      <div>Description</div>
                      <div>Icon</div>
                      <div>Actions</div>
                    </div>
                    {fields.map((f) => (
                      <div key={f.id} className="admin-table-row">
                        <div className="font-bold flex items-center gap-2">
                          <span className="text-lg">{f.icon || '💻'}</span>
                          {f.name}
                        </div>
                        <div className="text-xs text-[#8a8ca3] truncate max-w-xs">{f.description || 'No description'}</div>
                        <div>{f.icon || '💻'}</div>
                        <div>
                          <button 
                            className="admin-action-btn hover:bg-slate-100"
                            onClick={() => {
                              setEditingField(f);
                              setIsFieldModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="admin-action-btn danger hover:bg-red-50"
                            onClick={() => handleDeleteField(f.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: REAL USERS TABLE */}
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
                      <div>{p.department || 'N/A'}</div>
                      <div>{p.batch_number || 'N/A'}</div>
                      <div className="font-bold">{p.points}</div>
                      <div>
                        <span className={`admin-badge-role ${p.is_banned ? 'bg-red-100 text-red-600' : ''}`}>
                          {p.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          className="admin-action-btn hover:bg-slate-100"
                          onClick={() => handleOpenUserProfile(p.id)}
                        >
                          View
                        </button>
                        {p.is_admin || p.id === currentUser?.id || (p.email || '').toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() ? (
                          <span className="text-[11px] text-[#8a8ca3] font-medium italic px-2 py-1 select-none">
                            Protected
                          </span>
                        ) : (
                          <button 
                            className="admin-action-btn danger hover:bg-red-50"
                            onClick={() => handleBanToggle(p.id)}
                          >
                            {p.is_banned ? 'Unban' : 'Ban'}
                          </button>
                        )}
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

            {/* TAB: FEEDBACK */}
            {adminTab === 'feedback' && (
              <AdminFeedbackSection 
                profiles={profiles}
                onOpenUserProfile={(userId) => {
                  setSelectedUserId(userId);
                  setCurrentPage('profile');
                }}
                showToast={showToast}
              />
            )}

            </div>
          )}
        </div>
      )}

      {/* Main Website Footer */}
      {currentUser && currentUser.id && currentPage !== 'login' && currentPage !== 'signup' && (
        <Footer 
          currentUser={currentUser}
          onNavigate={(page) => {
            if (page === 'discover') {
              setDiscoverView('main');
              setSelectedFieldId(null);
            }
            if (page === 'profile') {
              setSelectedUserId(currentUser.id);
            }
            setCurrentPage(page);
          }}
          onOpenSendFeedback={() => setIsFeedbackModalOpen(true)}
        />
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

      {/* Admin Field Add/Edit Modal */}
      <FieldModal 
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField(null);
        }}
        onSave={handleSaveField}
        initialData={editingField}
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

      {/* Password Recovery Modal */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryMode}
        onClose={() => setIsPasswordRecoveryMode(false)}
        onSaveNewPassword={handleSaveNewPassword}
        newPassword={newRecoveryPassword}
        setNewPassword={setNewRecoveryPassword}
        confirmPassword={confirmRecoveryPassword}
        setConfirmPassword={setConfirmRecoveryPassword}
        isLoading={isUpdatingPassword}
        onPasteRecoveryLink={handlePasteRecoveryLink}
      />

      {/* Send Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* User Feedback History Modal */}
      {currentUser && currentUser.id && (
        <UserFeedbackHistoryModal
          isOpen={isMyFeedbackModalOpen}
          onClose={() => setIsMyFeedbackModalOpen(false)}
          userId={currentUser.id}
          onOpenSendFeedback={() => setIsFeedbackModalOpen(true)}
        />
      )}

    </div>
  );
}
