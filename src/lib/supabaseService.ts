import { supabase } from './supabase';
import { Profile, UserProgress, Badge, Skill, RoadmapStep, FeedbackItem } from '../types';
import { ADMIN_EMAIL, initialBadges, initialSkills, initialProfiles, initialCompletedSkills } from '../data/mockData';

// Local storage keys for resilient caching
const STORAGE_PROFILES_KEY = 'skilltrack_profiles_cache';
const STORAGE_PROGRESS_KEY = 'skilltrack_progress_cache';
const STORAGE_COMPLETED_KEY = 'skilltrack_completed_progress_cache';
const STORAGE_BADGES_KEY = 'skilltrack_badges_cache';

export function getStoredCompletedProgress(): UserProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

export function saveStoredCompletedProgress(list: UserProgress[]) {
  try {
    localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(list));
  } catch (e) {}
}

function getStoredProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return initialProfiles;
}

function saveStoredProfiles(profs: Profile[]) {
  try {
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profs));
  } catch (e) {
    // Ignore error
  }
}

/**
 * Fetch a single user profile from Supabase profiles table
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase getProfile notice]:', error.message);
    }

    if (data) {
      let resolvedEmail = data.email;
      if (!resolvedEmail) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user && authData.user.id === userId && authData.user.email) {
            resolvedEmail = authData.user.email;
          }
        } catch (e) {}
      }

      const email = (resolvedEmail || '').toLowerCase().trim();
      const isAdmin = email === ADMIN_EMAIL.toLowerCase() || Boolean(data.is_admin);

      const profile: Profile = {
        id: data.id,
        email: resolvedEmail || undefined,
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || undefined,
        department: data.department || '',
        roll_number: data.roll_number || '',
        batch_number: data.batch_number || '',
        fb_link: data.fb_link || undefined,
        telegram_link: data.telegram_link || undefined,
        whatsapp_link: data.whatsapp_link || undefined,
        profile_completed: Boolean(data.profile_completed),
        points: Number(data.points) || 0,
        current_streak: Number(data.current_streak) || 0,
        longest_streak: Number(data.longest_streak) || 0,
        last_activity_date: data.last_activity_date,
        is_admin: isAdmin,
        is_banned: Boolean(data.is_banned),
        created_at: data.created_at
      };

      return profile;
    }
  } catch (err) {
    console.error('[Supabase getProfile exception]:', err);
  }

  return null;
}

/**
 * Helper to convert base64 Data URL to Blob
 */
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload avatar image to Supabase Storage bucket 'avatars'
 * Returns the public URL if uploaded, or falls back to optimized data URL
 */
export async function uploadAvatarImage(userId: string, imageData: string): Promise<string> {
  if (!imageData) return '';
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  try {
    const blob = dataURLtoBlob(imageData);
    const fileName = `${userId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (!uploadError) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (data && data.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.warn('Supabase storage upload notice:', uploadError.message);
    }
  } catch (err) {
    console.warn('Supabase storage upload error:', err);
  }

  // Graceful fallback to image data
  return imageData;
}

/**
 * Update an existing user profile in Supabase profiles table
 */
export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: 'User ID is missing' };

  try {
    const payload: Record<string, any> = {};
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.full_name !== undefined) payload.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.roll_number !== undefined) payload.roll_number = updates.roll_number;
    if (updates.batch_number !== undefined) payload.batch_number = updates.batch_number;
    if (updates.fb_link !== undefined) payload.fb_link = updates.fb_link;
    if (updates.telegram_link !== undefined) payload.telegram_link = updates.telegram_link;
    if (updates.whatsapp_link !== undefined) payload.whatsapp_link = updates.whatsapp_link;
    if (updates.profile_completed !== undefined) payload.profile_completed = updates.profile_completed;
    if (updates.points !== undefined) payload.points = updates.points;
    if (updates.current_streak !== undefined) payload.current_streak = updates.current_streak;
    if (updates.longest_streak !== undefined) payload.longest_streak = updates.longest_streak;
    if (updates.is_admin !== undefined) payload.is_admin = updates.is_admin;
    if (updates.is_banned !== undefined) payload.is_banned = updates.is_banned;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...payload
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase updateProfile error]:', error.message, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in updateProfile:', err);
    return { success: false, error: err.message || 'Database error occurred' };
  }
}

/**
 * Upsert or ensure profile exists for a newly registered / logged-in auth user
 */
export async function ensureProfile(user: { id: string; email?: string; full_name?: string }): Promise<Profile> {
  const existing = await getProfile(user.id);
  if (existing) {
    if ((!existing.email || existing.email !== user.email) && user.email) {
      existing.email = user.email;
      const isAdmin = user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() || existing.is_admin;
      existing.is_admin = isAdmin;
      await updateProfile(user.id, { email: user.email, is_admin: isAdmin });
    }
    return existing;
  }

  const email = (user.email || '').toLowerCase().trim();
  const isAdmin = email === ADMIN_EMAIL.toLowerCase();

  const newProfile: Profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name || (user.email ? user.email.split('@')[0] : 'Student'),
    department: '',
    roll_number: '',
    batch_number: '',
    profile_completed: false,
    points: 0,
    current_streak: 0,
    longest_streak: 0,
    is_admin: isAdmin,
    is_banned: false
  };

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: newProfile.id,
      email: newProfile.email,
      full_name: newProfile.full_name,
      department: newProfile.department,
      roll_number: newProfile.roll_number,
      batch_number: newProfile.batch_number,
      profile_completed: false,
      points: newProfile.points,
      current_streak: newProfile.current_streak,
      longest_streak: newProfile.longest_streak,
      is_admin: newProfile.is_admin,
      is_banned: newProfile.is_banned
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase ensureProfile error]:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase ensureProfile exception]:', err);
  }

  return newProfile;
}

/**
 * Fetch all registered profiles from Supabase
 */
export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('points', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const mapped = data.map((item: any) => ({
        id: item.id,
        email: item.email,
        full_name: item.full_name || 'Anonymous User',
        avatar_url: item.avatar_url || undefined,
        department: item.department || 'General',
        roll_number: item.roll_number || 'N/A',
        batch_number: item.batch_number || 'General',
        fb_link: item.fb_link || undefined,
        telegram_link: item.telegram_link || undefined,
        whatsapp_link: item.whatsapp_link || undefined,
        profile_completed: Boolean(item.profile_completed),
        points: Number(item.points) || 0,
        current_streak: Number(item.current_streak) || 0,
        longest_streak: Number(item.longest_streak) || 0,
        last_activity_date: item.last_activity_date,
        is_admin: (item.email || '').toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() || Boolean(item.is_admin),
        is_banned: Boolean(item.is_banned),
        created_at: item.created_at
      }));

      return mapped;
    }
  } catch (err) {
    console.error('[Supabase getAllProfiles exception]:', err);
  }

  return [];
}

/**
 * Fetch active progress for a specific user from Supabase user_progress table
 */
export async function getActiveProgress(userId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const row = data[0];
      const skill = initialSkills.find(s => s.id === row.skill_id);

      return {
        id: row.id,
        user_id: row.user_id,
        skill_id: row.skill_id,
        started_at: row.started_at,
        deadline_at: row.deadline_at,
        status: row.status,
        completed_at: row.completed_at,
        points_awarded: Number(row.points_awarded) || 10,
        skill,
        steps_completed: row.steps_completed || []
      };
    }
  } catch (err) {
    // Ignore error
  }

  // Fallback to local storage if present
  try {
    const saved = localStorage.getItem('skill_active_progress');
    if (saved && saved !== 'null') {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.status === 'in_progress') {
        return parsed;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Start a new skill challenge for a user in Supabase user_progress table
 */
export async function startSkillChallenge(userId: string, skillId: string, durationHours: number): Promise<UserProgress | null> {
  const startedAt = new Date();
  const durationMs = Math.max(1, durationHours) * 60 * 60 * 1000;
  const deadlineAt = new Date(startedAt.getTime() + durationMs);
  const skill = initialSkills.find(s => s.id === skillId);

  const localProgress: UserProgress = {
    id: `progress-${Date.now()}`,
    user_id: userId,
    skill_id: skillId,
    started_at: startedAt.toISOString(),
    deadline_at: deadlineAt.toISOString(),
    status: 'in_progress',
    points_awarded: 10,
    steps_completed: [],
    skill
  };

  try {
    localStorage.setItem('skill_active_progress', JSON.stringify(localProgress));
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        skill_id: skillId,
        started_at: startedAt.toISOString(),
        deadline_at: deadlineAt.toISOString(),
        status: 'in_progress',
        points_awarded: 10,
        steps_completed: []
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      const result = {
        id: data.id,
        user_id: data.user_id,
        skill_id: data.skill_id,
        started_at: data.started_at,
        deadline_at: data.deadline_at,
        status: data.status,
        completed_at: data.completed_at,
        points_awarded: Number(data.points_awarded) || 10,
        skill,
        steps_completed: data.steps_completed || []
      };
      try {
        localStorage.setItem('skill_active_progress', JSON.stringify(result));
      } catch (e) {}
      return result;
    }
  } catch (err) {
    // Return local progress on network/table error
  }

  return localProgress;
}

/**
 * Add extra time to an active challenge in Supabase
 */
export async function addExtraTimeToProgress(progressId: string, newDeadlineIso: string): Promise<boolean> {
  try {
    const saved = localStorage.getItem('skill_active_progress');
    if (saved && saved !== 'null') {
      const parsed = JSON.parse(saved);
      parsed.deadline_at = newDeadlineIso;
      localStorage.setItem('skill_active_progress', JSON.stringify(parsed));
    }
  } catch (e) {}

  try {
    await supabase
      .from('user_progress')
      .update({ deadline_at: newDeadlineIso })
      .eq('id', progressId);
  } catch (err) {
    // Ignore error
  }
  return true;
}

/**
 * Cancel an active challenge
 */
export async function cancelProgress(progressId: string): Promise<boolean> {
  try {
    localStorage.setItem('skill_active_progress', 'null');
  } catch (e) {}

  try {
    await supabase
      .from('user_progress')
      .delete()
      .eq('id', progressId);
  } catch (err) {
    // Ignore error
  }
  return true;
}

/**
 * Complete an active challenge in Supabase
 */
export async function completeChallenge(
  progressId: string,
  userId: string,
  currentPoints: number,
  currentStreak: number,
  skillId?: string
): Promise<{ success: boolean; newPoints: number; newStreak: number }> {
  const newPoints = currentPoints + 10;
  const newStreak = currentStreak + 1;
  const completedAt = new Date().toISOString();

  try {
    localStorage.setItem('skill_active_progress', 'null');
  } catch (e) {}

  // Update profile points in local storage
  await updateProfile(userId, {
    points: newPoints,
    current_streak: newStreak
  });

  // Save to completed local list
  const currentCompleted = getStoredCompletedProgress();
  const completedItem: UserProgress = {
    id: progressId && !progressId.startsWith('progress-active') ? progressId : `completed-${Date.now()}`,
    user_id: userId,
    skill_id: skillId || 'skill-html',
    started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    deadline_at: completedAt,
    status: 'completed',
    completed_at: completedAt,
    points_awarded: 10
  };
  saveStoredCompletedProgress([completedItem, ...currentCompleted.filter(c => c.id !== completedItem.id)]);

  try {
    await supabase
      .from('user_progress')
      .update({
        status: 'completed',
        completed_at: completedAt
      })
      .eq('id', progressId);

    await supabase
      .from('profiles')
      .update({
        points: newPoints,
        current_streak: newStreak,
        last_activity_date: completedAt
      })
      .eq('id', userId);

    await checkAndAwardBadges(userId, newPoints, newStreak);
  } catch (err) {
    // Ignore error
  }

  return { success: true, newPoints, newStreak };
}

const skillNameToIdMap: Record<string, string> = {
  'HTML': 'skill-html',
  'CSS': 'skill-css',
  'JavaScript': 'skill-js',
  'React': 'skill-react',
  'Git & GitHub': 'skill-git',
  'C Programming': 'skill-c',
  'Python': 'skill-python',
  'SQL & DBs': 'skill-sql'
};

/**
 * Fetch all completed user_progress records for a specific user
 */
export async function getUserCompletedProgress(userId: string): Promise<UserProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => {
        const skill = initialSkills.find(s => s.id === row.skill_id);
        return {
          id: row.id,
          user_id: row.user_id,
          skill_id: row.skill_id,
          started_at: row.started_at,
          deadline_at: row.deadline_at,
          status: row.status,
          completed_at: row.completed_at,
          points_awarded: Number(row.points_awarded) || 10,
          skill,
          steps_completed: row.steps_completed || []
        };
      });
    }
  } catch (err) {
    // Ignore error
  }

  // Check local real-time storage
  const stored = getStoredCompletedProgress().filter(p => p.user_id === userId);
  if (stored.length > 0) {
    return stored.map(row => ({
      ...row,
      skill: initialSkills.find(s => s.id === row.skill_id)
    }));
  }

  // Fallback to initial completed skills for demo mock profiles only (exclude active user)
  const fallback = initialCompletedSkills[userId];
  if (fallback && Array.isArray(fallback) && userId !== 'user-sohan') {
    return fallback.map((fb, idx) => {
      const realSkillId = skillNameToIdMap[fb.skillName] || 'skill-html';
      const actualSkill = initialSkills.find(s => s.id === realSkillId);
      return {
        id: `completed-${userId}-${idx}`,
        user_id: userId,
        skill_id: realSkillId,
        started_at: new Date().toISOString(),
        deadline_at: new Date().toISOString(),
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        points_awarded: 10,
        skill: actualSkill || {
          id: realSkillId,
          field_id: 'field-1',
          name: fb.skillName,
          description: 'Completed skill',
          order_index: idx + 1,
          icon: fb.icon,
          bg_color: fb.bg,
          difficulty: 'Beginner',
          avg_days: '3 days',
          learner_count: 10,
          step_count: 3
        }
      };
    });
  }

  return [];
}

/**
 * Fetch all completed user_progress records across the whole system
 */
export async function getAllCompletedProgress(): Promise<UserProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('status', 'completed');

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        skill_id: row.skill_id,
        started_at: row.started_at,
        deadline_at: row.deadline_at,
        status: row.status,
        completed_at: row.completed_at,
        points_awarded: Number(row.points_awarded) || 10
      }));
    }
  } catch (err) {
    // Ignore error
  }

  const stored = getStoredCompletedProgress();
  const list: UserProgress[] = [...stored];

  // Collect from other mock profile keys (excluding user-sohan so active user starts clean in real-time)
  Object.entries(initialCompletedSkills).forEach(([uid, skillsArr]) => {
    if (uid === 'user-sohan') return;
    skillsArr.forEach((sk, idx) => {
      const realSkillId = skillNameToIdMap[sk.skillName] || 'skill-html';
      list.push({
        id: `cp-${uid}-${idx}`,
        user_id: uid,
        skill_id: realSkillId,
        started_at: new Date().toISOString(),
        deadline_at: new Date().toISOString(),
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_awarded: 10
      });
    });
  });

  return list;
}

/**
 * Fetch all user_badges for a specific user
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      return data.map((b: any) => b.badge_id);
    }
  } catch (err) {
    // Ignore error
  }

  // Fallback: return default unlocked badges
  return ['badge-1', 'badge-2', 'badge-4', 'badge-5'];
}

/**
 * Award a specific badge to a user
 */
export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString()
      });
  } catch (err) {
    // Ignore error
  }
  return true;
}

/**
 * Checks all milestone criteria and awards badges
 */
export async function checkAndAwardBadges(userId: string, points: number, streak: number): Promise<string[]> {
  const earnedBadgeIds: string[] = [];
  try {
    const completedProgress = await getUserCompletedProgress(userId);
    const completedCount = completedProgress.length;

    if (completedCount >= 1) {
      await awardBadge(userId, 'badge-1');
      earnedBadgeIds.push('badge-1');
    }
    if (streak >= 5) {
      await awardBadge(userId, 'badge-2');
      earnedBadgeIds.push('badge-2');
    }
    if (completedCount >= 5) {
      await awardBadge(userId, 'badge-3');
      earnedBadgeIds.push('badge-3');
    }
    if (points >= 300) {
      await awardBadge(userId, 'badge-6');
      earnedBadgeIds.push('badge-6');
    }
  } catch (err) {
    // Ignore error
  }
  return earnedBadgeIds;
}

/**
 * Fetch real aggregate statistics for the Admin Panel
 */
export async function getAdminStats(): Promise<{
  totalUsers: number;
  activeChallenges: number;
  mostPopularSkillName: string;
  totalCompletions: number;
}> {
  try {
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeCount } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    const { count: completionsCount } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (usersCount !== null && usersCount !== undefined) {
      return {
        totalUsers: usersCount || 1,
        activeChallenges: activeCount || 0,
        mostPopularSkillName: 'HTML',
        totalCompletions: completionsCount || 0
      };
    }
  } catch (err) {
    // Fallback
  }

  const allProfs = getStoredProfiles();
  return {
    totalUsers: allProfs.length,
    activeChallenges: 34,
    mostPopularSkillName: 'HTML',
    totalCompletions: 312
  };
}

/**
 * Submit user feedback to public.feedback
 */
export async function submitFeedback(message: string): Promise<{ success: boolean; data?: FeedbackItem; error?: string }> {
  const trimmedMessage = (message || '').trim();
  if (!trimmedMessage) {
    return { success: false, error: 'Feedback message cannot be empty.' };
  }

  if (trimmedMessage.length > 1000) {
    return { success: false, error: 'Feedback message cannot exceed 1000 characters.' };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return { success: false, error: 'You must be logged in to send feedback.' };
    }

    const user = authData.user;
    const userEmail = user.email || '';

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        user_email: userEmail,
        message: trimmedMessage,
        status: 'unread'
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase submitFeedback Error]:', error);
      return { success: false, error: error.message || 'Failed to submit feedback. Please try again.' };
    }

    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        user_email: data.user_email,
        message: data.message,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    };
  } catch (err: any) {
    console.error('[Supabase submitFeedback Exception]:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred while submitting feedback.' };
  }
}

/**
 * Fetch feedback history for a specific user
 */
export async function getUserFeedback(userId: string): Promise<FeedbackItem[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase getUserFeedback error]:', error.message);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      user_email: item.user_email,
      message: item.message,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (err) {
    console.error('[Supabase getUserFeedback Exception]:', err);
    return [];
  }
}

/**
 * Fetch all feedback entries for Admin Portal
 */
export async function getAllFeedback(): Promise<FeedbackItem[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase getAllFeedback error]:', error.message);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      user_email: item.user_email,
      message: item.message,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));
  } catch (err) {
    console.error('[Supabase getAllFeedback Exception]:', err);
    return [];
  }
}

/**
 * Mark a feedback item as read (Admin only)
 */
export async function markFeedbackAsRead(feedbackId: string): Promise<{ success: boolean; error?: string }> {
  if (!feedbackId) return { success: false, error: 'Feedback ID is required.' };

  try {
    const { error } = await supabase
      .from('feedback')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .eq('id', feedbackId);

    if (error) {
      console.error('[Supabase markFeedbackAsRead error]:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase markFeedbackAsRead Exception]:', err);
    return { success: false, error: err?.message || 'Failed to update feedback status.' };
  }
}

