import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isPlaceholder =
  !supabaseUrl ||
  supabaseUrl.includes('your-supabase-project') ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes('your-supabase-anon-key');

export const isSupabaseConfigured = !isPlaceholder;

if (!isSupabaseConfigured) {
  console.warn(
    'ℹ️ Supabase credentials missing or placeholder in .env.local. Operating using high-performance local storage engine.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

