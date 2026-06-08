import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

// site / base are read from env so the template stays portable: when this
// file ships unchanged inside a user's project, build defaults to base "/"
// (any host). The CI that publishes the showcase to GitHub Pages injects
// BASE_PATH and SITE_URL — see .github/workflows/deploy-template.yml.
const site = process.env.SITE_URL || undefined;
const base = process.env.BASE_PATH || '/';

// Split-origin hosts (page on one origin, static assets on a CDN) need an
// `assetsPrefix` separate from `base`. Astro's `base` is a path prefix and
// gets normalised with a leading `/`; stuffing a full URL into it produces
// `/https://cdn.../...` and the page 404s its CSS/JS. When a deploy target
// publishes assets to a separate CDN, pass its absolute URL via ASSETS_PREFIX
// (e.g. ASSETS_PREFIX="$YOUR_HOST_CDN_BASE_URL" astro build).
const assetsPrefix = process.env.ASSETS_PREFIX || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  build: {
    assetsPrefix
  },
  integrations: [
    mdx(),
    svelte()
  ],
  markdown: {
    shikiConfig: {
      // Dual themes: light + dark, switched via [data-theme] on <html>.
      // Astro injects CSS that reacts to a parent with data-theme="dark".
      themes: {
        light: 'min-light',
        dark: 'min-dark'
      },
      defaultColor: false,
      wrap: false
    }
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
});
