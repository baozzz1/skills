<script lang="ts">
  import HoloCard from '@/components/HoloCard.svelte';
  import type { Card, CardMode } from '@/lib/cards';

  let { cards, mode = 'glint' }: { cards: Card[]; mode?: CardMode } = $props();
</script>

<div class="holo-grid" data-mode={mode}>
  {#each cards as card (card.titleEn)}
    <HoloCard {card} {mode} />
  {/each}
</div>

<!-- Styles: src/styles/components/holo-card-grid.css (aggregated by site.css). -->

