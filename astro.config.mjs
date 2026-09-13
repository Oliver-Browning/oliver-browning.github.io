// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  // Repo is named oliver-browning.github.io, so GitHub Pages serves it at
  // the domain root with no `base` path (this is GitHub's special-cased
  // "user site" repo name). If the repo is ever renamed to something else
  // (a project-pages repo), set `base: '/<repo-name>'` here. When a custom
  // domain is registered later, just change `site` to the domain root
  // (e.g. "https://example.com") — see MIGRATION.md.
  site: 'https://oliver-browning.github.io',

  integrations: [mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});
