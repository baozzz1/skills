/**
 * Mermaid — render a mermaid diagram, click nodes to open a side panel.
 *
 * - Theme aware: reads CSS variables -> mermaid.themeVariables.
 * - Re-renders when [data-theme] flips (mermaid bakes theme into the SVG).
 * - Click handlers are wired AFTER the SVG lands in the DOM. In React setState
 *   is async, so — unlike Svelte's queueMicrotask — binding must happen in an
 *   effect keyed on the rendered SVG, not right after setSvgHtml.
 *
 * Duplicated verbatim in explainer and wiki (checkDuplicatedComponents guards
 * the pair). Styles: src/styles/components/mermaid.css.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useStrings } from '@/i18n/lang';

type NodeDoc = { title: string; body: string };
type Props = {
  spec: string;
  nodes?: Record<string, NodeDoc>;
  legend?: { swatch: string; label: string }[];
  title?: string;
};

function readVar(name: string): string {
  if (typeof getComputedStyle === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildThemeVars() {
  return {
    background: readVar('--ivory') || 'transparent',
    primaryColor: readVar('--paper') || 'white',
    primaryTextColor: readVar('--slate') || 'black',
    primaryBorderColor: readVar('--gray-500') || 'gray',
    lineColor: readVar('--gray-500') || 'gray',
    secondaryColor: readVar('--gray-100') || 'whitesmoke',
    tertiaryColor: readVar('--oat') || 'beige',
    fontFamily: 'IBM Plex Sans Variable, system-ui, sans-serif',
    fontSize: '13px'
  };
}

export default function Mermaid({ spec, nodes = {}, legend = [], title }: Props) {
  const strings = useStrings();
  const hostRef = useRef<HTMLDivElement>(null);
  const bindRef = useRef<((el: Element) => void) | undefined>(undefined);
  const renderSeq = useRef(0);

  const [detail, setDetail] = useState<NodeDoc | null>(null);
  const [svgHtml, setSvgHtml] = useState('');
  const [pending, setPending] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const render = useCallback(async () => {
    setPending(true);
    setErrorMsg(null);
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        themeVariables: buildThemeVars(),
        flowchart: { curve: 'basis', htmlLabels: true },
        fontFamily: 'IBM Plex Sans Variable, system-ui, sans-serif'
      });
      const id = `mm-${Math.random().toString(36).slice(2, 9)}-${renderSeq.current++}`;
      const { svg, bindFunctions } = await mermaid.render(id, spec.trim());
      bindRef.current = bindFunctions;
      setSvgHtml(svg);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setPending(false);
    }
  }, [spec]);

  // Initial render + re-render on theme flip (mermaid's theme is baked in).
  useEffect(() => {
    render();
    const observer = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          render();
          return;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', render);
    return () => {
      observer.disconnect();
      mq?.removeEventListener?.('change', render);
    };
  }, [render]);

  // Wire click handlers AFTER the freshly rendered SVG is in the DOM. Each
  // render replaces the SVG wholesale, so listeners never accumulate.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !svgHtml) return;
    bindRef.current?.(host);

    const svgEl = host.querySelector('svg');
    if (!svgEl) return;
    const nodeKeys = Object.keys(nodes);
    if (!nodeKeys.length) return;

    svgEl.querySelectorAll('g.node').forEach((g) => {
      const id = g.id || '';
      const key = nodeKeys.find((k) => new RegExp(`(^|-)${k}(-|$)`).test(id));
      if (!key) return;
      g.classList.add('mm-clickable');
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', nodes[key].title);
      const open = (event: Event) => {
        event.stopPropagation();
        setDetail(nodes[key]);
        svgEl.querySelectorAll('g.node.mm-selected').forEach((n) => n.classList.remove('mm-selected'));
        g.classList.add('mm-selected');
      };
      g.addEventListener('click', open);
      g.addEventListener('keydown', (ev) => {
        const k = ev as KeyboardEvent;
        if (k.key === 'Enter' || k.key === ' ') {
          k.preventDefault();
          open(ev);
        }
      });
    });
  }, [svgHtml, nodes]);

  return (
    <div className="mermaid-shell" ref={hostRef}>
      {title && <div className="title">{title}</div>}
      <div className={`canvas${pending ? ' is-loading' : ''}${errorMsg ? ' has-error' : ''}`}>
        {pending ? (
          <div className="placeholder" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>{strings.mermaidRendering}</span>
          </div>
        ) : errorMsg ? (
          <div className="error">{strings.mermaidFailedPrefix}{errorMsg}</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
        )}
      </div>

      {legend.length > 0 && (
        <div className="legend">
          {legend.map((l, index) => (
            <span key={index} className="legend-item">
              <span className="swatch" style={{ background: l.swatch }} />
              {l.label}
            </span>
          ))}
        </div>
      )}

      {!pending && !errorMsg && (
        <div className={`node-detail${detail ? '' : ' is-empty'}`} aria-live="polite">
          {detail ? (
            <>
              <strong className="d-title">{detail.title}</strong>
              <p className="d-body">{detail.body}</p>
            </>
          ) : (
            <em className="hint">{strings.mermaidHint}</em>
          )}
        </div>
      )}
    </div>
  );
}
