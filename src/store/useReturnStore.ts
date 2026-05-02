import { create } from 'zustand';
import { ReturnItem } from '../types';
import { fetchReturns, addReturnItem, markAsReturned } from '../services/returns';
import { calculateDaysRemaining } from '../utils/dateUtils';

interface ReturnState {
  returns: ReturnItem[];
  isLoading: boolean;
  error: string | null;
  loadReturns: () => Promise<void>;
  createReturn: (item: Omit<ReturnItem, 'id' | 'user_id' | 'is_returned' | 'created_at'>) => Promise<void>;
  completeReturn: (id: string) => Promise<void>;
  clearStore: () => void;
}

export const useReturnStore = create<ReturnState>((set, get) => ({
  returns: [],
  isLoading: false,
  error: null,

  loadReturns: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchReturns();
      
      const sortedData = data.sort((a, b) => {
        const daysA = calculateDaysRemaining(a.purchase_date, a.return_window_days);
        const daysB = calculateDaysRemaining(b.purchase_date, b.return_window_days);
        return daysA - daysB;
      });

      set({ returns: sortedData, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createReturn: async (item) => {
    set({ isLoading: true, error: null });
    try {
      await addReturnItem(item);
      await get().loadReturns();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  completeReturn: async (id) => {
    try {
      await markAsReturned(id);
      set({
        returns: get().returns.filter((r) => r.id !== id),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  clearStore: () => set({ returns: [], error: null, isLoading: false }),
}));
