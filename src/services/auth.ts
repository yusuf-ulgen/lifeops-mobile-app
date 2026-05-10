import { supabase } from './supabase';
import { useAuthStore } from '../store/useAuthStore';

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useReturnStore } from '../store/useReturnStore';

export const signOutUser = async () => {
  await supabase.auth.signOut();
  useAuthStore.getState().signOut();
  useSubscriptionStore.getState().clearStore();
  useReturnStore.getState().clearStore();
};

export const initializeAuthListener = () => {
  const { setSession, setLoading } = useAuthStore.getState();

  supabase.auth.getSession().then(async ({ data: { session } }) => {
    const rememberMe = await AsyncStorage.getItem('remember-me');
    if (session && rememberMe === 'false') {
      await supabase.auth.signOut();
      setSession(null);
    } else {
      setSession(session);
    }
    setLoading(false);
  });

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setLoading(false);
  });

  return authListener.subscription;
};
