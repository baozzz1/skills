/**
 * HoloCard — pointer-tracked holographic card. The tilt/shine effect is pure
 * CSS driven by custom properties written on pointermove; the component holds
 * NO state, so the handler must never call setState (one re-render per
 * pointermove would tank it). Styles: src/styles/components/holo-card.css.
 */
import type { PointerEvent } from 'react';
import { useLang } from '@/i18n/lang';
import type { Card, CardMode } from '@/lib/cards';

type Props = { card: Card; mode?: CardMode };

function onPointerMove(event: PointerEvent<HTMLElement>) {
  const target = event.currentTarget;
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

function onPointerLeave(event: PointerEvent<HTMLElement>) {
  const target = event.currentTarget;
  target.style.setProperty('--rotate-x', '0deg');
  target.style.setProperty('--rotate-y', '0deg');
  target.style.setProperty('--pointer-from-center', '0');
}

export default function HoloCard({ card, mode = 'glint' }: Props) {
  const lang = useLang();
  const text = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const className =
    'holo-card' +
    (card.variant === 'featured' ? ' featured' : '') +
    (card.variant === 'gold' ? ' gold' : '');

  const inner = (
    <>
      <span className="shine" aria-hidden="true" />
      <span className="glare" aria-hidden="true" />
      <span className="content">
        <span className="icon" aria-hidden="true">{card.icon ?? '*'}</span>
        <span className="title">{text(card.titleEn, card.titleZh)}</span>
        <span className="subtitle">{text(card.subtitleEn, card.subtitleZh)}</span>
        <span className="chips" aria-label={text('Card tags', '卡片标签')}>
          {(card.chips ?? []).map((chip, index) => (
            <span key={index} className={`chip ${chip.tone}`}>{text(chip.labelEn, chip.labelZh)}</span>
          ))}
        </span>
      </span>
    </>
  );

  if (card.href) {
    return (
      <a
        className={className}
        href={card.href}
        data-mode={mode}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      data-mode={mode}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {inner}
    </button>
  );
}
