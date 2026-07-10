/**
 * Hero — page-level hero (eyebrow + h1 + lead + chips + optional first-screen
 * map). Static: no state, no client:* directive, ships zero JS. Styles:
 * src/styles/components/hero.css.
 */
type Tone = 'clay' | 'olive' | 'rust' | 'info' | 'muted';
type Chip = { label: string; tone?: Tone };
type SummaryItem = { label: string; title: string; body: string; tone?: Tone };
type Props = {
  eyebrow?: string;
  title: string;
  lead?: string;
  chips?: Chip[];
  summaryTitle?: string;
  summaryItems?: SummaryItem[];
};

export default function Hero({
  eyebrow,
  title,
  lead,
  chips = [],
  summaryTitle = 'PROJECT SNAPSHOT',
  summaryItems = []
}: Props) {
  return (
    <header className="page-hero" id="top">
      <div className="hero-copy">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="title">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {chips.length > 0 && (
          <div className="chips">
            {chips.map((c) => (
              <span key={c.label} className="chip" data-tone={c.tone ?? 'muted'}>
                <span className="dot" data-tone={c.tone ?? 'muted'} />
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {summaryItems.length > 0 && (
        <section className="summary" aria-label={summaryTitle}>
          <div className="summary-title mono">{summaryTitle}</div>
          <ol className="map-list">
            {summaryItems.map((item) => (
              <li key={item.label} className="map-row">
                <div className="map-num mono">
                  <span className="dot" data-tone={item.tone ?? 'muted'} />
                  {item.label}
                </div>
                <h2 className="map-title">{item.title}</h2>
                <p className="map-body">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </header>
  );
}
