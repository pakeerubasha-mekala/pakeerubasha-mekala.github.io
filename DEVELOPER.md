# Developer guide

## Run locally (dev mode)

```sh
cd ~/Work/personal/snigji.com
npm install        # first time only
npm run dev
```

The site is served at http://localhost:4321 and reloads when you edit a file. Press `Ctrl+C` to stop it.

If the port is already taken by a background dev server, stop it first:

```sh
npx astro dev stop
```

### Run the dev server in the background

```sh
npx astro dev --background   # start
npx astro dev status         # check
npx astro dev logs           # see output
npx astro dev stop           # stop
```

If a blog post or file doesn't show up after you add or delete it, restart the dev server.

## Test the production build locally

```sh
npm run build && npm run preview
```

`npm run build` type-checks the project and builds the static site to `./dist`. `npm run preview` serves that build locally.

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

Reading time is calculated automatically. `canonicalUrl` adds an "Also published on ..." link to the post.

## Resume PDF

The resume page (`/resume`) and the PDF are built from the same data files as the home page (`src/data/*.ts`).

- **On deploy:** the GitHub Actions workflow builds the site and then regenerates the PDF into `dist/`, so the live PDF always matches your data. You don't need to do anything.
- **Locally:** `npm run pdf` rebuilds the site and writes `public/pakeeru-basha-mekala-resume.pdf`, which is what the dev server serves for the Download button. It uses a locally installed Chromium-based browser (Chrome, Brave, Edge or Chromium; set `CHROME_PATH` to choose one).

## Interactive extras

- **Terminal, command palette (Ctrl/⌘ + K), boot sequence, Konami code:** try `help` in the terminal on the home page.
- **Live data:** the pipeline status line, the `site-deploy` row, and the terminal commands `git log` and `status` read the public GitHub API for `profile.repo` (set in `src/data/profile.ts`). If you rename the repo, update it there.
- **Recruiter mode:** the header button switches off the effects and shows the clean layout. Decorative elements carry the `fx` class.

## Deploy

Pushing to `main` builds and deploys the site to GitHub Pages through `.github/workflows/deploy.yml`.

Live site: https://pakeerubasha-mekala.github.io
