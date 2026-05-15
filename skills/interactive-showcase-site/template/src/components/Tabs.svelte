<script lang="ts">
  /**
   * Tabs — variant-style switcher.
   *
   * Props-only API: no children-as-island (which is unstable across the
   * Astro/Svelte hydration edge). Each tab's body is provided as a raw
   * HTML string in the `tabs` array. For richer content, prefer authoring
   * multiple sections instead of stuffing complex markup into a tab.
   *
   * See SKILL.md "Pattern C" for the authoring contract.
   */
  type Tab = { label: string; html: string };
  type Props = {
    tabs: Tab[];
    group?: string;
    initial?: number;
  };
  let { tabs, group = 'tabs', initial = 0 }: Props = $props();

  let active = $state(initial);

  function selectByKey(e: KeyboardEvent, idx: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      active = (idx + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      active = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      active = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      active = tabs.length - 1;
    }
  }
</script>

<div class="tabs-wrap">
  <div role="tablist" class="tablist" aria-label={group}>
    {#each tabs as tab, i (tab.label)}
      <button
        role="tab"
        id={`tab-${group}-${i}`}
        aria-selected={active === i}
        aria-controls={`panel-${group}-${i}`}
        tabindex={active === i ? 0 : -1}
        class="tab"
        class:active={active === i}
        onclick={() => (active = i)}
        onkeydown={(e) => selectByKey(e, i)}
      >{tab.label}</button>
    {/each}
  </div>
  {#each tabs as tab, i (tab.label)}
    <div
      role="tabpanel"
      id={`panel-${group}-${i}`}
      aria-labelledby={`tab-${group}-${i}`}
      hidden={active !== i}
      class="panel"
    >
      <!-- HTML is author-provided and trusted in this skill's context -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html tab.html}
    </div>
  {/each}
</div>

<style>
  .tabs-wrap {
    border: 1.5px solid var(--gray-300);
    border-radius: var(--radius-panel);
    overflow: hidden;
    background: var(--paper);
  }
  /* Tablist as an explicit segmented control: each tab is a paper pill on a
     subtle tray, so the user immediately reads them as buttons. */
  .tablist {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 10px;
    background: var(--surface-subtle);
    border-bottom: 1.5px solid var(--gray-300);
  }
  .tab {
    flex: 0 1 auto;
    min-width: 0;
    padding: 7px 16px;
    border: 1.5px solid var(--gray-300);
    border-radius: var(--radius-pill);
    background: var(--paper);
    color: var(--gray-700);
    font-family: var(--sans);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  }
  .tab:hover {
    color: var(--slate);
    border-color: var(--gray-500);
  }
  .tab.active {
    background: color-mix(in oklch, var(--clay) 14%, var(--paper));
    border-color: var(--clay);
    color: var(--slate);
    box-shadow: 0 0 0 1px var(--clay);
  }
  .panel {
    padding: 18px 20px;
  }
  .panel > :global(p):first-child { margin-top: 0; }
  .panel > :global(p):last-child  { margin-bottom: 0; }

  @media (max-width: 600px) {
    .tab { flex: 1 1 100%; }
  }
</style>
