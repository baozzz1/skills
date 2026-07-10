/**
 * StickyStage — scroll-driven sticky diagram. An IntersectionObserver over the
 * per-step <li> elements sets the active phase; the pinned stage redraws from
 * the active state. All animation is CSS (@keyframes sticky-node-in /
 * sticky-edge-in). Styles: src/styles/components/sticky-stage.css.
 */
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/lang';
import type { StageEdge, StageState, Story } from '@/lib/story';

type Props = { story: Story };

function nodeById(state: StageState, id: string) {
  return state.nodes?.find((node) => node.id === id);
}

function edgePath(state: StageState, edge: StageEdge) {
  const from = nodeById(state, edge.from);
  const to = nodeById(state, edge.to);
  if (!from || !to) return '';
  return `M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y}, ${(from.x + to.x) / 2} ${to.y}, ${to.x} ${to.y}`;
}

export default function StickyStage({ story }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const lang = useLang();
  const text = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const activeStep = story.steps[activeIndex] ?? story.steps[0];
  const activeState =
    story.stageStates.find((state) => state.key === activeStep?.stateKey) ?? story.stageStates[0];

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const stepNodes = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>('[data-step-index]') ?? []
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const next = Number((visible.target as HTMLElement).dataset.stepIndex);
        if (Number.isFinite(next)) setActiveIndex(next);
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.6, 0.8]
      }
    );

    for (const node of stepNodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="story" ref={rootRef}>
      <div className="hero">
        <p className="eyebrow">{text(story.eyebrowEn, story.eyebrowZh)}</p>
        <h1>{text(story.titleEn, story.titleZh)}</h1>
        <p className="lead">{text(story.leadEn, story.leadZh)}</p>
      </div>

      <div className="scroll-section" data-reduced-motion={reducedMotion}>
        <div className="stage-wrap" aria-hidden="true">
          <div className="stage-card">
            <div className="stage-meta">
              <span>{activeStep.period}</span>
              <strong>{text(activeStep.titleEn, activeStep.titleZh)}</strong>
            </div>
            <svg viewBox="0 0 100 100" role="img">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>

              {(activeState.edges ?? []).map((edge) => (
                <path
                  key={`${edge.from}-${edge.to}`}
                  className="edge active"
                  d={edgePath(activeState, edge)}
                  markerEnd="url(#arrow)"
                />
              ))}

              {(activeState.nodes ?? []).map((node) => (
                <g key={node.id} className="node active" transform={`translate(${node.x} ${node.y})`}>
                  <circle r="6" />
                  <text y="14">{node.label}</text>
                </g>
              ))}
            </svg>
            <p className="stage-alt">{activeStep.alt}</p>
          </div>
        </div>

        <ol className="steps" aria-label={text('Timeline steps', '时间线步骤')}>
          {story.steps.map((step, index) => (
            <li
              key={step.stateKey}
              className={index === activeIndex ? 'current' : undefined}
              data-step-index={index}
              aria-current={index === activeIndex ? 'step' : undefined}
            >
              <span className="period">{step.period}</span>
              <h2>{text(step.titleEn, step.titleZh)}</h2>
              <p>{text(step.bodyEn, step.bodyZh)}</p>
              <p className="inline-alt">{step.alt}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
