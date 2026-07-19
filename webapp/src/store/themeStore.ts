import { create } from 'zustand';

type Theme = 'dark';

interface ThemeState {
  theme: Theme;
}

export const useThemeStore = create<ThemeState>(() => ({
  theme: 'dark',
}));
