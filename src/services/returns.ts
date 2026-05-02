import { supabase } from './supabase';
import { useAuthStore } from '../store/useAuthStore';
import { ReturnItem } from '../types';

export const fetchReturns = async (): Promise<ReturnItem[]> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Kullanıcı bulunamadı');

  const { data, error } = await supabase
    .from('returns')
    .select('*')
    .eq('is_returned', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ReturnItem[];
};

import { scheduleReturnNotification } from './notifications';

export const addReturnItem = async (
  item: Omit<ReturnItem, 'id' | 'user_id' | 'is_returned' | 'created_at'>
) => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Kullanıcı bulunamadı');

  const { data, error } = await supabase
    .from('returns')
    .insert([{ ...item, user_id: user.id, is_returned: false }])
    .select()
    .single();

  if (error) throw error;

  // Bildirimi zamanla
  await scheduleReturnNotification(
    item.product_name,
    item.purchase_date,
    item.return_window_days
  );

  return data as ReturnItem;
};

export const markAsReturned = async (id: string) => {
  const { error } = await supabase
    .from('returns')
    .update({ is_returned: true })
    .eq('id', id);

  if (error) throw error;
};
