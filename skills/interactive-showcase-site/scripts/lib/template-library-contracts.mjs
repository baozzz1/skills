export const ARCHETYPES = ['explainer', 'scrollytelling', 'cards', 'wiki'];

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;

export function requiredTemplatePaths(root = 'skills/interactive-showcase-site') {
  return [
    ...ARCHETYPES.map((name) => `${root}/templates/${name}`),
    ...ARCHETYPES.map((name) => `${root}/references/${name}.md`)
  ];
}

export function missingRequiredPaths(requiredPaths, existingPaths) {
  const existing = new Set(existingPaths);
  return requiredPaths.filter((path) => !existing.has(path));
}

export function isHexAllowedPath(path) {
  return path.endsWith('/src/styles/tokens.css')
    || path.endsWith('\\src\\styles\\tokens.css');
}

export function scanHexLiterals(files) {
  const violations = [];

  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (isHexAllowedPath(file.path) || isAllowedBaseLayoutFaviconLine(file.path, line)) return;
      const matches = line.match(HEX_COLOR_RE) ?? [];
      for (const value of matches) {
        violations.push({
          path: file.path,
          line: index + 1,
          value
        });
      }
    });
  }

  return violations;
}

function isAllowedBaseLayoutFaviconLine(path, line) {
  const isBaseLayout = path.endsWith('/src/layouts/BaseLayout.astro')
    || path.endsWith('\\src\\layouts\\BaseLayout.astro');
  return isBaseLayout && line.includes('fill=');
}

export function compareKernelEntries(entries) {
  return entries
    .filter((entry) => entry.kernelContent !== entry.templateContent)
    .map((entry) => ({
      kernelPath: entry.kernelPath,
      templatePath: entry.templatePath
    }));
}

const SOURCE_FILE_RE = /\.(astro|tsx|jsx|css|ts|js|md|mdx)$/;

// Which files the hex-discipline scan collects. Exported (not buried in the
// validator) so the tsx/jsx inclusion is unit-tested: without it, hard-coded
// colours in React components silently escape the tokens-only rule.
export function isSourceFile(file) {
  return SOURCE_FILE_RE.test(file);
}

const CSS_IMPORT_RE = /@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)['"]?\s*\)?\s*;?/g;

export function extractCssImports(content) {
  return new Set([...content.matchAll(CSS_IMPORT_RE)].map((match) => match[1]));
}

// Component CSS is only orphan-proof if a page-level stylesheet @imports it.
// Given site.css content and the component stylesheet basenames present on
// disk, return the basenames site.css forgot to import. This replaced the
// former scoped-CSS-hash orphan detector, which no longer applies to plain CSS.
export function unaggregatedComponentStyles(siteCssContent, componentCssBasenames) {
  const imported = new Set(
    [...extractCssImports(siteCssContent)].map((target) => target.split('/').pop())
  );
  return componentCssBasenames.filter((name) => !imported.has(name)).sort();
}

// CodeBlock and Mermaid are duplicated verbatim across explainer and wiki with
// no kernel-sync guard (they are template-local, not kernel files). Assert the
// copies stay byte-identical.
export function duplicatedComponentMismatches(pairs) {
  return pairs
    .filter((pair) => pair.aContent !== pair.bContent)
    .map((pair) => ({ aPath: pair.aPath, bPath: pair.bPath }));
}

export function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    data[key] = parseFrontmatterScalar(rawValue);
  }

  return data;
}

function parseFrontmatterScalar(value) {
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^['"]|['"]$/g, '');
}

export function contentParity(files) {
  const byLang = { en: new Map(), zh: new Map() };

  for (const file of files) {
    const data = extractFrontmatter(file.content);
    const lang = data.lang ?? inferLangFromPath(file.path);
    if (lang !== 'en' && lang !== 'zh') continue;
    const identity = data.conceptId ?? data.id;
    if (!identity) continue;
    byLang[lang].set(identity, {
      order: data.order,
      path: file.path
    });
  }

  const ids = new Set([...byLang.en.keys(), ...byLang.zh.keys()]);
  const missing = [];
  const orderMismatches = [];

  for (const id of ids) {
    const en = byLang.en.get(id);
    const zh = byLang.zh.get(id);
    if (!en || !zh) {
      missing.push({
        id,
        missingLang: en ? 'zh' : 'en'
      });
      continue;
    }
    if (en.order !== zh.order) {
      orderMismatches.push({
        id,
        enOrder: en.order,
        zhOrder: zh.order
      });
    }
  }

  return { missing, orderMismatches };
}

function inferLangFromPath(path) {
  if (/(^|[/\\])en([/\\])/.test(path)) return 'en';
  if (/(^|[/\\])zh([/\\])/.test(path)) return 'zh';
  return undefined;
}
