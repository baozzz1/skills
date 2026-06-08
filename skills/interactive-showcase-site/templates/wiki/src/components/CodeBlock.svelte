<script lang="ts">
  /**
   * CodeBlock — author-friendly code block with copy button.
   *
   * Props: code (string, required), lang (string, default 'text'), title (optional).
   * Copy strategy: navigator.clipboard -> execCommand fallback -> selected-text.
   * For build-time syntax highlighting (Shiki), the agent can wrap an Astro
   * Code component inside CodeBlock-styled markup; the simpler path is this
   * component, which is what 01-example.mdx exercises.
   *
   * See SKILL.md "Code blocks" for the authoring contract.
   */
  import { t } from '@/i18n/lang.svelte';

  type Props = {
    code: string;
    lang?: string;
    title?: string;
  };
  let { code, lang = 'text', title }: Props = $props();

  let state = $state<'idle' | 'copied' | 'selected' | 'failed'>('idle');
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flash(next: typeof state) {
    state = next;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      state = 'idle';
      timer = null;
    }, 1500);
  }

  function execCopyFallback(text: string): boolean {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand('copy');
      return ok;
    } finally {
      ta.remove();
    }
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

  let strings = $derived(t());
  let label = $derived(
    state === 'copied'   ? strings.copied   :
    state === 'selected' ? strings.selected :
    state === 'failed'   ? strings.failed   :
                           strings.copy
  );
</script>

<div class="code-block">
  {#if title || lang}
    <header class="code-head">
      {#if title}<span class="title mono">{title}</span>{/if}
      <span class="spacer"></span>
      <span class="lang mono">{lang}</span>
      <button
        class="copy-btn"
        class:copied={state === 'copied'}
        class:selected={state === 'selected'}
        onclick={handleCopy}
        aria-label={strings.copyAria}
      >
        {label}
      </button>
    </header>
  {/if}
  <pre><code class="lang-{lang}">{code}</code></pre>
  {#if !title && !lang}
    <button
      class="copy-btn floating"
      class:copied={state === 'copied'}
      class:selected={state === 'selected'}
      onclick={handleCopy}
      aria-label={strings.copyAria}
    >{label}</button>
  {/if}
</div>

<style>
  .code-block {
    position: relative;
    background: var(--code-bg);
    color: var(--code-fg);
    border: 1px solid var(--code-border);
    border-radius: var(--radius-row);
    overflow: hidden;
    margin: 0;
  }
  .code-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--code-bg-soft);
    border-bottom: 1px solid var(--code-border);
    font-size: 11px;
    color: var(--code-fg-dim);
  }
  .title {
    color: var(--code-fg);
    font-weight: 500;
  }
  .spacer { flex: 1; }
  .lang {
    color: var(--code-deco);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  pre {
    margin: 0;
    padding: 14px 16px;
    overflow-x: auto;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.6;
    color: var(--code-fg);
    background: transparent;
  }
  pre code {
    color: inherit;
    background: transparent;
    font: inherit;
  }
  .copy-btn {
    border: 1px solid var(--code-border);
    background: var(--code-bg-soft);
    color: var(--code-fg-dim);
    padding: 4px 10px;
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 11px;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .copy-btn:hover {
    color: var(--code-fg);
    border-color: var(--code-fg-dim);
  }
  .copy-btn.copied {
    color: var(--olive);
    border-color: var(--olive);
  }
  .copy-btn.selected {
    color: var(--info);
    border-color: var(--info);
  }
  .copy-btn.floating {
    position: absolute;
    top: 8px;
    right: 8px;
  }
</style>
