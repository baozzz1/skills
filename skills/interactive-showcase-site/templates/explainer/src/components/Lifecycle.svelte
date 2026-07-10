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

<!-- Styles: src/styles/components/lifecycle.css (aggregated by site.css). -->
