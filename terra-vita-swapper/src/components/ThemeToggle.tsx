import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? '🌞' : '🌜'}
        </button>
    );
};

export default ThemeToggle;