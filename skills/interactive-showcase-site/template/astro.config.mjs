import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

// site / base are read from env so the template stays portable: when this
// file ships unchanged inside a user's project, build defaults to base "/"
// (any host). The CI that publishes the showcase to GitHub Pages injects
// BASE_PATH and SITE_URL — see .github/workflows/deploy-template.yml.
const site = process.env.SITE_URL || undefined;
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
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
