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

<!-- Styles: src/styles/components/hero.css (aggregated by site.css). -->
