import { create } from 'zustand';

export const useVibeStore = create((set, get) => ({
  currentVibe: 'focused',
  vibeHistory: [],
  productivity: 87,
  mood: 'neutral',
  
  setVibe: (vibe) => set((state) => ({
    currentVibe: vibe,
    vibeHistory: [...state.vibeHistory, { vibe, timestamp: Date.now() }]
  })),
  
  updateProductivity: (score) => set({ productivity: score }),
  updateMood: (mood) => set({ mood }),
  
  getVibeStats: () => {
    const state = get();
    const last24h = state.vibeHistory.filter(
      entry => Date.now() - entry.timestamp < 24 * 60 * 60 * 1000
    );
    
    return {
      totalSessions: last24h.length,
      mostCommonVibe: 'focused', // Calculate from history
      avgProductivity: state.productivity,
    };
  },
}));