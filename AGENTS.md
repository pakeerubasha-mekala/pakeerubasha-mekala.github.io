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

Client-side JavaScript is used for the interactive extras only: the boot sequence (`BootScreen.astro`), terminal (`Terminal.astro`), command palette (`CommandPalette.astro`), light/dark and recruiter-mode toggles (`Header.astro`; state in `localStorage` keys `scheme`, `accent`, `mode`), blog code-copy buttons, the live `/status` page and the `/how-its-built` diagram. Content pages must stay readable without it. Decorative elements carry the `fx` class and are hidden by `html[data-mode="clean"]`.

## Content

- `src/data/*.json`: the editable content (`profile`, `experience`, `skills`, `education`, `projects`, `publications`, `comments`). The matching `src/data/*.ts` files only add TypeScript types and tidy empty list items, and are what pages import. Edit the JSON, not the `.ts`. Empty `projects` or `publications` hide their section; `email` and the GitHub/Stack Overflow links are optional (an empty string hides them).
- `src/content/work/*.md`: case studies (collection `work`). A project in `experience.json` links to `/work/<slug>/` when its lowercased name matches the file name.
- `src/content/blog/*.md`: Astro content collection. Frontmatter: `title`, `description`, `pubDate`, `updatedDate?`, `tags[]`, `draft` (default `false`). The filename is the URL slug. Post images live in `public/blog/`.
- `src/pages/rss.xml.ts` and `@astrojs/sitemap` both read the non-draft blog posts, newest first.

## CMS and comments

`.pages.yml` configures Pages CMS (blog posts and the JSON data files); keep its field names in sync with the JSON and the blog schema in `src/content.config.ts`. Comments are giscus (`src/components/Comments.astro`, config in `src/data/comments.json`). See `CMS.md`.

## Resume, PDFs and previews

`/resume` (designed, one page, Inter font bundled in `public/fonts/`) and `/resume-ats` (plain Arial, one page) both print `resumeBullets` from `experience.json` (fallback `bullets`). `scripts/make-pdf.mjs <dir>` and `scripts/make-og.mjs <dir>` render PDFs and PNG link previews with headless Chromium through `scripts/static-server.mjs` (a built-in static server, so nothing is left running); the deploy workflow runs both into `dist/`. Keep the PDFs at one page each after content changes.

## Quality

`.github/workflows/quality.yml` (link check, Lighthouse via `lighthouserc.json`) and `.github/dependabot.yml`. Colours use CSS `light-dark()` tokens in `src/styles/global.css`; light/dark and accent themes are set with `html[data-scheme]` and `html[data-accent]` (`src/utils/theme.ts`).

## Layout

`src/layouts/Base.astro` is the shared layout (title, description, canonical, OG/Twitter meta, `Header`, `Footer`). Global styles and the dark/light theme variables live in `src/styles/global.css`; page-specific styles are scoped in each `.astro` file.
