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

<!-- Styles: src/styles/components/tabs.css (aggregated by site.css). -->
