<script lang="ts">
  /**
   * Hero — page-level hero (eyebrow + h1 + lead + chips + optional first-screen map).
   * NOT the per-section hero. The per-section hero is whatever interactive
   * island (Lifecycle / Mermaid / Tabs / plain prose) the section's MDX places
   * at the top of its body.
   *
   * Used once at the top of index.astro to introduce the whole site.
   *
   * The optional `summaryItems` render as an editorial first-screen map: a
   * full-width hairline-separated list under the title block. No panel, no
   * card grid — typography + 1px gray-300 separators only. Tone is collapsed
   * to a 7px dot at the start of each row.
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

<header class="page-hero" id="top">
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
    <section class="summary" aria-label={summaryTitle}>
      <div class="summary-title mono">{summaryTitle}</div>
      <ol class="map-list">
        {#each summaryItems as item (item.label)}
          <li class="map-row">
            <div class="map-num mono">
              <span class="dot" data-tone={item.tone ?? 'muted'}></span>
              {item.label}
            </div>
            <h2 class="map-title">{item.title}</h2>
            <p class="map-body">{item.body}</p>
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</header>

<style>
  .page-hero {
    padding: var(--hero-pad-y) 0 28px;
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
    flex-shrink: 0;
  }
  .dot[data-tone='clay']  { background: var(--clay); }
  .dot[data-tone='olive'] { background: var(--olive); }
  .dot[data-tone='rust']  { background: var(--rust); }
  .dot[data-tone='info']  { background: var(--info); }

  /* First-screen map — editorial, no panel, no cards.
     Sits below the title block as part of the same vertical flow.
     Tone signal collapsed to the 7px dot at the start of each row. */
  .summary {
    margin-top: 32px;
  }
  .summary-title {
    color: var(--gray-500);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--gray-300);
  }
  .map-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .map-row {
    display: grid;
    grid-template-columns: minmax(180px, 0.22fr) minmax(0, 0.32fr) minmax(0, 1fr);
    gap: clamp(16px, 2vw, 32px);
    align-items: baseline;
    padding: 14px 0;
    border-bottom: 1px solid var(--gray-300);
  }
  .map-row:last-child {
    border-bottom: 0;
  }
  .map-num {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--gray-500);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }
  .map-title {
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.3;
    color: var(--slate);
    margin: 0;
    font-weight: 600;
  }
  .map-body {
    font-family: var(--serif);
    font-size: 15px;
    line-height: 1.5;
    color: var(--gray-700);
    margin: 0;
    max-width: 60ch;
    overflow-wrap: anywhere;
  }

  /* Below 900px the three-column row crowds; stack each row vertically
     while keeping the hairline separator language intact. No cards. */
  @media (max-width: 900px) {
    .map-row {
      display: block;
    }
    .map-num {
      margin-bottom: 6px;
    }
    .map-title {
      margin-bottom: 4px;
    }
    .map-body {
      max-width: none;
    }
  }

  @media (max-width: 640px) {
    .title,
    .lead {
      overflow-wrap: anywhere;
      word-break: normal;
    }
  }
</style>
