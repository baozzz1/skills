/**
 * Reactive language store.
 *
 * Mirrors the pattern used for theme: a pre-paint script in BaseLayout writes
 * <html data-lang> first; this store observes the attribute it finds at
 * hydration. Reads always go through the live attribute so SSR and CSR agree.
 *
 * Reactivity is delivered via a `$state` version counter that the
 * MutationObserver bumps on every data-lang change. Consumers touch the
 * counter inside their `$derived(...)` to re-run when language flips.
 *
 * Why not cache `_lang` directly: writing to a `$state` variable from inside
 * a `$derived` (which is what a getter-style cache would do on first call)
 * triggers Svelte's `state_unsafe_mutation` guard. The version-counter
 * pattern keeps the read pure.
 */
import { STRINGS, DEFAULT_LANG, type Lang } from './strings';

let _version = $state(0);

if (typeof document !== 'undefined') {
  const obs = new MutationObserver(() => {
    _version++;
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-lang']
  });
}

export function currentLang(): Lang {
  // Touching _version subscribes any reading $derived to data-lang changes.
  void _version;
  if (typeof document === 'undefined') return DEFAULT_LANG;
  const v = document.documentElement.getAttribute('data-lang');
  return v === 'en' || v === 'zh' ? v : DEFAULT_LANG;
}

export function t() {
  return STRINGS[currentLang()];
}

export function setLang(next: Lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-lang', next);
  document.documentElement.setAttribute('lang', next === 'zh' ? 'zh-CN' : 'en');
  try {
    localStorage.setItem('lang', next);
  } catch (_) {
    /* ignore */
  }
}
