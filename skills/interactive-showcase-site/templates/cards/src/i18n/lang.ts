/**
 * Reactive language store (React).
 *
 * The source of truth is the <html data-lang> attribute, NOT React state: a
 * pre-paint script in BaseLayout sets it before hydration, global.css addresses
 * it via [data-lang-only] to show/hide the two rendered language copies, and
 * SectionNav's scroll-spy skips hidden-language headings by their zero client
 * rects. All three require the language to live in the DOM.
 *
 * useSyncExternalStore is the exact primitive for this: getServerSnapshot()
 * returns DEFAULT_LANG so the hydration render matches the SSR HTML byte for
 * byte, then React immediately re-renders from getSnapshot() (the live
 * attribute). A hydration mismatch is therefore structurally impossible.
 */
import { useSyncExternalStore } from 'react';
import { STRINGS, DEFAULT_LANG, type Lang, type Strings } from './strings';

function subscribe(onChange: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-lang']
  });
  return () => observer.disconnect();
}

function readLang(): Lang {
  if (typeof document === 'undefined') return DEFAULT_LANG;
  const value = document.documentElement.getAttribute('data-lang');
  return value === 'en' || value === 'zh' ? value : DEFAULT_LANG;
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, readLang, () => DEFAULT_LANG);
}

export function useStrings(): Strings {
  return STRINGS[useLang()];
}

/** Imperative read for event handlers / non-component callers. SSR-safe. */
export function currentLang(): Lang {
  return readLang();
}

export function setLang(next: Lang): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-lang', next);
  document.documentElement.setAttribute('lang', next === 'zh' ? 'zh-CN' : 'en');
  try {
    localStorage.setItem('lang', next);
  } catch (_) {
    /* ignore */
  }
}
