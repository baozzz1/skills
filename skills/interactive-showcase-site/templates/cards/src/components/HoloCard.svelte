<script lang="ts">
  import { currentLang } from '@/i18n/lang.svelte';
  import type { Card, CardMode } from '@/lib/cards';

  let { card, mode = 'glint' }: { card: Card; mode?: CardMode } = $props();
  let lang = $derived(currentLang());

  function text(en: string, zh: string) {
    return lang === 'zh' ? zh : en;
  }

  function onPointerMove(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const fromCenter = Math.hypot(x - 0.5, y - 0.5);

    target.style.setProperty('--pointer-x', `${x * 100}%`);
    target.style.setProperty('--pointer-y', `${y * 100}%`);
    target.style.setProperty('--rotate-x', `${(0.5 - y) * 9}deg`);
    target.style.setProperty('--rotate-y', `${(x - 0.5) * 9}deg`);
    target.style.setProperty('--background-x', `${35 + x * 30}%`);
    target.style.setProperty('--background-y', `${35 + y * 30}%`);
    target.style.setProperty('--pointer-from-center', `${fromCenter}`);
  }

  function onPointerLeave(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    target.style.setProperty('--rotate-x', '0deg');
    target.style.setProperty('--rotate-y', '0deg');
    target.style.setProperty('--pointer-from-center', '0');
  }
</script>

{#if card.href}
  <a
    class="holo-card"
    class:featured={card.variant === 'featured'}
    class:gold={card.variant === 'gold'}
    href={card.href}
    data-mode={mode}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
  >
    <span class="shine" aria-hidden="true"></span>
    <span class="glare" aria-hidden="true"></span>
    <span class="content">
      <span class="icon" aria-hidden="true">{card.icon ?? '*'}</span>
      <span class="title">{text(card.titleEn, card.titleZh)}</span>
      <span class="subtitle">{text(card.subtitleEn, card.subtitleZh)}</span>
      <span class="chips" aria-label={text('Card tags', '卡片标签')}>
        {#each card.chips ?? [] as chip}
          <span class={`chip ${chip.tone}`}>{text(chip.labelEn, chip.labelZh)}</span>
        {/each}
      </span>
    </span>
  </a>
{:else}
  <button
    type="button"
    class="holo-card"
    class:featured={card.variant === 'featured'}
    class:gold={card.variant === 'gold'}
    data-mode={mode}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
  >
    <span class="shine" aria-hidden="true"></span>
    <span class="glare" aria-hidden="true"></span>
    <span class="content">
      <span class="icon" aria-hidden="true">{card.icon ?? '*'}</span>
      <span class="title">{text(card.titleEn, card.titleZh)}</span>
      <span class="subtitle">{text(card.subtitleEn, card.subtitleZh)}</span>
      <span class="chips" aria-label={text('Card tags', '卡片标签')}>
        {#each card.chips ?? [] as chip}
          <span class={`chip ${chip.tone}`}>{text(chip.labelEn, chip.labelZh)}</span>
        {/each}
      </span>
    </span>
  </button>
{/if}

<!-- Styles: src/styles/components/holo-card.css (aggregated by site.css). -->
