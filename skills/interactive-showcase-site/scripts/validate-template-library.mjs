#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ARCHETYPES,
  compareKernelEntries,
  contentParity,
  duplicatedComponentMismatches,
  isSourceFile,
  missingRequiredPaths,
  requiredTemplatePaths,
  scanHexLiterals,
  unaggregatedComponentStyles
} from './lib/template-library-contracts.mjs';

// Components duplicated verbatim across templates with no kernel-sync guard.
// Extension is resolved at runtime so the filename is the only thing that
// changes here.
const DUPLICATED_COMPONENTS = [
  { file: 'CodeBlock', a: 'explainer', b: 'wiki' },
  { file: 'Mermaid', a: 'explainer', b: 'wiki' }
];

const repoRoot = path.resolve(process.argv[2] ?? process.cwd());
const skillRoot = path.join(repoRoot, 'skills/interactive-showcase-site');
const failures = [];

await checkRequiredPaths();
await checkSkillPathReferences();
await checkHexLiterals();
await checkKernelDrift();
await checkContentParity();
await checkStylesAggregated();
await checkDuplicatedComponents();

if (failures.length > 0) {
  console.error('Template library validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Template library validation passed.');

async function checkRequiredPaths() {
  const required = requiredTemplatePaths('skills/interactive-showcase-site');
  const existing = required.filter((relativePath) => existsSync(path.join(repoRoot, relativePath)));
  for (const missing of missingRequiredPaths(required, existing)) {
    failures.push(`Missing required path: ${missing}`);
  }
}

async function checkSkillPathReferences() {
  const skillPath = path.join(skillRoot, 'SKILL.md');
  if (!existsSync(skillPath)) return;
  const skill = await readFile(skillPath, 'utf8');
  if (skill.includes('${CLAUDE_SKILL_DIR}/template/')) {
    failures.push('SKILL.md still references ${CLAUDE_SKILL_DIR}/template/.');
  }
}

async function checkHexLiterals() {
  const files = [];
  for (const archetype of ARCHETYPES) {
    const srcRoot = path.join(skillRoot, 'templates', archetype, 'src');
    if (!existsSync(srcRoot)) continue;
    for (const file of await listFiles(srcRoot, isSourceFile)) {
      files.push({
        path: normalize(file),
        content: await readFile(file, 'utf8')
      });
    }
  }

  for (const violation of scanHexLiterals(files)) {
    failures.push(`Unauthorized hex color ${violation.value} in ${violation.path}:${violation.line}.`);
  }
}

async function checkKernelDrift() {
  const kernelFiles = [
    '.gitignore',
    'tsconfig.json',
    'src/styles/tokens.css',
    'src/styles/global.css',
    'src/styles/components/theme-toggle.css',
    'src/styles/components/lang-toggle.css',
    'src/layouts/BaseLayout.astro',
    'src/i18n/lang.ts',
    'src/components/ThemeToggle.tsx',
    'src/components/LangToggle.tsx'
  ];

  const entries = [];
  for (const archetype of ARCHETYPES) {
    const templatePath = path.join(skillRoot, 'templates', archetype);
    if (!existsSync(templatePath)) continue;

    for (const kernelFile of kernelFiles) {
      const kernelPath = path.join(skillRoot, 'shared/kernel', kernelFile);
      const templateFile = path.join(templatePath, kernelFile);
      if (!existsSync(kernelPath) || !existsSync(templateFile)) continue;
      entries.push({
        kernelPath: normalize(kernelPath),
        templatePath: normalize(templateFile),
        kernelContent: await readFile(kernelPath, 'utf8'),
        templateContent: await readFile(templateFile, 'utf8')
      });
    }
  }

  for (const mismatch of compareKernelEntries(entries)) {
    failures.push(`Kernel drift: ${mismatch.templatePath} differs from ${mismatch.kernelPath}.`);
  }
}

async function checkContentParity() {
  for (const archetype of ARCHETYPES) {
    const contentRoot = path.join(skillRoot, 'templates', archetype, 'src/content');
    if (!existsSync(contentRoot)) continue;

    const files = [];
    for (const file of await listFiles(contentRoot, (name) => name.endsWith('.md') || name.endsWith('.mdx'))) {
      files.push({
        path: normalize(file),
        content: await readFile(file, 'utf8')
      });
    }

    const parity = contentParity(files);
    for (const missing of parity.missing) {
      failures.push(`${archetype}: content id "${missing.id}" missing ${missing.missingLang}.`);
    }
    for (const mismatch of parity.orderMismatches) {
      failures.push(`${archetype}: content id "${mismatch.id}" order mismatch en=${mismatch.enOrder}, zh=${mismatch.zhOrder}.`);
    }
  }
}

// Component CSS files must be reachable through a page-level stylesheet import,
// never only through an island's JS chunk. Assert every src/styles/components/
// *.css is @imported by the template's site.css. Templates without a
// components/ dir (e.g. before the CSS-extraction migration lands) are skipped.
async function checkStylesAggregated() {
  for (const archetype of ARCHETYPES) {
    const stylesRoot = path.join(skillRoot, 'templates', archetype, 'src/styles');
    const componentsRoot = path.join(stylesRoot, 'components');
    const siteCssPath = path.join(stylesRoot, 'site.css');
    if (!existsSync(componentsRoot)) continue;

    if (!existsSync(siteCssPath)) {
      failures.push(`${archetype}: src/styles/components exists but src/styles/site.css is missing.`);
      continue;
    }

    const siteCss = await readFile(siteCssPath, 'utf8');
    const componentCss = (await readdir(componentsRoot, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
      .map((entry) => entry.name);

    for (const missing of unaggregatedComponentStyles(siteCss, componentCss)) {
      failures.push(`${archetype}: src/styles/components/${missing} is not @imported by site.css (orphan-CSS risk).`);
    }
  }
}

async function checkDuplicatedComponents() {
  const componentsDir = (archetype) => path.join(skillRoot, 'templates', archetype, 'src/components');
  const resolve = (archetype, file) => {
    for (const ext of ['.tsx', '.jsx']) {
      const candidate = path.join(componentsDir(archetype), `${file}${ext}`);
      if (existsSync(candidate)) return candidate;
    }
    return null;
  };

  const pairs = [];
  for (const { file, a, b } of DUPLICATED_COMPONENTS) {
    const aPath = resolve(a, file);
    const bPath = resolve(b, file);
    if (!aPath || !bPath) continue;
    pairs.push({
      aPath: normalize(aPath),
      aContent: await readFile(aPath, 'utf8'),
      bPath: normalize(bPath),
      bContent: await readFile(bPath, 'utf8')
    });
  }

  for (const mismatch of duplicatedComponentMismatches(pairs)) {
    failures.push(`Duplicated component drift: ${mismatch.aPath} differs from ${mismatch.bPath}.`);
  }
}

async function listFiles(root, predicate) {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.astro', 'log'].includes(entry.name)) continue;
      out.push(...await listFiles(fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath)) {
      out.push(fullPath);
    }
  }
  return out;
}

function normalize(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}
