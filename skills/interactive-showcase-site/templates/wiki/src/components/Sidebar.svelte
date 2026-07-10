<script lang="ts">
  import { currentLang } from '@/i18n/lang.svelte';
  import type { Category } from '@/lib/atlas';

  let { tree, currentId }: { tree: Category[]; currentId: string } = $props();
  let lang = $derived(currentLang());

  function text(en: string, zh: string) {
    return lang === 'zh' ? zh : en;
  }
</script>

<nav class="sidebar" aria-label={text('Concept navigation', '概念导航')}>
  {#each tree as category (category.id)}
    <section>
      <h2>{text(category.titleEn, category.titleZh)}</h2>
      <ol>
        {#each category.items as id}
          <li>
            <a href={`${import.meta.env.BASE_URL}${id}/`} aria-current={id === currentId ? 'page' : undefined}>
              {id}
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {/each}
</nav>

<!-- Styles: src/styles/components/sidebar.css (aggregated by site.css). -->
