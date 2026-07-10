<script lang="ts">
  /**
   * ThemeToggle — system / light / dark cycle button in the sticky nav.
   * Writes data-theme on <html>, persists to localStorage. Initial state
   * is set BEFORE hydration via an inline script in BaseLayout so we never
   * flash the wrong theme.
   */
  import { t } from '@/i18n/lang.svelte';

  type Theme = 'light' | 'dark' | 'system';
  let theme = $state<Theme>('system');

  function readTheme(): Theme {
    if (typeof document === 'undefined') return 'system';
    const v = document.documentElement.getAttribute('data-theme');
    if (v === 'light' || v === 'dark') return v;
    return 'system';
  }

  function applyTheme(next: Theme) {
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }
  }

  function cycle() {
    const order: Theme[] = ['system', 'light', 'dark'];
    const i = order.indexOf(theme);
    const next = order[(i + 1) % order.length];
    theme = next;
    applyTheme(next);
  }

  $effect(() => {
    theme = readTheme();
  });

  let strings = $derived(t());
  let label = $derived(
    theme === 'system' ? strings.themeSystem :
    theme === 'light'  ? strings.themeLight  :
                         strings.themeDark
  );

  let glyph = $derived(
    theme === 'system' ? '◐' : theme === 'light' ? '☀' : '☾'
  );
</script>

<button
  class="theme-toggle"
  onclick={cycle}
  aria-label={strings.themeAria(label)}
  title={strings.themeTitle}
>
  <span class="glyph" aria-hidden="true">{glyph}</span>
  <span class="label">{label}</span>
</button>

<!-- Styles live in src/styles/components/theme-toggle.css, aggregated by
     site.css. Scoped <style> was removed in the Svelte->React CSS-delivery
     migration (spec 2026-07-10 §4). -->

