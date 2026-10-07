// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pakeerubasha-mekala.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Inline the (small) stylesheet so it does not block first paint.
    inlineStylesheets: 'always',
  },
  markdown: {
    // Comments in the default theme fail WCAG contrast; this one passes.
    shikiConfig: { theme: 'github-dark-high-contrast' },
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/og-card/') && !page.includes('/resume-ats') })],
});
