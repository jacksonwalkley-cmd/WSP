import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Not currently imported anywhere — the app runs in local-only mode (see
// src/context/AppContext.tsx). This is the ready-to-use starting point for
// adding real accounts/multi-device sync back later; see README.md "Adding
// real accounts back".
//
// Set these in a .env file (see README.md) as EXPO_PUBLIC_SUPABASE_URL and
// EXPO_PUBLIC_SUPABASE_ANON_KEY. Expo inlines EXPO_PUBLIC_* vars at build time.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
