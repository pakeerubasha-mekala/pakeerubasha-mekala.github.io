# AGENTS.md

Guidance for coding agents working in this repository. (`CLAUDE.md` is a symlink to this file; edit `AGENTS.md`.)

## Commands

```sh
npm run dev       # astro dev: local dev server at localhost:4321
npm run build     # astro check && astro build: type-checks, then builds the static site to ./dist
npm run preview   # astro preview: serves ./dist locally
```

There is no test suite and no linter. `astro check` (part of `npm run build`) type-checks `.astro`/`.ts` files and validates blog frontmatter against the Zod schema in `src/content.config.ts`.

## Deployment

Static Astro site (`output: 'static'`) deployed to GitHub Pages from `main` by `.github/workflows/deploy.yml`. `astro.config.mjs` sets `site: 'https://pakeerubasha-mekala.github.io'`; keep it in sync with the real URL, since canonical, sitemap and RSS links derive from it.

The site ships no client-side JavaScript by design. Reconsider any feature that seems to need it.

## Content

- `src/data/*.ts`: typed objects consumed by `src/pages/index.astro` (`profile`, `experience`, `skills`, `projects`, `education`, `publications`). Empty `projects` or `publications` hide their section. `email` and the GitHub/Stack Overflow links are optional.
- `src/content/blog/*.md`: Astro content collection. Frontmatter: `title`, `description`, `pubDate`, `updatedDate?`, `tags[]`, `draft` (default `false`). The filename is the URL slug. Post images live in `public/blog/`.
- `src/pages/rss.xml.ts` and `@astrojs/sitemap` both read the non-draft blog posts, newest first.

## Layout

`src/layouts/Base.astro` is the shared layout (title, description, canonical, OG/Twitter meta, `Header`, `Footer`). Global styles and the dark/light theme variables live in `src/styles/global.css`; page-specific styles are scoped in each `.astro` file.
