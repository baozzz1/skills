import { describe, expect, test } from 'bun:test';
import {
  compareKernelEntries,
  contentParity,
  extractSvelteHashes,
  missingRequiredPaths,
  missingSvelteHashes,
  requiredTemplatePaths,
  scanHexLiterals
} from './template-library-contracts.mjs';

describe('required template paths', () => {
  test('reports missing archetype paths', () => {
    const required = requiredTemplatePaths('skill');
    const existing = required.filter((path) => path !== 'skill/templates/wiki');

    expect(missingRequiredPaths(required, existing)).toEqual(['skill/templates/wiki']);
  });

  test('passes when all archetype paths exist', () => {
    const required = requiredTemplatePaths('skill');

    expect(missingRequiredPaths(required, required)).toEqual([]);
  });
});

describe('hex scanning', () => {
  test('ignores tokens and BaseLayout favicon literals', () => {
    const violations = scanHexLiterals([
      { path: 'template/src/styles/tokens.css', content: ':root { --clay: #D97757; }' },
      { path: 'template/src/layouts/BaseLayout.astro', content: "fill='#FFFFFF'" }
    ]);

    expect(violations).toEqual([]);
  });

  test('reports non-favicon BaseLayout literals', () => {
    const violations = scanHexLiterals([
      { path: 'template/src/layouts/BaseLayout.astro', content: "const color = '#FFFFFF';" }
    ]);

    expect(violations).toEqual([
      {
        path: 'template/src/layouts/BaseLayout.astro',
        line: 1,
        value: '#FFFFFF'
      }
    ]);
  });

  test('reports hex literals outside allowed files', () => {
    const violations = scanHexLiterals([
      { path: 'template/src/components/Foo.svelte', content: '.foo { color: #D97757; }' }
    ]);

    expect(violations).toEqual([
      {
        path: 'template/src/components/Foo.svelte',
        line: 1,
        value: '#D97757'
      }
    ]);
  });
});

describe('kernel comparison', () => {
  test('passes identical entries', () => {
    expect(compareKernelEntries([
      {
        kernelPath: 'shared/kernel/src/styles/tokens.css',
        templatePath: 'templates/explainer/src/styles/tokens.css',
        kernelContent: 'a\n',
        templateContent: 'a\n'
      }
    ])).toEqual([]);
  });

  test('reports byte drift', () => {
    expect(compareKernelEntries([
      {
        kernelPath: 'shared/kernel/src/styles/tokens.css',
        templatePath: 'templates/explainer/src/styles/tokens.css',
        kernelContent: 'a\n',
        templateContent: 'a'
      }
    ])).toEqual([
      {
        kernelPath: 'shared/kernel/src/styles/tokens.css',
        templatePath: 'templates/explainer/src/styles/tokens.css'
      }
    ]);
  });
});

describe('content parity', () => {
  test('passes matching id and order pairs', () => {
    const parity = contentParity([
      { path: 'content/en/01-overview.mdx', content: '---\nid: overview\norder: 1\nlang: en\n---\n' },
      { path: 'content/zh/01-overview.mdx', content: '---\nid: overview\norder: 1\nlang: zh\n---\n' }
    ]);

    expect(parity).toEqual({ missing: [], orderMismatches: [] });
  });

  test('reports missing language and order mismatch', () => {
    const parity = contentParity([
      { path: 'content/en/01-overview.mdx', content: '---\nid: overview\norder: 1\nlang: en\n---\n' },
      { path: 'content/zh/01-overview.mdx', content: '---\nid: overview\norder: 2\nlang: zh\n---\n' },
      { path: 'content/en/02-only-en.mdx', content: '---\nid: only-en\norder: 2\nlang: en\n---\n' }
    ]);

    expect(parity).toEqual({
      missing: [{ id: 'only-en', missingLang: 'zh' }],
      orderMismatches: [{ id: 'overview', enOrder: 1, zhOrder: 2 }]
    });
  });
});

describe('svelte hash extraction', () => {
  test('passes when html hashes exist in css', () => {
    const htmlHashes = extractSvelteHashes('<div class="card svelte-abc123"></div>');
    const cssHashes = extractSvelteHashes('.card.svelte-abc123{display:block}');

    expect(missingSvelteHashes(htmlHashes, cssHashes)).toEqual([]);
  });

  test('reports html-only hashes', () => {
    const htmlHashes = extractSvelteHashes('<div class="card svelte-abc123 svelte-def456"></div>');
    const cssHashes = extractSvelteHashes('.card.svelte-abc123{display:block}');

    expect(missingSvelteHashes(htmlHashes, cssHashes)).toEqual(['svelte-def456']);
  });
});
