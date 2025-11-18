import { useThemeContext } from '@/contexts/ThemeContext';

export type Theme = 'light' | 'dark';

export function useTheme() {
  return useThemeContext();
}
