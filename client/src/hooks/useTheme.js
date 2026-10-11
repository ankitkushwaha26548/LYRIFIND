import { useEffect, useState } from 'react';

/** Light/dark mode: saved in localStorage, applied as the "dark" class on <html> (Tailwind darkMode: 'class'). */
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('lf_theme', dark ? 'dark' : 'light'); } catch (e) { /* storage unavailable */ }
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}
