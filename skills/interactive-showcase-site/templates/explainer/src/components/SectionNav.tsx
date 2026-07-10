/**
 * SectionNav — sticky top controls + fixed right-side scroll-spy TOC.
 *
 * Reaches OUTSIDE its own React tree by design: it scans the visible language's
 * MDX headings (rendered by the Astro page, not React), mutates their DOM ids
 * to language-prefixed slugs, and runs a manual rAF-throttled getBounding
 * ClientRect scroll-spy (deliberately NOT IntersectionObserver — that flickered
 * between neighbours). Because React does not own those heading nodes, mutating
 * their ids in an effect is safe. Listeners read live state through refs so the
 * scroll handler never captures a stale flatItems.
 * Styles: src/styles/components/section-nav.css.
 */
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LangToggle from '@/components/LangToggle';
import { useLang, useStrings } from '@/i18n/lang';

type Item = { id: string; title: string };
type ChildItem = Item & { depth: 2 | 3 };
type NavItem = Item & { children: ChildItem[] };
type Props = {
  itemsZh: Item[];
  itemsEn: Item[];
  siteTitleZh: string;
  siteTitleEn: string;
};

function headingId(sectionId: string, index: number, text: string) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}_-]+/gu, '')
    .slice(0, 42);
  return `${sectionId}-heading-${index}${slug ? `-${slug}` : ''}`;
}

function collectNavItems(currentItems: Item[]): NavItem[] {
  return currentItems.map((it) => {
    const section = document.getElementById(it.id);
    if (!section) return { ...it, children: [] };

    const headings = Array.from(section.querySelectorAll<HTMLElement>('.section-body h2, .section-body h3'));
    const children = headings
      .map((heading, index): ChildItem | null => {
        const title = heading.textContent?.replace(/\s+/g, ' ').trim();
        if (!title) return null;
        const id = heading.id.startsWith(`${it.id}-`) ? heading.id : headingId(it.id, index + 1, title);
        heading.id = id;
        return { id, title, depth: heading.tagName.toLowerCase() === 'h2' ? 2 : 3 };
      })
      .filter((child): child is ChildItem => Boolean(child));

    return { ...it, children };
  });
}

export default function SectionNav({ itemsZh, itemsEn, siteTitleZh, siteTitleEn }: Props) {
  const lang = useLang();
  const strings = useStrings();

  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  const items = lang === 'en' ? itemsEn : itemsZh;
  const siteTitle = lang === 'en' ? siteTitleEn : siteTitleZh;
  const topId = lang === 'en' ? 'top-en' : 'top-zh';

  const renderedItems: NavItem[] = navItems.length
    ? navItems
    : items.map((it) => ({ ...it, children: [] }));
  const flatItems: Item[] = renderedItems.flatMap((it) => [it, ...it.children]);
  const activeParentId = (() => {
    for (const it of renderedItems) {
      if (it.id === activeId) return it.id;
      if (it.children.some((c) => c.id === activeId)) return it.id;
    }
    return '';
  })();
  const activeTitle = flatItems.find((it) => it.id === activeId)?.title ?? items[0]?.title ?? '';

  // Live mirrors for the scroll listener, which is attached once but must read
  // the current items after every language flip / heading re-scan.
  const itemsRef = useRef(items);
  const flatItemsRef = useRef(flatItems);
  itemsRef.current = items;
  flatItemsRef.current = flatItems;

  const scrollRaf = useRef(0);
  const userScrolling = useRef(false);
  const scrollLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langInit = useRef(true);

  function updateActive() {
    if (userScrolling.current) return;
    const flat = flatItemsRef.current;
    if (!flat.length) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    const threshold = navH + 24;
    let bestId = '';
    let bestTop = -Infinity;
    for (const item of flat) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      if (!el.getClientRects().length) continue; // skip hidden language copies
      const top = el.getBoundingClientRect().top - threshold;
      if (top <= 0 && top > bestTop) {
        bestTop = top;
        bestId = item.id;
      }
    }
    if (!bestId) bestId = flat[0].id;
    setActiveId((prev) => (bestId !== prev ? bestId : prev));
  }

  function scrollTo(id: string, event?: React.SyntheticEvent) {
    event?.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
    setActiveId(id);
    setMobileOpen(false);
    // Lock the active id while the smooth scroll animates so scroll-spy doesn't
    // fight the target during the glide.
    userScrolling.current = true;
    if (scrollLockTimer.current) clearTimeout(scrollLockTimer.current);
    scrollLockTimer.current = setTimeout(() => {
      userScrolling.current = false;
      scrollLockTimer.current = null;
    }, 700);
  }

  // Mount: initial scan, hash handling, scroll/resize listeners.
  useEffect(() => {
    setNavItems(collectNavItems(itemsRef.current));

    if (location.hash) {
      const id = location.hash.slice(1);
      const flat = collectNavItems(itemsRef.current).flatMap((it) => [it, ...it.children]);
      if (flat.some((it) => it.id === id)) {
        setActiveId(id);
        setTimeout(() => scrollTo(id), 30);
      }
    }

    const onScroll = () => {
      if (scrollRaf.current) return;
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = 0;
        updateActive();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
      if (scrollLockTimer.current) clearTimeout(scrollLockTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-scan headings when the visible language flips; hidden-language sections
  // collapse to zero client rects so the scroll-spy skips them.
  useEffect(() => {
    if (langInit.current) {
      langInit.current = false;
      return;
    }
    const timer = window.setTimeout(() => setNavItems(collectNavItems(itemsRef.current)), 0);
    return () => window.clearTimeout(timer);
  }, [lang]);

  // Keep activeId inside the current items and recompute the active section.
  useEffect(() => {
    const flat = flatItemsRef.current;
    if (flat.length && !flat.some((it) => it.id === activeId)) {
      setActiveId(flat[0].id);
    }
    updateActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navItems]);

  return (
    <>
      <nav className="section-nav" aria-label={strings.sectionNavAria}>
        <div className="bar page-shell">
          <a className="brand" href={`#${topId}`} onClick={(e) => scrollTo(topId, e)}>
            <span className="brand-mark mono">§</span>
            <span className="brand-title">{siteTitle}</span>
          </a>

          <div className="actions">
            <button
              className="mobile-current"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {activeTitle} <span className="caret">▾</span>
            </button>
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>

        {mobileOpen && (
          <div id="mobile-menu" className="mobile-menu page-shell">
            {renderedItems.map((it) => (
              <div key={it.id} style={{ display: 'contents' }}>
                <a
                  href={`#${it.id}`}
                  className={
                    activeId === it.id
                      ? 'active'
                      : activeParentId === it.id
                        ? 'in-section'
                        : undefined
                  }
                  onClick={(e) => scrollTo(it.id, e)}
                >
                  {it.title}
                </a>
                {it.children.map((child) => (
                  <a
                    key={child.id}
                    className={
                      'child' +
                      (child.depth === 3 ? ' depth-3' : '') +
                      (activeId === child.id ? ' active' : '')
                    }
                    href={`#${child.id}`}
                    onClick={(e) => scrollTo(child.id, e)}
                  >
                    {child.title}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      <aside className="section-toc" aria-label={strings.sectionNavAria}>
        <div className="toc-card">
          <a className="toc-top" href={`#${topId}`} onClick={(e) => scrollTo(topId, e)}>
            {siteTitle}
          </a>
          <ol className="toc-list">
            {renderedItems.map((it) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className={
                    activeId === it.id
                      ? 'active'
                      : activeParentId === it.id
                        ? 'in-section'
                        : undefined
                  }
                  onClick={(e) => scrollTo(it.id, e)}
                  aria-current={activeId === it.id ? 'true' : undefined}
                >
                  {it.title}
                </a>
                {it.children.length > 0 && (
                  <ol className="toc-children">
                    {it.children.map((child) => (
                      <li key={child.id}>
                        <a
                          className={
                            (child.depth === 3 ? 'depth-3' : '') + (activeId === child.id ? ' active' : '')
                          }
                          href={`#${child.id}`}
                          onClick={(e) => scrollTo(child.id, e)}
                          aria-current={activeId === child.id ? 'true' : undefined}
                        >
                          {child.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </>
  );
}
