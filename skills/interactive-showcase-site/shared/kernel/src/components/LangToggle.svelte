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

<!-- Styles live in src/styles/components/lang-toggle.css, aggregated by
     site.css. Scoped <style> was removed in the Svelte->React CSS-delivery
     migration (spec 2026-07-10 §4). -->

