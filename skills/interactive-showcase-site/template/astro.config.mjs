import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
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
