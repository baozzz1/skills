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

<!-- Styles: src/styles/components/code-block.css (aggregated by site.css). -->
