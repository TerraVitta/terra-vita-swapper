import { useEffect, useState } from 'react';

const usePrefersColorScheme = () => {
    const [prefersDark, setPrefersDark] = useState<boolean | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersDark(event.matches);
        };

        setPrefersDark(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersDark;
};

export default usePrefersColorScheme;