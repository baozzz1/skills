/**
 * Lifecycle — numbered interactive steps with optional autoplay.
 * - User click pauses autoplay; manual Resume required to continue.
 * - prefers-reduced-motion auto-pauses on mount.
 * Styles: src/styles/components/lifecycle.css.
 */
import { useEffect, useRef, useState } from 'react';
import { useStrings } from '@/i18n/lang';

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

export default function Lifecycle({ steps, autoplay = false, interval = 2800 }: Props) {
  const strings = useStrings();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Autoplay tick + reduced-motion auto-pause. Re-runs when `playing` flips.
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPlaying(false);
      return;
    }
    if (!playing) return;
    timer.current = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [playing, interval, steps.length]);

  function selectStep(i: number) {
    setActive(i);
    if (playing) setPlaying(false); // user took control — pause autoplay
  }

  const current = steps[active];

  return (
    <section className="lifecycle">
      <div className="lifecycle-head">
        <span className="eyebrow">{strings.stepsLabel(steps.length)}</span>
        <button
          className={playing ? 'ctrl playing' : 'ctrl'}
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
        >
          {playing ? strings.pause : strings.play}
        </button>
      </div>

      <div className="steps" role="tablist" aria-label="Lifecycle steps">
        {steps.map((step, i) => (
          <button
            key={step.num}
            role="tab"
            className={i === active ? 'step active' : 'step'}
            aria-selected={i === active}
            onClick={() => selectStep(i)}
          >
            <span className="num">{step.num}</span>
            <span className="label">{step.title}</span>
            {step.api && <span className="api mono">{step.api}</span>}
          </button>
        ))}
      </div>

      <div className="step-detail" aria-live="polite">
        <h3 className="step-detail-title">
          <span className="num-large mono">0{current.num}</span>
          {current.title}
        </h3>
        {current.api && <div className="api-row mono">{current.api}</div>}
        <p className="desc">{current.desc}</p>
        {current.code && <pre className="code"><code>{current.code}</code></pre>}
      </div>
    </section>
  );
}
