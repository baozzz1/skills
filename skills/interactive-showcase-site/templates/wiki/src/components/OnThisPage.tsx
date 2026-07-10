/**
 * OnThisPage — right-rail table of contents with scroll-spy over the page's
 * headings (rendered outside this island, in the Astro page). Styles:
 * src/styles/components/on-this-page.css.
 */
import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/lang';

type Heading = { id: string; titleEn: string; titleZh: string };
type Props = { headings: Heading[] };

export default function OnThisPage({ headings }: Props) {
  const lang = useLang();
  const [active, setActive] = useState(headings[0]?.id ?? '');
  const text = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  useEffect(() => {
    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => Boolean(node));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0.1, 0.3, 0.6] }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="toc" aria-label={text('On this page', '本页目录')}>
      <h2>{text('On this page', '本页目录')}</h2>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`} aria-current={active === heading.id ? 'true' : undefined}>
              {text(heading.titleEn, heading.titleZh)}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
