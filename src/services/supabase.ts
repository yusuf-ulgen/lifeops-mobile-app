import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Kendi Supabase bilgilerini buraya girmelisin.
const supabaseUrl = 'https://qzramcywmvfscotkggjx.supabase.co';
const supabaseAnonKey = 'sb_publishable_YrSzPrbI5Ex7csA4y0og8g_Eku07tU9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
