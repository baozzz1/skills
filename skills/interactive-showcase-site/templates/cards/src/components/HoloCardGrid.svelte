<script lang="ts">
  import HoloCard from '@/components/HoloCard.svelte';
  import type { Card, CardMode } from '@/lib/cards';

  let { cards, mode = 'glint' }: { cards: Card[]; mode?: CardMode } = $props();
</script>

<div class="grid" data-mode={mode}>
  {#each cards as card (card.titleEn)}
    <HoloCard {card} {mode} />
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(16px, 2vw, 24px);
    align-items: stretch;
    perspective: 1200px;
  }

  @media (max-width: 1120px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
