<script lang="ts">
  /**
   * SectionNav — sticky top bar with scroll-spy + smooth scroll.
   *
   * Receives bilingual {id, title} entries (one set per language; ids are
   * already lang-prefixed by index.astro: `zh-overview`, `en-overview`, ...).
   * The component picks the active set from the reactive language store and
   * only observes / renders that set.
   *
   * Mobile (<=820px): collapses to a "current section" disclosure that opens
   * a full-width menu; desktop is an inline horizontal list.
   */
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import LangToggle from './LangToggle.svelte';
  import { currentLang, t } from '@/i18n/lang.svelte';

  type Item = { id: string; title: string };
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
  let observer: IntersectionObserver | null = null;

  // Keep activeId aligned with the current items list.
  $effect(() => {
    if (!items.length) return;
    if (!items.some((it) => it.id === activeId)) {
      activeId = items[0].id;
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
  }

  let activeTitle = $derived(
    items.find((it) => it.id === activeId)?.title ?? items[0]?.title ?? ''
  );

  function attachObserver(currentItems: Item[]) {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    const sections = currentItems
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
          activeId = visible[0].target.id;
        }
      },
      {
        rootMargin: `-${navH + 20}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.4]
      }
    );
    sections.forEach((s) => observer!.observe(s));
  }

  // Re-attach the IntersectionObserver whenever the visible language flips,
  // since the previous-lang sections are display:none and no longer scrollable.
  $effect(() => {
    attachObserver(items);
    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };
  });

  onMount(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      if (items.some((it) => it.id === id)) {
        activeId = id;
        setTimeout(() => scrollTo(id), 30);
      }
    }
  });
</script>

<nav class="section-nav" aria-label={strings.sectionNavAria}>
  <div class="bar page-shell">
    <a class="brand" href={`#${topId}`} onclick={(e) => scrollTo(topId, e)}>
      <span class="brand-mark mono">§</span>
      <span class="brand-title">{siteTitle}</span>
    </a>

    <ul class="links">
      {#each items as it (it.id)}
        <li>
          <a
            href={`#${it.id}`}
            class:active={activeId === it.id}
            onclick={(e) => scrollTo(it.id, e)}
            aria-current={activeId === it.id ? 'true' : undefined}
          >{it.title}</a>
        </li>
      {/each}
    </ul>

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
      {#each items as it (it.id)}
        <a
          href={`#${it.id}`}
          class:active={activeId === it.id}
          onclick={(e) => scrollTo(it.id, e)}
        >{it.title}</a>
      {/each}
    </div>
  {/if}
</nav>

<style>
  .section-nav {
    position: sticky;
    top: 0;
    z-index: 30;
    height: var(--nav-h);
    background: color-mix(in oklch, var(--ivory) 92%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--gray-100);
  }
  .bar {
    height: var(--nav-h);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--slate);
    border-bottom: 0;
    flex: 0 0 auto;
  }
  .brand:hover { color: var(--clay); }
  .brand-mark {
    color: var(--clay);
    font-size: 16px;
  }
  .brand-title {
    font-family: var(--serif);
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.005em;
  }
  .links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 4px;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .links::-webkit-scrollbar { display: none; }
  .links li { flex: 0 0 auto; }
  .links a {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 6px;
    font-family: var(--sans);
    font-size: 13px;
    color: var(--gray-700);
    border-bottom: 0;
    white-space: nowrap;
    transition: color 0.15s ease, background 0.15s ease;
  }
  .links a:hover { color: var(--slate); background: var(--gray-100); }
  .links a.active {
    color: var(--slate);
    background: var(--surface-pill);
    box-shadow: inset 0 -1px 0 var(--clay);
  }
  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex: 0 0 auto;
  }
  .mobile-current {
    display: none;
    padding: 6px 12px;
    border: 1.5px solid var(--gray-300);
    border-radius: 8px;
    background: var(--paper);
    color: var(--slate);
    font-family: var(--sans);
    font-size: 13px;
  }
  .mobile-current .caret { font-size: 10px; color: var(--gray-500); margin-left: 4px; }
  .mobile-menu {
    display: none;
    flex-direction: column;
    gap: 4px;
    padding-top: 10px;
    padding-bottom: 12px;
    background: var(--paper);
    border-bottom: 1px solid var(--gray-100);
  }
  .mobile-menu a {
    display: block;
    padding: 8px 10px;
    border-radius: 6px;
    color: var(--gray-700);
    font-family: var(--sans);
    font-size: 14px;
    border-bottom: 0;
  }
  .mobile-menu a.active {
    color: var(--slate);
    background: var(--surface-pill);
  }

  @media (max-width: 820px) {
    .links { display: none; }
    .mobile-current { display: inline-flex; align-items: center; }
    .mobile-menu { display: flex; }
  }
</style>
