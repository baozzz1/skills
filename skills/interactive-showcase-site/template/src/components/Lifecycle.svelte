<script lang="ts">
  /**
   * Lifecycle — numbered interactive steps with optional autoplay.
   *
   * Inspired by deep-dive-claude-code.vercel.app's Core Agentic Loop.
   * Use for 3-8 step API call sequences, agent loops, request flows, state
   * machines. Cap at 8.
   *
   * - User click pauses autoplay; manual Resume required to continue.
   * - prefers-reduced-motion auto-pauses on mount.
   *
   * See SKILL.md "Pattern A" for the authoring contract.
   */
  import { t } from '@/i18n/lang.svelte';

  type Step = {
    num: number;
    title: string;
    api?: string;
    desc: string;
    code?: string;
  };

  type Props = {
    steps: Step[];
    autoplay?: boolean;
    interval?: number;
  };

  let { steps, autoplay = false, interval = 2800 }: Props = $props();

  let active = $state(0);
  let playing = $state(autoplay);
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    stop();
    if (!playing) return;
    timer = setInterval(() => {
      active = (active + 1) % steps.length;
    }, interval);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function selectStep(i: number) {
    active = i;
    if (playing) {
      // user took control — pause autoplay
      playing = false;
      stop();
    }
  }

  function toggle() {
    playing = !playing;
    if (playing) start();
    else stop();
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        playing = false;
      }
    }
    if (playing) start();
    return stop;
  });

  let current = $derived(steps[active]);
  let strings = $derived(t());
</script>

<section class="lifecycle">
  <div class="lifecycle-head">
    <span class="eyebrow">{strings.stepsLabel(steps.length)}</span>
    <button
      class="ctrl"
      onclick={toggle}
      aria-pressed={playing}
      class:playing
    >
      {playing ? strings.pause : strings.play}
    </button>
  </div>

  <div class="steps" role="tablist" aria-label="Lifecycle steps">
    {#each steps as step, i (step.num)}
      <button
        role="tab"
        class="step"
        class:active={i === active}
        aria-selected={i === active}
        onclick={() => selectStep(i)}
      >
        <span class="num">{step.num}</span>
        <span class="label">{step.title}</span>
        {#if step.api}
          <span class="api mono">{step.api}</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="step-detail" aria-live="polite">
    <h3 class="step-detail-title">
      <span class="num-large mono">0{current.num}</span>
      {current.title}
    </h3>
    {#if current.api}
      <div class="api-row mono">{current.api}</div>
    {/if}
    <p class="desc">{current.desc}</p>
    {#if current.code}
      <pre class="code"><code>{current.code}</code></pre>
    {/if}
  </div>
</section>

<style>
  .lifecycle {
    background: var(--paper);
    border: 1.5px solid var(--gray-300);
    border-radius: var(--radius-panel);
    padding: 20px 22px;
    margin: 0;
  }
  .lifecycle-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .ctrl {
    padding: 5px 12px;
    border: 1.5px solid var(--gray-300);
    border-radius: 8px;
    background: var(--ivory);
    color: var(--gray-700);
    font-family: var(--mono);
    font-size: 11px;
    transition: border-color 0.15s ease, color 0.15s ease;
  }
  .ctrl:hover { border-color: var(--slate); color: var(--slate); }
  .ctrl.playing { color: var(--clay); border-color: var(--clay); }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    margin-bottom: 18px;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 10px 12px;
    border: 1.5px solid var(--gray-300);
    border-radius: 8px;
    background: var(--ivory);
    color: var(--gray-700);
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  }
  .step:hover {
    border-color: var(--gray-500);
  }
  .step.active {
    background: color-mix(in oklch, var(--clay) 8%, var(--paper));
    border-color: var(--clay);
    color: var(--slate);
  }
  @media (prefers-reduced-motion: no-preference) {
    .step.active { transform: translateY(-1px); }
  }

  .num {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--clay);
    font-weight: 600;
  }
  .label {
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--slate);
  }
  .api {
    font-size: 10.5px;
    color: var(--gray-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .step-detail {
    border-top: 1px solid var(--gray-100);
    padding-top: 16px;
  }
  .step-detail-title {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 0 0 8px;
    font-family: var(--serif);
    font-size: 22px;
    color: var(--slate);
  }
  .num-large {
    color: var(--clay);
    font-size: 14px;
    font-weight: 600;
  }
  .api-row {
    font-size: 12px;
    color: var(--gray-500);
    margin-bottom: 10px;
  }
  .desc {
    margin: 0 0 12px;
    color: var(--gray-700);
    font-size: 15px;
    line-height: 1.65;
    max-width: 70ch;
  }
  .code {
    margin: 0;
    padding: 12px 14px;
    background: var(--code-bg);
    color: var(--code-fg);
    border: 1px solid var(--code-border);
    border-radius: var(--radius-row);
    font-family: var(--mono);
    font-size: 12.5px;
    line-height: 1.55;
    overflow-x: auto;
  }
</style>
