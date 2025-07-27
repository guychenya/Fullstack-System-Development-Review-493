import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));