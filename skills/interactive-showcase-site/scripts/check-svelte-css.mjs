#!/usr/bin/env bun
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { extractSvelteHashes, missingSvelteHashes } from './lib/template-library-contracts.mjs';

const templateDir = path.resolve(process.argv[2] ?? '.');
const distDir = path.join(templateDir, 'dist');
const astroDir = path.join(distDir, '_astro');

const htmlFiles = await listFiles(distDir, (file) => file.endsWith('.html'));
const cssFiles = await listFiles(astroDir, (file) => file.endsWith('.css')).catch(() => []);

if (htmlFiles.length === 0) {
  fail(`No HTML files found under ${distDir}. Run bun run build first.`);
}

let combinedCss = '';
for (const file of cssFiles) {
  combinedCss += await readFile(file, 'utf8');
  combinedCss += '\n';
}

const cssHashes = extractSvelteHashes(combinedCss);
const failures = [];

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  const htmlHashes = extractSvelteHashes(html);
  const missing = missingSvelteHashes(htmlHashes, cssHashes);
  if (missing.length > 0) {
    failures.push({
      route: path.relative(distDir, htmlFile),
      missing
    });
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Missing Svelte CSS hashes in ${failure.route}:`);
    for (const hash of failure.missing) {
      console.error(`  - ${hash}`);
    }
  }
  process.exit(1);
}

console.log(`Svelte CSS hash check passed for ${htmlFiles.length} route(s).`);

async function listFiles(root, predicate) {
  const rootStat = await stat(root);
  if (!rootStat.isDirectory()) return [];

  const out = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...await listFiles(fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath)) {
      out.push(fullPath);
    }
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
