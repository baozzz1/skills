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

<!-- Styles: src/styles/components/sticky-stage.css (aggregated by site.css). -->
