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
    class="card"
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
    class="card"
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

<style>
  .card {
    --pointer-x: 50%;
    --pointer-y: 50%;
    --pointer-from-center: 0;
    --background-x: 50%;
    --background-y: 50%;
    --rotate-x: 0deg;
    --rotate-y: 0deg;

    position: relative;
    display: grid;
    min-height: 310px;
    width: 100%;
    overflow: hidden;
    border: var(--border);
    border-radius: calc(var(--radius-panel) + 8px);
    background:
      radial-gradient(circle at var(--background-x) var(--background-y), color-mix(in oklch, var(--clay) 18%, transparent), transparent 34%),
      linear-gradient(135deg, color-mix(in oklch, var(--paper) 86%, var(--oat)), var(--paper));
    color: var(--slate);
    padding: 0;
    text-align: left;
    border-bottom: var(--border);
    box-shadow: var(--shadow-lift);
    transform-style: preserve-3d;
    isolation: isolate;
  }

  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
  }

  .featured {
    min-height: 350px;
  }

  .gold {
    background:
      radial-gradient(circle at var(--background-x) var(--background-y), color-mix(in oklch, var(--clay) 22%, transparent), transparent 36%),
      linear-gradient(135deg, color-mix(in oklch, var(--oat) 72%, var(--paper)), var(--paper));
  }

  .card[data-mode='holo'] {
    background:
      radial-gradient(circle at var(--background-x) var(--background-y), color-mix(in oklch, var(--clay) 34%, transparent), transparent 32%),
      conic-gradient(
        from 130deg at var(--background-x) var(--background-y),
        color-mix(in oklch, var(--clay) 36%, var(--paper)),
        color-mix(in oklch, var(--info) 24%, var(--paper)),
        color-mix(in oklch, var(--oat) 70%, var(--paper)),
        color-mix(in oklch, var(--olive) 26%, var(--paper)),
        color-mix(in oklch, var(--clay) 36%, var(--paper))
      );
  }

  .card[data-mode='holo']::after {
    background:
      repeating-linear-gradient(
        0deg,
        color-mix(in oklch, var(--paper) 18%, transparent) 0 1px,
        transparent 1px 4px
      );
    opacity: 0.28;
    mix-blend-mode: overlay;
  }

  @media (prefers-reduced-motion: no-preference) {
    .card {
      transform: perspective(900px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
      transition: transform 180ms ease, border-color 180ms ease;
    }

    .card:hover {
      border-color: var(--clay);
    }
  }

  .shine,
  .glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
  }

  .shine {
    background:
      linear-gradient(115deg, transparent 18%, color-mix(in oklch, var(--paper) 50%, transparent) 36%, transparent 48%),
      radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in oklch, var(--oat) 32%, transparent), transparent 42%);
    opacity: calc(0.28 + var(--pointer-from-center) * 0.5);
    mix-blend-mode: soft-light;
  }

  .card[data-mode='holo'] .shine {
    background:
      conic-gradient(
        from 90deg at var(--pointer-x) var(--pointer-y),
        transparent,
        color-mix(in oklch, var(--paper) 62%, transparent),
        color-mix(in oklch, var(--clay) 42%, transparent),
        transparent
      ),
      linear-gradient(115deg, transparent 20%, color-mix(in oklch, var(--paper) 64%, transparent) 42%, transparent 54%);
    opacity: calc(0.42 + var(--pointer-from-center) * 0.62);
    mix-blend-mode: color-dodge;
  }

  .glare {
    background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in oklch, var(--paper) 48%, transparent), transparent 34%);
    opacity: calc(0.16 + var(--pointer-from-center) * 0.3);
  }

  .content {
    position: relative;
    z-index: 2;
    display: grid;
    align-content: end;
    min-height: inherit;
    padding: 24px;
  }

  .icon {
    position: absolute;
    top: 22px;
    left: 22px;
    display: inline-grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid color-mix(in oklch, var(--clay) 34%, var(--gray-300));
    border-radius: 14px;
    background: color-mix(in oklch, var(--paper) 72%, var(--oat));
    color: var(--clay);
    font-family: var(--mono);
    font-size: 12px;
  }

  .title {
    display: block;
    font-family: var(--serif);
    font-size: clamp(30px, 4vw, 46px);
    line-height: 1;
    color: var(--slate);
    margin-bottom: 12px;
  }

  .subtitle {
    display: block;
    max-width: 28ch;
    color: var(--gray-700);
    font-size: 15px;
    line-height: 1.55;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 22px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius-pill);
    border: 1px solid var(--gray-300);
    padding: 5px 9px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--gray-700);
    background: color-mix(in oklch, var(--paper) 82%, var(--gray-100));
  }

  .chip.clay { color: var(--clay); border-color: color-mix(in oklch, var(--clay) 42%, var(--gray-300)); }
  .chip.olive { color: var(--olive); border-color: color-mix(in oklch, var(--olive) 42%, var(--gray-300)); }
  .chip.rust { color: var(--rust); border-color: color-mix(in oklch, var(--rust) 42%, var(--gray-300)); }
  .chip.info { color: var(--info); border-color: color-mix(in oklch, var(--info) 42%, var(--gray-300)); }
  .chip.muted { color: var(--gray-500); }

  @media (prefers-reduced-motion: reduce) {
    .shine,
    .glare,
    .card::after {
      display: none;
    }
  }
</style>
