import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TextAnalyzerState {
  isEnabled: boolean;
  toggleTextAnalyzer: () => void;
}

export const useTextAnalyzerStore = create<TextAnalyzerState>()(
  persist(
    (set) => ({
      isEnabled: true, // Default to enabled
      toggleTextAnalyzer: () => set((state) => ({ isEnabled: !state.isEnabled })),
    }),
    {
      name: 'text-analyzer-storage',
    }
  )
);

