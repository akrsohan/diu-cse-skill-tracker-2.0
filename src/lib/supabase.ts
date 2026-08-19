/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://xoqurxmldvpalbemkvde.supabase.co';
  // Remove wrapping quotes and whitespace
  let clean = rawUrl.trim().replace(/^["']|["']$/g, '').trim();
  // Ensure standard protocol
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, '');
  // Strip accidental path segments like /auth/v1, /rest/v1, /v1 if entered by mistake
  clean = clean.replace(/\/(auth|rest)\/v\d+.*$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean || 'https://xoqurxmldvpalbemkvde.supabase.co';
}

function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return 'sb_publishable_pKMZg7wObeIN3xXVFr0_GA_c_kEbblJ';
  return rawKey.trim().replace(/^["']|["']$/g, '').trim();
}

const rawSupabaseUrl = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) || 
  'https://xoqurxmldvpalbemkvde.supabase.co';

const rawSupabaseAnonKey = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  'sb_publishable_pKMZg7wObeIN3xXVFr0_GA_c_kEbblJ';

export const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = sanitizeSupabaseKey(rawSupabaseAnonKey);

console.log('[Supabase Client] Initialized with endpoint:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

