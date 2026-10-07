# Developer guide

## Run locally (dev mode)

Run these from the project folder.

```sh
cd ~/Work/personal/snigji.com
git pull           # the CMS commits straight to main, so get its changes first
npm install        # first time only
npm run dev
```

The site is served at http://localhost:4321 and reloads when you edit a file. Press `Ctrl+C` to stop it.

### Stop, start and restart

| Goal | Command |
|---|---|
| Start in the foreground (stop with `Ctrl+C`) | `npm run dev` |
| Start in the background (terminal stays free) | `npx astro dev --background` |
| Check whether it is running | `npx astro dev status` |
| See its output and errors | `npx astro dev logs` |
| Stop the background server | `npx astro dev stop` |
| Restart | `npx astro dev stop` then `npx astro dev --background` (or `npm run dev`) |

If `npm run dev` says the port is already in use, a background server is still running. Stop it with `npx astro dev stop`.

### When to restart

The dev server sometimes keeps old files in its cache. Restart it if:

- the page looks unstyled or out of date,
- a new or deleted file (a blog post, a component) doesn't show up,
- you see a 500 error after adding or deleting files.

## Test the production build locally

```sh
npm run build && npm run preview
```

`npm run build` type-checks the project and builds the static site to `./dist`. `npm run preview` serves that build locally.

## Edit from a web UI

Blog posts and the site data (profile, experience, skills, education) can be edited from a browser with Pages CMS, and blog posts have giscus comments. See [CMS.md](./CMS.md) for the one-time setup.

## Add a blog post

```sh
npm run new:post -- "My post title" --tags aws,devops
# optional, if it was first published on Medium:
npm run new:post -- "My post title" --tags aws --medium https://medium.com/@you/your-post
```

This creates `src/content/blog/<slug>.md` with the frontmatter filled in and `draft: true`.

1. Write the post in Markdown and fill in `description`.
2. Put images in `public/blog/<slug>/` and reference them as `/blog/<slug>/name.png`.
3. Drafts show in `npm run dev` only. Set `draft: false` when ready.
4. Commit and push to `main` to publish.

Reading time is calculated automatically. The blog page has a search box (press `/` to focus) that matches title, description, tags and the full post text, plus tag filters; the command palette (Ctrl/⌘ + K) also finds posts by tag and description. Share a filtered view with `/blog?q=oidc&tag=aws`. `canonicalUrl` adds an "Also published on ..." link to the post.

## Resume

Two versions, both built from the same data files (`src/data/*.json`):

- **Designed resume** (`/resume`): one page, dark terminal-style sidebar, Inter font (bundled in `public/fonts/`, so it looks the same on every machine), QR code to the site.
- **ATS-friendly resume** (`/resume-ats`): one page, plain single column in Arial with standard headings, for applicant tracking systems. Not indexed by search engines.

Both use the short `resumeBullets` of each role in `experience.json` (falling back to the full `bullets`), so the website keeps the detail and the resumes stay on one page. Edit them in the CMS under Experience, or in the JSON.

- **On deploy:** GitHub Actions rebuilds both PDFs from the current data (`node scripts/make-pdf.mjs dist`). You don't need to do anything.
- **Locally:** `npm run pdf` rebuilds the site and writes `public/pakeeru-basha-mekala-resume.pdf` and `public/pakeeru-basha-mekala-resume-ats.pdf` (what the dev server serves for the Download buttons). It uses a locally installed Chromium-based browser (Chrome, Brave, Edge or Chromium; set `CHROME_PATH` to choose one). If a PDF spills onto a second page after you add content, shorten the `resumeBullets`.

## Link previews

Every page and post gets a 1200x630 PNG preview card for LinkedIn, Slack and so on (`/og/<name>.png`). The deploy renders them from `src/pages/og-card/[slug].astro` with `node scripts/make-og.mjs dist` and removes the card pages afterwards. Locally, `npm run og` writes them to `public/og/` (only needed to check how a card looks; do not commit them).

## Quality gates

`.github/workflows/quality.yml` runs on pushes to main, pull requests and weekly: internal link check (fails), external link check (warning only), and Lighthouse on the main pages (accessibility and SEO must stay at 90+; performance and best practices only warn, thresholds in `lighthouserc.json`). `.github/dependabot.yml` opens weekly pull requests for outdated npm packages and GitHub Actions.

To run Lighthouse yourself: `npm run build`, serve `dist/`, then `CHROME_PATH="/path/to/chrome" npx lighthouse@12 http://localhost:PORT/ --chrome-flags="--headless=new"`.

## Pages and extras

- **`/work`**: case studies (`src/content/work/*.md`, edited in the CMS). A project in Experience links to its case study when the project name matches the file name, for example `Waitrose` and `waitrose.md`. Add an `impact` list with real, measured results and an Impact section appears on the page.
- **`/status`**: live deploy history, success rate, build times and commit activity, read from the public GitHub API for `profile.repo` (set in `src/data/profile.json`). If you rename the repo, update it there.
- **`/how-its-built`**: the architecture and pipeline of this site.
- **Terminal, command palette (Ctrl/⌘ + K), boot sequence, Konami code:** try `help` in the terminal on the home page. Commands include `ask`, `open`, `theme`, `cat resume`, `git log`, `status` and `matrix`.
- **Themes:** the header button switches light and dark (it follows the system by default). The terminal command `theme amber|cyan|violet|green` changes the accent colour. Both are remembered in the browser.
- **Recruiter mode:** the header button switches off the effects and shows the clean layout. Decorative elements carry the `fx` class.
- **Optional settings:** `bookingUrl` in `profile.json` (a Calendly or Cal.com link) shows a "Book a call" button; `goatcounter` in `src/data/analytics.json` turns on privacy-friendly analytics (create a free site at goatcounter.com first).

## Deploy

Pushing to `main` builds and deploys the site to GitHub Pages through `.github/workflows/deploy.yml`.

Live site: https://pakeerubasha-mekala.github.io

Planning to move to Cloudflare later? See [CLOUDFLARE_MIGRATION.md](./CLOUDFLARE_MIGRATION.md).
