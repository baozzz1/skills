/**
 * Tabs — variant-style switcher. Props-only API: each tab's body is a raw HTML
 * string (author-provided, trusted in this skill's context) injected via
 * dangerouslySetInnerHTML. Styles: src/styles/components/tabs.css.
 */
import { useState } from 'react';
import type { KeyboardEvent } from 'react';

type Tab = { label: string; html: string };
type Props = {
  tabs: Tab[];
  group?: string;
  initial?: number;
};

export default function Tabs({ tabs, group = 'tabs', initial = 0 }: Props) {
  const [active, setActive] = useState(initial);

  function selectByKey(event: KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActive((idx + 1) % tabs.length);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActive((idx - 1 + tabs.length) % tabs.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(tabs.length - 1);
    }
  }

  return (
    <div className="tabs-wrap">
      <div role="tablist" className="tablist" aria-label={group}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            id={`tab-${group}-${i}`}
            aria-selected={active === i}
            aria-controls={`panel-${group}-${i}`}
            tabIndex={active === i ? 0 : -1}
            className={active === i ? 'tab active' : 'tab'}
            onClick={() => setActive(i)}
            onKeyDown={(e) => selectByKey(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`panel-${group}-${i}`}
          aria-labelledby={`tab-${group}-${i}`}
          hidden={active !== i}
          className="panel"
          dangerouslySetInnerHTML={{ __html: tab.html }}
        />
      ))}
    </div>
  );
}
