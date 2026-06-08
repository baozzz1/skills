export const ARCHETYPES = ['explainer', 'scrollytelling', 'cards', 'wiki'];

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;
const SVELTE_HASH_RE = /svelte-(?=[a-z0-9]*\d)[a-z0-9]+/g;

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

export function extractSvelteHashes(content) {
  return new Set(content.match(SVELTE_HASH_RE) ?? []);
}

export function missingSvelteHashes(htmlHashes, cssHashes) {
  const css = new Set(cssHashes);
  return [...htmlHashes].filter((hash) => !css.has(hash)).sort();
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
