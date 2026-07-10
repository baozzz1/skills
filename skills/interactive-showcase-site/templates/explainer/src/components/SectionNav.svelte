<script lang="ts">
  /**
   * SectionNav — sticky top controls + fixed right-side scroll-spy TOC.
   *
   * Receives bilingual section entries (ids are already lang-prefixed by
   * index.astro: `zh-overview`, `en-overview`, ...). On mount, the component
   * scans the visible language's rendered MDX headings inside each section and
   * turns `h2` / `h3` headings into nested jump links. That keeps long section
   * sets out of the top bar while preserving direct access to section and
   * subsection anchors.
   *
   * Compact view (<=1119px): collapses to a "current section" disclosure in
   * the top bar; desktop uses a fixed right rail.
   */
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import LangToggle from './LangToggle.svelte';
  import { currentLang, t } from '@/i18n/lang.svelte';

  type Item = { id: string; title: string };
  type ChildItem = Item & { depth: 2 | 3 };
  type NavItem = Item & { children: ChildItem[] };
  type Props = {
    itemsZh: Item[];
    itemsEn: Item[];
    siteTitleZh: string;
    siteTitleEn: string;
  };
  let { itemsZh, itemsEn, siteTitleZh, siteTitleEn }: Props = $props();

  let lang = $derived(currentLang());
  let strings = $derived(t());
  let items = $derived(lang === 'en' ? itemsEn : itemsZh);
  let siteTitle = $derived(lang === 'en' ? siteTitleEn : siteTitleZh);
  let topId = $derived(lang === 'en' ? 'top-en' : 'top-zh');

  let activeId = $state<string>('');
  let mobileOpen = $state(false);
  let navItems = $state<NavItem[]>([]);
  let mounted = false;
  let scrollRaf = 0;
  let userScrolling = false;
  let scrollLockTimer: ReturnType<typeof setTimeout> | null = null;

  let renderedItems = $derived(navItems.length ? navItems : items.map((it) => ({ ...it, children: [] })));
  let flatItems = $derived(renderedItems.flatMap((it) => [it, ...it.children]));
  let activeParentId = $derived.by(() => {
    for (const it of renderedItems) {
      if (it.id === activeId) return it.id;
      if (it.children.some((c) => c.id === activeId)) return it.id;
    }
    return '';
  });

  // Keep activeId aligned with the current rendered items list.
  $effect(() => {
    if (!flatItems.length) return;
    if (!flatItems.some((it) => it.id === activeId)) {
      activeId = flatItems[0].id;
    }
  });

  function scrollTo(id: string, e?: Event) {
    e?.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
    activeId = id;
    mobileOpen = false;
    // Lock the active id while the smooth scroll is animating so the
    // scroll-spy doesn't fight the target during the glide.
    userScrolling = true;
    if (scrollLockTimer) clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => {
      userScrolling = false;
      scrollLockTimer = null;
    }, 700);
  }

  let activeTitle = $derived(flatItems.find((it) => it.id === activeId)?.title ?? items[0]?.title ?? '');

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
          const id = heading.id.startsWith(`${it.id}-`)
            ? heading.id
            : headingId(it.id, index + 1, title);
          heading.id = id;
          return {
            id,
            title,
            depth: heading.tagName.toLowerCase() === 'h2' ? 2 : 3
          };
        })
        .filter((child): child is ChildItem => Boolean(child));

      return { ...it, children };
    });
  }

  function flatten(currentItems: NavItem[]): Item[] {
    return currentItems.flatMap((it) => [it, ...it.children]);
  }

  function refreshNav(currentItems: Item[]) {
    const nextItems = collectNavItems(currentItems);
    navItems = nextItems;
    updateActive();
  }

  /**
   * Scroll-spy: pick the heading/section whose top sits closest to (but at or
   * above) the threshold line a bit below the sticky nav. This is more stable
   * than IntersectionObserver-with-rootMargin, which can flicker between
   * neighbouring entries when their top edges land in different bands.
   */
  function updateActive() {
    if (userScrolling) return;
    if (!flatItems.length) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    const threshold = navH + 24;
    let bestId = '';
    let bestTop = -Infinity;
    for (const item of flatItems) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      // skip hidden language copies
      if (!el.getClientRects().length) continue;
      const top = el.getBoundingClientRect().top - threshold;
      if (top <= 0 && top > bestTop) {
        bestTop = top;
        bestId = item.id;
      }
    }
    if (!bestId) bestId = flatItems[0].id;
    if (bestId !== activeId) activeId = bestId;
  }

  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      updateActive();
    });
  }

  // Re-scan headings whenever the visible language flips; previous-lang
  // sections are display:none so their bounding rects collapse to zero.
  //
  // IMPORTANT: read `items` BEFORE the `mounted` short-circuit. Svelte 5
  // only tracks reactive dependencies that are actually read during the
  // effect's run, so returning early on the first pass would leave the
  // effect un-subscribed from `items` and the TOC frozen on the initial
  // language. Reading `items` first guarantees subscription on every run.
  $effect(() => {
    const currentItems = items;
    if (!mounted) return;
    const timer = window.setTimeout(() => refreshNav(currentItems), 0);
    return () => {
      window.clearTimeout(timer);
    };
  });

  onMount(() => {
    mounted = true;
    refreshNav(items);
    if (location.hash) {
      const id = location.hash.slice(1);
      if (flatten(navItems).some((it) => it.id === id)) {
        activeId = id;
        setTimeout(() => scrollTo(id), 30);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
    };
  });
</script>

<nav class="section-nav" aria-label={strings.sectionNavAria}>
  <div class="bar page-shell">
    <a class="brand" href={`#${topId}`} onclick={(e) => scrollTo(topId, e)}>
      <span class="brand-mark mono">§</span>
      <span class="brand-title">{siteTitle}</span>
    </a>

    <div class="actions">
      <button
        class="mobile-current"
        onclick={() => (mobileOpen = !mobileOpen)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
      >
        {activeTitle} <span class="caret">▾</span>
      </button>
      <LangToggle />
      <ThemeToggle />
    </div>
  </div>

  {#if mobileOpen}
    <div id="mobile-menu" class="mobile-menu page-shell">
      {#each renderedItems as it (it.id)}
        <a
          href={`#${it.id}`}
          class:active={activeId === it.id}
          class:in-section={activeId !== it.id && activeParentId === it.id}
          onclick={(e) => scrollTo(it.id, e)}
        >{it.title}</a>
        {#each it.children as child (child.id)}
          <a
            class="child"
            class:depth-3={child.depth === 3}
            class:active={activeId === child.id}
            href={`#${child.id}`}
            onclick={(e) => scrollTo(child.id, e)}
          >{child.title}</a>
        {/each}
      {/each}
    </div>
  {/if}
</nav>

<aside class="section-toc" aria-label={strings.sectionNavAria}>
  <div class="toc-card">
    <a class="toc-top" href={`#${topId}`} onclick={(e) => scrollTo(topId, e)}>
      {siteTitle}
    </a>
    <ol class="toc-list">
      {#each renderedItems as it (it.id)}
        <li>
          <a
            href={`#${it.id}`}
            class:active={activeId === it.id}
            class:in-section={activeId !== it.id && activeParentId === it.id}
            onclick={(e) => scrollTo(it.id, e)}
            aria-current={activeId === it.id ? 'true' : undefined}
          >{it.title}</a>
          {#if it.children.length}
            <ol class="toc-children">
              {#each it.children as child (child.id)}
                <li>
                  <a
                    class:depth-3={child.depth === 3}
                    class:active={activeId === child.id}
                    href={`#${child.id}`}
                    onclick={(e) => scrollTo(child.id, e)}
                    aria-current={activeId === child.id ? 'true' : undefined}
                  >{child.title}</a>
                </li>
              {/each}
            </ol>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
</aside>

<!-- Styles: src/styles/components/section-nav.css (aggregated by site.css). -->
