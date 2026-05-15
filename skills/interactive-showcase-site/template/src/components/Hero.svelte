<script lang="ts">
  /**
   * Hero — page-level hero (eyebrow + h1 + lead + chips + optional snapshot).
   * NOT the per-section hero. The per-section hero is whatever interactive
   * island (Lifecycle / Mermaid / Tabs / plain prose) the section's MDX places
   * at the top of its body.
   *
   * Used once at the top of index.astro to introduce the whole site.
   */
  type Tone = 'clay' | 'olive' | 'rust' | 'info' | 'muted';
  type Chip = { label: string; tone?: Tone };
  type SummaryItem = {
    label: string;
    title: string;
    body: string;
    tone?: Tone;
  };
  type Props = {
    eyebrow?: string;
    title: string;
    lead?: string;
    chips?: Chip[];
    summaryTitle?: string;
    summaryItems?: SummaryItem[];
  };
  let {
    eyebrow,
    title,
    lead,
    chips = [],
    summaryTitle = 'PROJECT SNAPSHOT',
    summaryItems = []
  }: Props = $props();
</script>

<header class="page-hero" class:has-summary={summaryItems.length > 0} id="top">
  <div class="hero-copy">
    {#if eyebrow}<div class="eyebrow">{eyebrow}</div>{/if}
    <h1 class="title">{title}</h1>
    {#if lead}<p class="lead">{lead}</p>{/if}
    {#if chips.length}
      <div class="chips">
        {#each chips as c (c.label)}
          <span class="chip" data-tone={c.tone ?? 'muted'}>
            <span class="dot" data-tone={c.tone ?? 'muted'}></span>
            {c.label}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  {#if summaryItems.length}
    <aside class="summary" aria-label={summaryTitle}>
      <div class="summary-title mono">{summaryTitle}</div>
      <div class="summary-grid">
        {#each summaryItems as item (item.label)}
          <article class="summary-card" data-tone={item.tone ?? 'muted'}>
            <div class="summary-label mono">
              <span class="dot" data-tone={item.tone ?? 'muted'}></span>
              {item.label}
            </div>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        {/each}
      </div>
    </aside>
  {/if}
</header>

<style>
  .page-hero {
    padding: var(--hero-pad-y) 0 28px;
  }
  .page-hero.has-summary {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(420px, 1.05fr);
    gap: clamp(28px, 4vw, 58px);
    align-items: center;
  }
  .hero-copy {
    min-width: 0;
  }
  .eyebrow {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gray-500);
    margin-bottom: 18px;
  }
  .title {
    font-family: var(--serif);
    /* Sized to fit a typical 13-15 CJK char title on one line at 1920px
       width. Going larger forces wraps that, even with keep-all, can't
       avoid awkward break points. */
    font-size: clamp(34px, 3.8vw, 60px);
    line-height: 1.06;
    color: var(--slate);
    margin: 0 0 18px;
    /* word-break: keep-all = browser cannot break inside CJK words
       (e.g. between "文" and "档"); only at explicit separators like " / ". */
    word-break: keep-all;
    letter-spacing: -0.01em;
  }
  .lead {
    font-family: var(--serif);
    font-size: clamp(17px, 1.3vw, 22px);
    line-height: 1.45;
    color: var(--gray-700);
    margin: 0 0 22px;
    max-width: 64ch;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--gray-300);
    background: var(--paper);
    font-family: var(--sans);
    font-size: 12px;
    color: var(--gray-700);
    overflow-wrap: anywhere;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--gray-500);
  }
  .dot[data-tone='clay']  { background: var(--clay); }
  .dot[data-tone='olive'] { background: var(--olive); }
  .dot[data-tone='rust']  { background: var(--rust); }
  .dot[data-tone='info']  { background: var(--info); }

  .summary {
    background: var(--paper);
    border: var(--border);
    border-radius: var(--radius-panel);
    padding: 16px;
  }
  .summary-title {
    color: var(--gray-500);
    font-size: 11px;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .summary-card {
    min-width: 0;
    padding: 12px 13px;
    border: 1.5px solid var(--gray-300);
    border-radius: var(--radius-row);
    background: var(--ivory);
  }
  .summary-card[data-tone='clay']  { border-color: color-mix(in oklch, var(--clay) 38%, var(--gray-300)); }
  .summary-card[data-tone='olive'] { border-color: color-mix(in oklch, var(--olive) 38%, var(--gray-300)); }
  .summary-card[data-tone='rust']  { border-color: color-mix(in oklch, var(--rust) 38%, var(--gray-300)); }
  .summary-card[data-tone='info']  { border-color: color-mix(in oklch, var(--info) 38%, var(--gray-300)); }
  .summary-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    color: var(--gray-500);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 5px;
    overflow-wrap: anywhere;
  }
  .summary-card h2 {
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.25;
    margin: 0 0 5px;
    color: var(--slate);
  }
  .summary-card p {
    max-width: none;
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--gray-700);
    overflow-wrap: anywhere;
  }

  /* Below 1440px the side-by-side hero crowds the fixed right-side TOC;
     stack the summary below the copy so each side has room to breathe.
     The 1920×1080 spec target still gets the dual-pane layout. */
  @media (max-width: 1440px) {
    .page-hero.has-summary {
      display: block;
    }
    .summary {
      margin-top: 24px;
    }
  }

  @media (max-width: 640px) {
    .title,
    .lead {
      overflow-wrap: anywhere;
      word-break: normal;
    }
    .summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
