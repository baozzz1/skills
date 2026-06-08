#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ARCHETYPES,
  compareKernelEntries,
  contentParity,
  missingRequiredPaths,
  requiredTemplatePaths,
  scanHexLiterals
} from './lib/template-library-contracts.mjs';

const repoRoot = path.resolve(process.argv[2] ?? process.cwd());
const skillRoot = path.join(repoRoot, 'skills/interactive-showcase-site');
const failures = [];

await checkRequiredPaths();
await checkSkillPathReferences();
await checkSideEffectImports();
await checkHexLiterals();
await checkKernelDrift();
await checkContentParity();

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

async function checkSideEffectImports() {
  for (const archetype of ARCHETYPES) {
    const referencePath = path.join(skillRoot, 'references', `${archetype}.md`);
    const templatePath = path.join(skillRoot, 'templates', archetype);
    if (!existsSync(referencePath) || !existsSync(templatePath)) continue;

    const reference = await readFile(referencePath, 'utf8');
    const components = referencedSvelteComponents(reference);
    if (components.size === 0) continue;

    const pageFiles = await listFiles(path.join(templatePath, 'src/pages'), (file) => file.endsWith('.astro'));
    const pageSource = (await Promise.all(pageFiles.map((file) => readFile(file, 'utf8')))).join('\n');

    for (const component of components) {
      const escaped = component.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sideEffectImport = new RegExp(`import\\s+['"]@/components/${escaped}['"];?`);
      if (!sideEffectImport.test(pageSource)) {
        failures.push(`${archetype}: missing page side-effect import for ${component}.`);
      }
    }
  }
}

function referencedSvelteComponents(markdown) {
  const components = new Set();
  const re = /@\/components\/([A-Za-z0-9_-]+\.svelte)|`([A-Za-z0-9_-]+\.svelte)`/g;
  for (const match of markdown.matchAll(re)) {
    components.add(match[1] ?? match[2]);
  }
  return components;
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
    'src/layouts/BaseLayout.astro',
    'src/i18n/lang.svelte.ts',
    'src/components/ThemeToggle.svelte',
    'src/components/LangToggle.svelte'
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

function isSourceFile(file) {
  return /\.(astro|svelte|css|ts|js|md|mdx)$/.test(file);
}

function normalize(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}
