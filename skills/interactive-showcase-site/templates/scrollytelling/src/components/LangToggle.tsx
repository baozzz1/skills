/**
 * LangToggle — EN ⇄ 中 switch in the sticky nav.
 * Writes data-lang + lang on <html>, persists to localStorage. Initial state is
 * set BEFORE hydration via an inline script in BaseLayout so we never flash the
 * wrong language. Reads through useLang (useSyncExternalStore over the DOM
 * attribute) so SSR and hydration agree.
 * Styles: src/styles/components/lang-toggle.css (aggregated by site.css).
 */
import { useLang, useStrings, currentLang, setLang } from '@/i18n/lang';
import { STRINGS, type Lang } from '@/i18n/strings';

export default function LangToggle() {
  const lang = useLang();
  const strings = useStrings();

  function toggle() {
    const next: Lang = currentLang() === 'zh' ? 'en' : 'zh';
    setLang(next);
  }

  const currentGlyph = lang === 'en' ? STRINGS.en.langLabelEn : STRINGS.zh.langLabelZh;
  const nextGlyph = lang === 'en' ? STRINGS.zh.langLabelZh : STRINGS.en.langLabelEn;

  return (
    <button
      className="lang-toggle"
      onClick={toggle}
      aria-label={strings.langAria(currentGlyph)}
      title={strings.langTitle}
    >
      <span className="current" aria-hidden="true">{currentGlyph}</span>
      <span className="sep" aria-hidden="true">/</span>
      <span className="next" aria-hidden="true">{nextGlyph}</span>
    </button>
  );
}
