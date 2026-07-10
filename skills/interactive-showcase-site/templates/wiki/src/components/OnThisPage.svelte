<script lang="ts">
  import { onMount } from 'svelte';
  import { currentLang } from '@/i18n/lang.svelte';

  type Heading = {
    id: string;
    titleEn: string;
    titleZh: string;
  };

  let { headings }: { headings: Heading[] } = $props();
  let active = $state(headings[0]?.id ?? '');
  let lang = $derived(currentLang());

  function text(en: string, zh: string) {
    return lang === 'zh' ? zh : en;
  }

  onMount(() => {
    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => Boolean(node));

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) active = visible.target.id;
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0.1, 0.3, 0.6]
    });

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  });
</script>

<nav class="toc" aria-label={text('On this page', '本页目录')}>
  <h2>{text('On this page', '本页目录')}</h2>
  <ol>
    {#each headings as heading (heading.id)}
      <li>
        <a href={`#${heading.id}`} aria-current={active === heading.id ? 'true' : undefined}>
          {text(heading.titleEn, heading.titleZh)}
        </a>
      </li>
    {/each}
  </ol>
</nav>

<!-- Styles: src/styles/components/on-this-page.css (aggregated by site.css). -->
