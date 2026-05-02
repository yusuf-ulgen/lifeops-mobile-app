import { supabase } from './supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Subscription } from '../types';

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Kullanıcı bulunamadı');

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Subscription[];
};

export const addSubscription = async (
  subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at'>
) => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Kullanıcı bulunamadı');

  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ ...subscription, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Subscription;
};

export const deleteSubscription = async (id: string) => {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
};
