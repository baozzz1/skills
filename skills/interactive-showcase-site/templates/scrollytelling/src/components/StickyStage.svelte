<script lang="ts">
  import { onMount } from 'svelte';
  import { currentLang } from '@/i18n/lang.svelte';
  import type { StageEdge, StageNode, StageState, Story } from '@/lib/story';

  let { story }: { story: Story } = $props();

  let root = $state<HTMLElement>();
  let activeIndex = $state(0);
  let reducedMotion = $state(false);

  let lang = $derived(currentLang());
  let activeStep = $derived(story.steps[activeIndex] ?? story.steps[0]);
  let activeState = $derived(
    story.stageStates.find((state) => state.key === activeStep?.stateKey)
      ?? story.stageStates[0]
  );

  onMount(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepNodes = Array.from(root?.querySelectorAll<HTMLElement>('[data-step-index]') ?? []);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const next = Number((visible.target as HTMLElement).dataset.stepIndex);
      if (Number.isFinite(next)) activeIndex = next;
    }, {
      rootMargin: '-25% 0px -45% 0px',
      threshold: [0.2, 0.4, 0.6, 0.8]
    });

    for (const node of stepNodes) observer.observe(node);
    return () => observer.disconnect();
  });

  function text(en: string, zh: string) {
    return lang === 'zh' ? zh : en;
  }

  function nodeById(state: StageState, id: string): StageNode | undefined {
    return state.nodes?.find((node) => node.id === id);
  }

  function edgePath(state: StageState, edge: StageEdge) {
    const from = nodeById(state, edge.from);
    const to = nodeById(state, edge.to);
    if (!from || !to) return '';
    return `M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y}, ${(from.x + to.x) / 2} ${to.y}, ${to.x} ${to.y}`;
  }
</script>

<section class="story" bind:this={root}>
  <div class="hero">
    <p class="eyebrow">{text(story.eyebrowEn, story.eyebrowZh)}</p>
    <h1>{text(story.titleEn, story.titleZh)}</h1>
    <p class="lead">{text(story.leadEn, story.leadZh)}</p>
  </div>

  <div class="scroll-section" data-reduced-motion={reducedMotion}>
    <div class="stage-wrap" aria-hidden="true">
      <div class="stage-card">
        <div class="stage-meta">
          <span>{activeStep.period}</span>
          <strong>{text(activeStep.titleEn, activeStep.titleZh)}</strong>
        </div>
        <svg viewBox="0 0 100 100" role="img">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>

          {#each activeState.edges ?? [] as edge (`${edge.from}-${edge.to}`)}
            <path class="edge active" d={edgePath(activeState, edge)} marker-end="url(#arrow)" />
          {/each}

          {#each activeState.nodes ?? [] as node (node.id)}
            <g class="node active" transform={`translate(${node.x} ${node.y})`}>
              <circle r="6" />
              <text y="14">{node.label}</text>
            </g>
          {/each}
        </svg>
        <p class="stage-alt">{activeStep.alt}</p>
      </div>
    </div>

    <ol class="steps" aria-label={text('Timeline steps', '时间线步骤')}>
      {#each story.steps as step, index (step.stateKey)}
        <li
          class:current={index === activeIndex}
          data-step-index={index}
          aria-current={index === activeIndex ? 'step' : undefined}
        >
          <span class="period">{step.period}</span>
          <h2>{text(step.titleEn, step.titleZh)}</h2>
          <p>{text(step.bodyEn, step.bodyZh)}</p>
          <p class="inline-alt">{step.alt}</p>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
  .story {
    padding: 0 0 80px;
  }

  .hero {
    min-height: calc(42vh - var(--nav-h));
    display: grid;
    align-content: end;
    gap: 16px;
    padding: 64px 0 44px;
  }

  .hero h1 {
    max-width: 920px;
    word-break: keep-all;
  }

  .lead {
    font-size: clamp(17px, 2vw, 21px);
    max-width: 760px;
    color: var(--gray-700);
  }

  .scroll-section {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
    gap: clamp(28px, 5vw, 72px);
    align-items: start;
    border-top: var(--border);
    padding-top: 44px;
  }

  .stage-wrap {
    position: sticky;
    top: calc(var(--nav-h) + 28px);
    min-height: calc(100vh - var(--nav-h) - 56px);
    display: grid;
    align-items: center;
  }

  .stage-card {
    border: var(--border);
    border-radius: var(--radius-panel);
    background:
      radial-gradient(circle at 20% 10%, color-mix(in oklch, var(--clay) 14%, transparent), transparent 36%),
      var(--paper);
    box-shadow: var(--shadow-lift);
    padding: clamp(18px, 3vw, 28px);
    overflow: hidden;
  }

  .stage-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: baseline;
    margin-bottom: 20px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--gray-500);
  }

  .stage-meta strong {
    color: var(--clay);
    font-family: var(--sans);
    font-size: 14px;
  }

  svg {
    width: 100%;
    aspect-ratio: 1.25;
    border: 1px solid var(--gray-100);
    border-radius: var(--radius-panel);
    background: color-mix(in oklch, var(--gray-100) 58%, var(--paper));
  }

  marker path {
    fill: var(--clay);
  }

  .edge {
    fill: none;
    stroke: var(--clay);
    stroke-width: 1.4;
    stroke-linecap: round;
    opacity: 0;
    stroke-dasharray: 120;
    stroke-dashoffset: 120;
  }

  .node circle {
    fill: var(--paper);
    stroke: var(--clay);
    stroke-width: 1.4;
  }

  .node text {
    text-anchor: middle;
    font-family: var(--mono);
    font-size: 4px;
    fill: var(--slate);
  }

  .node {
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }

  .node.active,
  .edge.active {
    opacity: 1;
  }

  @media (prefers-reduced-motion: no-preference) {
    .node.active {
      animation: node-in 420ms ease both;
    }

    .edge.active {
      animation: edge-in 680ms ease both;
    }
  }

  @keyframes node-in {
    from {
      opacity: 0;
      scale: 0.92;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }

  @keyframes edge-in {
    to {
      opacity: 1;
      stroke-dashoffset: 0;
    }
  }

  .stage-alt,
  .inline-alt {
    margin: 14px 0 0;
    font-size: 13px;
    color: var(--gray-500);
  }

  .steps {
    list-style: none;
    margin: 0;
    padding: 12vh 0 18vh;
    display: grid;
    gap: 28vh;
  }

  .steps li {
    border: var(--border);
    border-radius: var(--radius-panel);
    background: color-mix(in oklch, var(--paper) 92%, var(--ivory));
    padding: 24px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .steps li.current {
    border-color: var(--clay);
    box-shadow: 0 16px 36px color-mix(in oklch, var(--clay) 18%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    .steps li.current {
      transform: translateY(-2px);
    }
  }

  .period {
    display: inline-flex;
    margin-bottom: 12px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--clay);
  }

  .steps h2 {
    margin: 0 0 10px;
  }

  .steps p {
    max-width: 54ch;
  }

  @media (max-width: 920px) {
    .scroll-section {
      grid-template-columns: 1fr;
    }

    .stage-wrap {
      position: relative;
      top: auto;
      min-height: 0;
    }

    .steps {
      padding-top: 0;
      gap: 24px;
    }
  }

  @media print {
    .stage-wrap {
      position: relative;
      min-height: 0;
    }

    .steps {
      gap: 18px;
      padding: 24px 0;
    }
  }
</style>
