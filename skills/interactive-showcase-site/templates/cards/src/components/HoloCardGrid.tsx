/**
 * HoloCardGrid — grid wrapper that establishes the 3D perspective context for
 * the child HoloCards. Styles: src/styles/components/holo-card-grid.css.
 */
import HoloCard from '@/components/HoloCard';
import type { Card, CardMode } from '@/lib/cards';

type Props = { cards: Card[]; mode?: CardMode };

export default function HoloCardGrid({ cards, mode = 'glint' }: Props) {
  return (
    <div className="holo-grid" data-mode={mode}>
      {cards.map((card) => (
        <HoloCard key={card.titleEn} card={card} mode={mode} />
      ))}
    </div>
  );
}
