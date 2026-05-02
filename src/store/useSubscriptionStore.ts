import { create } from 'zustand';
import { Subscription } from '../types';
import { fetchSubscriptions, addSubscription, deleteSubscription } from '../services/subscriptions';

interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  loadSubscriptions: () => Promise<void>;
  createSubscription: (sub: Omit<Subscription, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  clearStore: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  loadSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchSubscriptions();
      set({ subscriptions: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createSubscription: async (sub) => {
    set({ isLoading: true, error: null });
    try {
      const newSub = await addSubscription(sub);
      set({ subscriptions: [newSub, ...get().subscriptions], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeSubscription: async (id) => {
    try {
      await deleteSubscription(id);
      set({
        subscriptions: get().subscriptions.filter((s) => s.id !== id),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  clearStore: () => set({ subscriptions: [], error: null, isLoading: false }),
}));
