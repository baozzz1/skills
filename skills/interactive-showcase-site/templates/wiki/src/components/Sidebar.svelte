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

<style>
  .sidebar {
    position: sticky;
    top: calc(var(--nav-h) + 24px);
    display: grid;
    gap: 26px;
    align-self: start;
    max-height: calc(100vh - var(--nav-h) - 48px);
    overflow: auto;
    padding-right: 8px;
  }

  h2 {
    margin: 0 0 10px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gray-500);
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  a {
    display: block;
    border-bottom: 0;
    border-radius: var(--radius-row);
    padding: 8px 10px;
    color: var(--gray-700);
    font-family: var(--mono);
    font-size: 12px;
  }

  a:hover,
  a[aria-current='page'] {
    background: color-mix(in oklch, var(--clay) 10%, var(--paper));
    color: var(--clay);
  }

  @media (max-width: 1040px) {
    .sidebar {
      position: relative;
      top: auto;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      max-height: none;
      border-bottom: var(--border);
      padding: 0 0 18px;
    }
  }
</style>
