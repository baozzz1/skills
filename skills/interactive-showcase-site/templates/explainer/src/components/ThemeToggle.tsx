/**
 * ThemeToggle — system / light / dark cycle button in the sticky nav.
 * Writes data-theme on <html>, persists to localStorage. Initial state is set
 * BEFORE hydration via an inline script in BaseLayout so we never flash the
 * wrong theme. No store: the CSS cascade ([data-theme]) does all reactive work,
 * and this is the only theme consumer.
 * Styles: src/styles/components/theme-toggle.css (aggregated by site.css).
 */
import { useEffect, useState } from 'react';
import { useStrings } from '@/i18n/lang';

type Theme = 'light' | 'dark' | 'system';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'system';
  const value = document.documentElement.getAttribute('data-theme');
  if (value === 'light' || value === 'dark') return value;
  return 'system';
}

function applyTheme(next: Theme): void {
  if (next === 'system') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }
}

export default function ThemeToggle() {
  const strings = useStrings();
  // Starts 'system' to match the SSR/pre-hydration render, then syncs to the
  // attribute the pre-paint script set. Reading in an effect (not useState
  // initialiser) keeps the first client render identical to the server's.
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function cycle() {
    const order: Theme[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    applyTheme(next);
  }

  const label =
    theme === 'system' ? strings.themeSystem :
    theme === 'light' ? strings.themeLight :
    strings.themeDark;
  const glyph = theme === 'system' ? '◐' : theme === 'light' ? '☀' : '☾';

  return (
    <button
      className="theme-toggle"
      onClick={cycle}
      aria-label={strings.themeAria(label)}
      title={strings.themeTitle}
    >
      <span className="glyph" aria-hidden="true">{glyph}</span>
      <span className="label">{label}</span>
    </button>
  );
}
