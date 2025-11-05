import { Moon, Sun } from 'lucide-react';
import { GlassButton } from './ui/glass';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <GlassButton
      variant="primary"
      size="sm"
      onClick={toggleTheme}
      className="aspect-square hover:scale-105 transition-transform"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 animate-pulse" />
      ) : (
        <Moon className="h-5 w-5 animate-pulse" />
      )}
    </GlassButton>
  );
}
