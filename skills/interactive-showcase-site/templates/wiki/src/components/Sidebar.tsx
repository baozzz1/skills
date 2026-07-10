/**
 * Sidebar — category navigation for the concept atlas. Styles:
 * src/styles/components/sidebar.css.
 */
import { useLang } from '@/i18n/lang';
import type { Category } from '@/lib/atlas';

type Props = { tree: Category[]; currentId: string };

export default function Sidebar({ tree, currentId }: Props) {
  const lang = useLang();
  const text = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  return (
    <nav className="sidebar" aria-label={text('Concept navigation', '概念导航')}>
      {tree.map((category) => (
        <section key={category.id}>
          <h2>{text(category.titleEn, category.titleZh)}</h2>
          <ol>
            {category.items.map((id) => (
              <li key={id}>
                <a href={`${import.meta.env.BASE_URL}${id}/`} aria-current={id === currentId ? 'page' : undefined}>
                  {id}
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </nav>
  );
}
