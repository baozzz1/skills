<script lang="ts">
  /**
   * LangToggle — EN ⇄ 中 switch in the sticky nav.
   * Writes data-lang + lang on <html>, persists to localStorage. Initial state
   * is set BEFORE hydration via an inline script in BaseLayout so we never
   * flash the wrong language.
   *
   * Visual: shows the *current* language as a glyph and the *switch target* as
   * a hint after a chevron — mirrors how ThemeToggle separates state vs label.
   */
  import { currentLang, setLang, t } from '@/i18n/lang.svelte';
  import { STRINGS, type Lang } from '@/i18n/strings';

  function toggle() {
    const next: Lang = currentLang() === 'zh' ? 'en' : 'zh';
    setLang(next);
  }

  let lang = $derived(currentLang());
  let strings = $derived(t());
  let currentGlyph = $derived(
    lang === 'en' ? STRINGS.en.langLabelEn : STRINGS.zh.langLabelZh
  );
  let nextGlyph = $derived(
    lang === 'en' ? STRINGS.zh.langLabelZh : STRINGS.en.langLabelEn
  );
  let aria = $derived(strings.langAria(currentGlyph));
</script>

<button
  class="lang-toggle"
  onclick={toggle}
  aria-label={aria}
  title={strings.langTitle}
>
  <span class="current" aria-hidden="true">{currentGlyph}</span>
  <span class="sep" aria-hidden="true">/</span>
  <span class="next" aria-hidden="true">{nextGlyph}</span>
</button>

<style>
  .lang-toggle {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    padding: 6px 10px;
    border: 1.5px solid var(--gray-300);
    border-radius: 8px;
    background: var(--paper);
    color: var(--gray-700);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
  }
  .lang-toggle:hover {
    border-color: var(--slate);
    color: var(--slate);
  }
  .current {
    color: var(--clay);
    font-weight: 600;
    font-size: 12px;
  }
  .sep {
    color: var(--gray-500);
    font-size: 11px;
  }
  .next {
    color: var(--gray-500);
    font-size: 11px;
  }
</style>
