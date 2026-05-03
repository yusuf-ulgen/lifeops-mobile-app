import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Kendi Supabase bilgilerini buraya girmelisin.
const supabaseUrl = 'https://lwcyetcarafngtjvepon.supabase.co';
const supabaseAnonKey = 'sb_publishable_qd5Ga1DF9VZ5n3xlp_rR6Q_L_-oWoBY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
