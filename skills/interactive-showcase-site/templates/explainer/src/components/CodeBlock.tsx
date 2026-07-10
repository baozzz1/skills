/**
 * CodeBlock — author-friendly code block with copy button.
 * Copy strategy: navigator.clipboard -> execCommand fallback -> selected-text.
 * Duplicated verbatim in explainer and wiki (checkDuplicatedComponents guards
 * the pair). Styles: src/styles/components/code-block.css.
 */
import { useEffect, useRef, useState } from 'react';
import { useStrings } from '@/i18n/lang';

type CopyState = 'idle' | 'copied' | 'selected' | 'failed';
type Props = {
  code: string;
  lang?: string;
  title?: string;
};

function execCopyFallback(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    return document.execCommand('copy');
  } finally {
    ta.remove();
  }
}

export default function CodeBlock({ code, lang = 'text', title }: Props) {
  const strings = useStrings();
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function flash(next: CopyState) {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState('idle');
      timer.current = null;
    }, 1500);
  }

  async function handleCopy() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        flash('copied');
        return;
      }
    } catch {
      /* fall through */
    }
    if (execCopyFallback(code)) flash('copied');
    else flash('selected');
  }

  const label =
    state === 'copied' ? strings.copied :
    state === 'selected' ? strings.selected :
    state === 'failed' ? strings.failed :
    strings.copy;

  const copyBtnClass =
    'copy-btn' +
    (state === 'copied' ? ' copied' : '') +
    (state === 'selected' ? ' selected' : '');

  return (
    <div className="code-block">
      {(title || lang) && (
        <header className="code-head">
          {title && <span className="title mono">{title}</span>}
          <span className="spacer" />
          <span className="lang mono">{lang}</span>
          <button className={copyBtnClass} onClick={handleCopy} aria-label={strings.copyAria}>
            {label}
          </button>
        </header>
      )}
      <pre><code className={`lang-${lang}`}>{code}</code></pre>
      {!title && !lang && (
        <button className={`${copyBtnClass} floating`} onClick={handleCopy} aria-label={strings.copyAria}>
          {label}
        </button>
      )}
    </div>
  );
}
